import * as admin from "firebase-admin";
import { CallableRequest, onCall } from "firebase-functions/v2/https";
import {
  onDocumentWritten,
  FirestoreEvent,
  DocumentSnapshot,
  Change,
} from "firebase-functions/v2/firestore";

// Interfaces para tipagem (mantidas iguais)
interface ActivityData {
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, any>;
  success?: boolean;
}

interface AdminUserData {
  fullName?: string;
  userName?: string;
  available: boolean;
  role: string;
  lastUpdatedBy?: string;
  createdBy?: string;
  permissions?: Record<string, string[]>;
}

interface AuditLogData {
  timestamp: admin.firestore.Timestamp;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: Record<string, any>;
  ipAddress: string;
  severity: "info" | "warning" | "critical";
}

/**
 * Cloud Function que registra atividades importantes no sistema
 */
export const logActivity = onCall<ActivityData>(
  {
    cors: true,
    region: "southamerica-east1", // Defina a região aqui
  },
  async (request: CallableRequest<ActivityData>) => {
    // Implementação mantida igual
  }
);

/**
 * Trigger que registra automaticamente alterações em documentos de usuário
 */
export const trackUserChanges = onDocumentWritten(
  {
    document: "adminUser/{userId}",
    region: "southamerica-east1", // Adicione sua região se necessário
  },
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { userId: string }
    >
  ) => {
    if (!event?.data) {
      return null;
    }

    const userId = event.params.userId;
    const change = event.data;

    // Se o documento foi excluído
    if (!change.after.exists) {
      return null;
    }

    const afterData = change.after.data() as AdminUserData;

    // Documento novo
    if (!change.before.exists) {
      const auditLogData: AuditLogData = {
        timestamp: admin.firestore.Timestamp.now(),
        userId,
        userName: afterData.userName || afterData.fullName || "Desconhecido",
        action: "user_create",
        resource: "adminUser",
        resourceId: userId,
        details: {
          role: afterData.role || "unknown",
          createdBy: afterData.createdBy || "system",
        },
        ipAddress: "Sistema",
        severity: "info",
      };

      return admin.firestore().collection("adminAuditLog").add(auditLogData);
    }

    // Documento atualizado
    const beforeData = change.before.data() as AdminUserData;
    const changes: Record<string, { from: any; to: any }> = {};

    if (beforeData.available !== afterData.available) {
      changes.available = {
        from: beforeData.available,
        to: afterData.available,
      };
    }

    if (beforeData.role !== afterData.role) {
      changes.role = {
        from: beforeData.role,
        to: afterData.role,
      };
    }

    if (Object.keys(changes).length > 0) {
      const auditLogData: AuditLogData = {
        timestamp: admin.firestore.Timestamp.now(),
        userId,
        userName: afterData.userName || afterData.fullName || "Desconhecido",
        action: "user_update",
        resource: "adminUser",
        resourceId: userId,
        details: {
          changes,
          updatedBy: afterData.lastUpdatedBy || "system",
        },
        ipAddress: "Sistema",
        severity: "info",
      };

      return admin.firestore().collection("adminAuditLog").add(auditLogData);
    }

    return null;
  }
);
