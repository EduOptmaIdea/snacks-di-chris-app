import * as admin from "firebase-admin";
import { onCall, onRequest, CallableRequest } from "firebase-functions/v2/https";

// Interfaces para tipagem (opcional manter aqui ou em outro arquivo)
interface CheckPermissionData {
  resource: string;
  operation: string;
}

/**
 * Cloud Function para verificar permissões de usuário
 * Útil para verificações do lado do servidor
 */
export const checkPermission = onCall(
  { region: "southamerica-east1" },
  async (request: CallableRequest<CheckPermissionData>) => {
    const { data, auth } = request;

    if (!auth) {
      return { hasPermission: false };
    }

    const { resource, operation } = data;
    const userId = auth.uid;

    try {
      const userDoc = await admin.firestore()
        .collection("adminUser")
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return { hasPermission: false };
      }

      const userData = userDoc.data();

      if (!userData?.available) {
        return { hasPermission: false };
      }

      if (userData.role === "master") {
        return { hasPermission: true };
      }

      const permissions = userData.permissions || {};
      const resourcePermissions = permissions[resource] || [];

      const hasPermission =
        resourcePermissions.includes(operation) ||
        resourcePermissions.includes("all");

      return { hasPermission };
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      throw new Error("Erro ao verificar permissão.");
    }
  }
);

/**
 * Cloud Function para verificar se um usuário tem acesso a um recurso específico
 * Útil para proteção de rotas no backend
 */
export const validateResourceAccess = onRequest(
  { region: "southamerica-east1" },
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Não autorizado" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const { resource, operation, resourceId } = req.query;

      if (!resource || !operation) {
        res.status(400).json({ error: "Parâmetros inválidos" });
        return;
      }

      const userDoc = await admin.firestore()
        .collection("adminUser")
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        res.status(403).json({ error: "Acesso negado" });
        return;
      }

      const userData = userDoc.data();

      if (!userData?.available) {
        res.status(403).json({ error: "Usuário inativo" });
        return;
      }

      if (userData.role === "master") {
        res.status(200).json({ hasAccess: true });
        return;
      }

      const permissions = userData.permissions || {};
      const resourcePermissions = permissions[resource as string] || [];

      const hasPermission =
        resourcePermissions.includes(operation as string) ||
        resourcePermissions.includes("all");

      if (!hasPermission) {
        res.status(403).json({ error: "Permissão negada" });
        return;
      }

      await admin.firestore()
        .collection("adminUser")
        .doc(userId)
        .collection("activityLog")
        .add({
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          action: "access",
          resource,
          resourceId: resourceId || null,
          details: { operation },
          ipAddress: req.ip || "Desconhecido",
          userAgent: req.headers["user-agent"] || "Desconhecido",
          success: true,
        });

      res.status(200).json({ hasAccess: true });
      return;
    } catch (error) {
      console.error("Erro ao validar acesso:", error);
      res.status(500).json({ error: "Erro interno" });
      return;
    }
  }
);
