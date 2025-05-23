import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Verifica se o usuário atual tem uma determinada permissão
 * @param {string} resource - Recurso a ser verificado (products, categories, users, etc.)
 * @param {string} operation - Operação a ser verificada (read, write, delete)
 * @returns {Promise<boolean>} - Se o usuário tem a permissão
 */
export async function hasPermission(resource, operation) {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false;
    }
    
    const userDoc = await getDoc(doc(db, "adminUser", currentUser.uid));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Verificar se o usuário está ativo
    if (!userData.available) {
      return false;
    }
    
    // Master tem todas as permissões
    if (userData.role === "master") {
      return true;
    }
    
    // Verificar permissões específicas
    const permissions = userData.permissions || {};
    const resourcePermissions = permissions[resource] || [];
    
    return resourcePermissions.includes(operation) || resourcePermissions.includes("all");
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return false;
  }
}

/**
 * Hook React para verificar permissões
 * @param {string} resource - Recurso a ser verificado
 * @param {string} operation - Operação a ser verificada
 * @returns {Object} - Estado da permissão
 */
export function usePermission(resource, operation) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkPermission = async () => {
      setLoading(true);
      const result = await hasPermission(resource, operation);
      setHasAccess(result);
      setLoading(false);
    };
    
    checkPermission();
  }, [resource, operation]);
  
  return { hasAccess, loading };
}

/**
 * Verifica se o usuário atual é um administrador (master ou admin)
 * @returns {Promise<boolean>} - Se o usuário é administrador
 */
export async function isAdmin() {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false;
    }
    
    const userDoc = await getDoc(doc(db, "adminUser", currentUser.uid));
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    
    // Verificar se o usuário está ativo
    if (!userData.available) {
      return false;
    }
    
    // Verificar função
    return ["master", "admin"].includes(userData.role);
  } catch (error) {
    console.error("Erro ao verificar se é admin:", error);
    return false;
  }
}

/**
 * Obtém todas as permissões do usuário atual
 * @returns {Promise<Object>} - Objeto com as permissões do usuário
 */
export async function getUserPermissions() {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return {};
    }
    
    const userDoc = await getDoc(doc(db, "adminUser", currentUser.uid));
    
    if (!userDoc.exists()) {
      return {};
    }
    
    const userData = userDoc.data();
    
    // Verificar se o usuário está ativo
    if (!userData.available) {
      return {};
    }
    
    // Master tem todas as permissões
    if (userData.role === "master") {
      return {
        products: ["read", "write", "delete"],
        categories: ["read", "write", "delete"],
        ingredients: ["read", "write", "delete"],
        allergenicAgents: ["read", "write", "delete"],
        users: ["read", "write", "delete"],
        audit: ["read"]
      };
    }
    
    // Retornar permissões específicas
    return userData.permissions || {};
  } catch (error) {
    console.error("Erro ao obter permissões:", error);
    return {};
  }
}
