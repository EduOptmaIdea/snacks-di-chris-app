import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';

const db = getFirestore();

/**
 * Cloud Function para verificar e desativar usuários expirados
 * Executada diariamente
 */
export const checkExpiredUsers = onSchedule(
  { region: 'southamerica-east1', schedule: 'every 24 hours' },
  async (event) => {
    try {
      const now = Timestamp.now();

      // Buscar usuários com releaseDate no passado e ainda ativos
      const expiredUsersSnapshot = await db
        .collection('adminUser')
        .where('available', '==', true)
        .where('releaseDate', '<', now)
        .get();

      if (expiredUsersSnapshot.empty) {
        logger.log('Nenhum usuário expirado encontrado.');
        return;  // retornando void
      }

      const batch = db.batch();
      const expiredUserIds: string[] = [];

      // Desativar cada usuário expirado
      expiredUsersSnapshot.forEach(doc => {
        expiredUserIds.push(doc.id);
        batch.update(doc.ref, {
          available: false,
          updatedAt: FieldValue.serverTimestamp(),
          lastUpdatedBy: 'system',
        });
      });

      await batch.commit();

      // Registrar no log de auditoria
      const auditPromises = expiredUserIds.map(userId =>
        db.collection('adminAuditLog').add({
          timestamp: FieldValue.serverTimestamp(),
          userId: 'system',
          userName: 'Sistema',
          action: 'user_deactivate_auto',
          resource: 'adminUser',
          resourceId: userId,
          details: {
            reason: 'Data de liberação expirada',
          },
          ipAddress: 'Sistema',
          severity: 'info',
        })
      );

      await Promise.all(auditPromises);

      // Encerrar sessões ativas dos usuários desativados
      const sessionPromises = expiredUserIds.map(async userId => {
        const activeSessionsSnapshot = await db
          .collection('adminUser')
          .doc(userId)
          .collection('sessions')
          .where('active', '==', true)
          .get();

        if (activeSessionsSnapshot.empty) {
          return 0;
        }

        const sessionBatch = db.batch();
        activeSessionsSnapshot.forEach(doc => {
          sessionBatch.update(doc.ref, {
            endTime: FieldValue.serverTimestamp(),
            active: false,
          });
        });

        await sessionBatch.commit();
        return activeSessionsSnapshot.size;
      });

      await Promise.all(sessionPromises);

      logger.log(`${expiredUserIds.length} usuários expirados foram desativados.`);
      return;  // retornando void
    } catch (error: any) {
      logger.error('Erro ao verificar usuários expirados:', error);
      return;  // retornando void
    }
  }
);
