import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError, 
  type CallableRequest,
  type CallableOptions,
} from 'firebase-functions/v2/https';

import { onSchedule/*, type ScheduleOptions*/ } from 'firebase-functions/v2/scheduler';

import { logger } from 'firebase-functions/v2';

const db = getFirestore();

// region opcional padrão
const options: CallableOptions = { region: 'southamerica-east1' };
/*const scheduleOptions: ScheduleOptions = { region: 'southamerica-east1' };*/

/**
 * Cloud Function para encerrar todas as sessões de um usuário
 */
export const endAllSessions = onCall(options, async (request: CallableRequest<any>) => {
  const { auth, data, rawRequest } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'O usuário deve estar autenticado para encerrar sessões.');
  }

  const { targetUserId, reason } = data;
  const callerUserId = auth.uid;

  try {
    if (targetUserId !== callerUserId) {
      const callerDoc = await db.collection('adminUser').doc(callerUserId).get();
      if (!callerDoc.exists || callerDoc.data()?.role !== 'master') {
        throw new HttpsError(
          'permission-denied',
          'Apenas o próprio usuário ou um administrador master pode encerrar sessões.'
        );
      }
    }

    const sessionsSnapshot = await db
      .collection('adminUser')
      .doc(targetUserId)
      .collection('sessions')
      .where('active', '==', true)
      .get();

    if (sessionsSnapshot.empty) return { success: true, count: 0 };

    const batch = db.batch();
    sessionsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        endTime: FieldValue.serverTimestamp(),
        active: false,
      });
    });

    await batch.commit();

    const callerData = (await db.collection('adminUser').doc(callerUserId).get()).data();

    await db.collection('adminAuditLog').add({
      timestamp: FieldValue.serverTimestamp(),
      userId: callerUserId,
      userName: callerData?.userName || 'Desconhecido',
      action: 'sessions_terminate',
      resource: 'adminUser',
      resourceId: targetUserId,
      details: {
        count: sessionsSnapshot.size,
        reason: reason || 'Não especificado',
      },
      ipAddress: rawRequest.ip || 'Desconhecido',
      severity: 'warning',
    });

    return { success: true, count: sessionsSnapshot.size };
  } catch (error: any) {
    logger.error('Erro ao encerrar sessões:', error);
    throw new HttpsError('internal', 'Erro ao encerrar sessões.', error.message || error.toString());
  }
});

/**
 * Limpeza diária de sessões antigas (inativas e com mais de 30 dias)
 */
export const cleanupOldSessions = onSchedule(
  { region: 'southamerica-east1', schedule: 'every 24 hours' },
  async (event) => {
    try {
      const usersSnapshot = await db.collection('adminUser').get();
      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        const oldSessionsSnapshot = await db
          .collection('adminUser')
          .doc(userId)
          .collection('sessions')
          .where('active', '==', false)
          .where('endTime', '<', cutoffDate)
          .get();

        if (oldSessionsSnapshot.empty) return 0;

        const batch = db.batch();
        oldSessionsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        return oldSessionsSnapshot.size;
      });

      const results = await Promise.all(promises);
      const totalDeleted = results.reduce((acc, count) => acc + count, 0);
      logger.log(`Limpeza de sessões concluída. ${totalDeleted} sessões antigas removidas.`);
    } catch (error: any) {
      logger.error('Erro na limpeza de sessões:', error);
    }
  }
);


/**
 * Encerrar automaticamente sessões de usuários desativados
 */
export const checkInactiveSessions = onSchedule(
  { region: 'southamerica-east1', schedule: 'every 1 hours' },
  async (event) => {
    try {
      const inactiveUsersSnapshot = await db
        .collection('adminUser')
        .where('available', '==', false)
        .get();

      const promises = inactiveUsersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const activeSessionsSnapshot = await db
          .collection('adminUser')
          .doc(userId)
          .collection('sessions')
          .where('active', '==', true)
          .get();

        if (activeSessionsSnapshot.empty) return 0;

        const batch = db.batch();
        activeSessionsSnapshot.forEach((doc) => {
          batch.update(doc.ref, {
            endTime: FieldValue.serverTimestamp(),
            active: false,
          });
        });

        await batch.commit();

        await db.collection('adminAuditLog').add({
          timestamp: FieldValue.serverTimestamp(),
          userId: 'system',
          userName: 'Sistema',
          action: 'sessions_terminate_auto',
          resource: 'adminUser',
          resourceId: userId,
          details: {
            count: activeSessionsSnapshot.size,
            reason: 'Usuário inativo',
          },
          ipAddress: 'Sistema',
          severity: 'info',
        });

        return activeSessionsSnapshot.size;
      });

      const results = await Promise.all(promises);
      const totalTerminated = results.reduce((acc, count) => acc + count, 0);
      logger.log(`Verificação de sessões concluída. ${totalTerminated} sessões encerradas.`);
    } catch (error: any) {
      logger.error('Erro na verificação de sessões:', error);
    }
  }
);

