import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

import {
  onCall,
  HttpsError,
  type CallableRequest,
  type CallableOptions,
} from 'firebase-functions/v2/https';

import { logger } from 'firebase-functions/v2';

const db = getFirestore();
const auth = getAuth();

const callableOptions: CallableOptions = { region: 'southamerica-east1' };

/**
 * Cloud Function para inicializar o sistema com o primeiro usuário master
 * Deve ser chamada apenas uma vez durante a configuração inicial
 */
export const initializeSystem = onCall(callableOptions, async (request: CallableRequest<any>) => {
  try {
    const { email, password, fullName, userName, whatsapp, telefone } = request.data;

    if (!email || !password || !fullName || !userName || !whatsapp) {
      throw new HttpsError('invalid-argument', 'Dados incompletos para criação do usuário master.');
    }

    // Verificar se já existem usuários no sistema
    const usersSnapshot = await db.collection('adminUser').limit(1).get();
    if (!usersSnapshot.empty) {
      throw new HttpsError(
        'failed-precondition',
        'O sistema já foi inicializado. Não é possível criar o usuário master inicial.'
      );
    }

    // Criar usuário no Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    const uid = userRecord.uid;

    // Criar documento no Firestore
    await db.collection('adminUser').doc(uid).set({
      fullName,
      userName,
      whatsapp,
      telefone: telefone || null,
      email,
      role: 'master',
      permissions: {
        products: ['read', 'write', 'delete'],
        categories: ['read', 'write', 'delete'],
        ingredients: ['read', 'write', 'delete'],
        allergenicAgents: ['read', 'write', 'delete'],
        users: ['read', 'write', 'delete'],
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'system',
      lastUpdatedBy: 'system',
      available: true,
      releaseDate: null,
      lastLogin: null,
      loginCount: 0,
      notes: 'Usuário master inicial do sistema',
    });

    // Configurar notificações padrão
    await db.collection('adminUser').doc(uid).collection('notificationSettings').add({
      type: 'email',
      enabled: true,
      events: ['user_login', 'password_reset', 'system_update'],
      frequency: 'immediate',
    });

    // Registrar no log de auditoria
    await db.collection('adminAuditLog').add({
      timestamp: FieldValue.serverTimestamp(),
      userId: uid,
      userName,
      action: 'system_initialization',
      resource: 'adminUser',
      resourceId: uid,
      details: { initialSetup: true },
      ipAddress: request.rawRequest?.ip || 'Desconhecido',
      severity: 'info',
    });

    return { success: true, uid };
  } catch (error: any) {
    logger.error('Erro na inicialização do sistema:', error);
    throw new HttpsError('internal', 'Erro ao inicializar o sistema.', error.message || error.toString());
  }
});
