import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Registra uma atividade de usuário no sistema
 * @param {string} userId - ID do usuário que realizou a ação
 * @param {string} action - Tipo de ação (login, logout, create, update, delete, view)
 * @param {string} resource - Recurso afetado (products, categories, users, etc.)
 * @param {string} resourceId - ID do recurso afetado (opcional)
 * @param {Object} details - Detalhes adicionais da ação
 * @param {boolean} success - Se a ação foi bem-sucedida
 * @returns {Promise<void>}
 */
export async function logUserActivity(
  userId,
  action,
  resource,
  resourceId = null,
  details = {},
  success = true
) {
  try {
    // Obter informações do navegador/dispositivo
    const userAgent = navigator.userAgent;
    
    // Obter IP do cliente (em produção, isso geralmente é feito no backend)
    let ipAddress = "local";
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json" );
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (error) {
      console.error("Erro ao obter IP:", error);
    }
    
    // Referência à subcoleção activityLog do usuário
    const activityLogRef = collection(db, "adminUser", userId, "activityLog");
    
    // Adicionar novo documento de log
    await addDoc(activityLogRef, {
      timestamp: serverTimestamp(),
      action: action,
      resource: resource,
      resourceId: resourceId,
      details: details,
      ipAddress: ipAddress,
      userAgent: userAgent,
      success: success
    });
    
    // Adicionar ao log de auditoria global para ações importantes
    if (["create", "update", "delete"].includes(action) || 
        resource === "adminUser" || 
        !success) {
      
      const auditLogRef = collection(db, "adminAuditLog");
      const currentUser = auth.currentUser;
      
      await addDoc(auditLogRef, {
        timestamp: serverTimestamp(),
        userId: userId,
        userName: currentUser?.displayName || 
                 (await getDoc(doc(db, "adminUser", userId))).data()?.userName || 
                 "Desconhecido",
        action: `${resource}_${action}`,
        resource: resource,
        resourceId: resourceId,
        details: details,
        ipAddress: ipAddress,
        severity: action === "delete" ? "warning" : 
                 !success ? "warning" : "info"
      });
    }
    
    console.log("Atividade registrada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
    // Não lançar erro para evitar interrupção do fluxo principal
    return false;
  }
}