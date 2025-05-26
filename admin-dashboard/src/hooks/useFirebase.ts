import { useState, useEffect, useCallback, useContext } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser // Renomear para evitar conflito
} from 'firebase/auth';
import {
  getFirestore, 
  doc, 
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import {
  getFunctions, 
  httpsCallable, 
  Functions 
} from 'firebase/functions';

// --- Interfaces --- 
// Importar ou definir as interfaces conforme o AuthContext.tsx
// Assumindo que AuthContext.tsx exporta AuthContextType e AdminUserData
import { AuthContextType, AdminUserData } from '../context/AuthContext'; // Ajuste o caminho conforme necessário

// --- Configuração do Firebase --- 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
const functions: Functions = getFunctions(app, 'southamerica-east1');

// --- Contexto de Autenticação --- 
// Usar o contexto exportado pelo AuthContext.tsx
import { AuthContext } from '../context/AuthContext'; // Ajuste o caminho

// --- AuthProvider --- 
// O Provider deve ser implementado em um arquivo separado (ex: AuthProvider.tsx)
// que usa o hook useFirebaseAuth internamente.
// Este arquivo (useFirebase.ts) deve exportar apenas os hooks.

// --- Hook Interno de Autenticação (Lógica Principal) ---
// Este hook agora retorna os valores esperados pelo AuthContextType

// @ts-expect-error // Suprime TypeScript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
 function useFirebaseAuthInternal(): Omit<AuthContextType, 'login' | 'logout'> & { 
     setAdminUserDirectly: (data: AdminUserData | null) => void // Helper para testes ou casos específicos
 } {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [adminUserData, setAdminUserData] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setLoading(true);
      setError(null);
      setCurrentUser(userAuth); // Define o usuário do Firebase Auth

      if (userAuth) {
        // Se autenticado, busca dados do Firestore
        try {
          const userDocRef = doc(db, "adminUser", userAuth.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data();
            // Mapeia os dados do Firestore para a interface AdminUserData
            const adminData: AdminUserData = {
              uid: userAuth.uid, // Garante que o uid está presente
              email: userAuth.email, // Pega do Auth ou Firestore?
              role: firestoreData.role,
              available: firestoreData.available,
              permissions: firestoreData.permissions,
              fullName: firestoreData.fullName,
              userName: firestoreData.userName,
              avatar: firestoreData.avatar,
              // Adicione outros campos mapeados aqui
            };
            setAdminUserData(adminData);
          } else {
            console.error("Usuário autenticado não encontrado na coleção adminUser.");
            setError("Dados de usuário administrativo não encontrados.");
            setAdminUserData(null); 
            // Considerar logout se dados admin são essenciais?
            // await signOut(auth);
          }
        } catch (err: unknown) {
          console.error("Erro ao buscar dados do adminUser:", err);
          setError("Erro ao carregar dados do usuário administrativo.");
          setAdminUserData(null); 
        }
      } else {
        // Se não autenticado, limpa os dados admin também
        setAdminUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    currentUser, // Objeto do Firebase Auth
    adminUser: adminUserData, // Objeto com dados do Firestore
    loading,
    error,
    setAdminUserDirectly: setAdminUserData // Expor setter para casos específicos
  };
}

// --- AuthProvider Component (Deve ficar em seu próprio arquivo, ex: src/context/AuthProvider.tsx) ---
// Este é um exemplo de como o AuthProvider usaria os hooks
/*
import React, { ReactNode } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { useFirebaseAuthInternal, useAuthActions } from '../hooks/useFirebase'; // Ajuste o caminho

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, adminUser, loading, error } = useFirebaseAuthInternal();
  const { login, logout } = useAuthActions(); // Ações separadas

  const contextValue: AuthContextType = {
    currentUser,
    adminUser,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
*/

// --- Hook de Ações de Autenticação (Separado para melhor organização) ---
// Interface para dados de atividade (exemplo)
interface ActivityLogData {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  success: boolean;
}

export function useAuthActions() {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Pegar currentUser de dentro se precisar logar quem fez logout
  // const { currentUser } = useFirebaseAuthInternal(); // Cuidado com dependência circular se não estruturar bem

  const logActivity = useCallback(async (data: ActivityLogData) => {
    try {
      const logFunction = httpsCallable<ActivityLogData, void>(functions, 'logActivity');
      await logFunction(data);
    } catch (err) {
      console.error("Erro ao registrar atividade:", err);
    }
  }, []); // Removido 'functions' da dependência

  const login = async (email: string, password: string): Promise<FirebaseAuthUser | null> => {
    setActionError(null);
    setActionLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // O listener onAuthStateChanged no useFirebaseAuthInternal cuidará de atualizar os estados
      await logActivity({
        action: 'login',
        resource: 'adminUser',
        resourceId: userCredential.user.uid,
        details: { method: 'email' },
        success: true
      });
      return userCredential.user;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no login";
      setActionError(errorMessage);
      await logActivity({
        action: 'login',
        resource: 'adminUser',
        details: { method: 'email', error: errorMessage },
        success: false
      });
      return null; 
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async (userIdToLog?: string): Promise<void> => {
    setActionError(null);
    setActionLoading(true);
    try {
      if (userIdToLog) { // Passar o UID do usuário que está deslogando
        await logActivity({
          action: 'logout',
          resource: 'adminUser',
          resourceId: userIdToLog,
          success: true
        });
      }
      await signOut(auth);
      // O listener onAuthStateChanged cuidará de limpar os estados
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido no logout";
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    login,
    logout,
    loading: actionLoading,
    error: actionError
  };
}

// --- Hook useAuth (Exportado para uso nos componentes) ---
// Este hook simplesmente consome o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// --- Outros Hooks (usePermissionsCheck, useUserManagement) --- 
// Manter como antes, mas ajustar para usar `adminUser` do `useAuth` se necessário

export function usePermissionsCheck() {
  const { adminUser } = useAuth(); // Usar adminUser do contexto

  const hasPermission = useCallback((resource: keyof AdminUserData['permissions'], operation: 'read' | 'write' | 'delete'): boolean => {
    // Ajustar a chave do recurso se necessário (ex: 'adminUser' vs 'users')
    const resourceKey = resource as keyof NonNullable<AdminUserData['permissions']>; 

    if (!adminUser || !adminUser.available) return false;
    if (adminUser.role === 'master') return true;
    
    const resourcePermissions = adminUser.permissions?.[resourceKey] || [];
    return resourcePermissions.includes(operation);

  }, [adminUser]);

  return { hasPermission };
}

// Interface para dados de usuário gerenciados (exemplo)
interface ManagedUserData {
  id: string;
  fullName?: string;
  userName?: string;
  email?: string;
  role?: string;
  available?: boolean;
  lastLogin?: string | Timestamp; // Ajustar tipo conforme necessário
  createdAt?: string | Timestamp;
  // Adicione outros campos conforme necessário
}

export function useUserManagement() {
  const [users, setUsers] = useState<ManagedUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const { adminUser } = useAuth(); // Para logar quem fez a ação, se necessário

  const logActivity = useCallback(async (data: Omit<ActivityLogData, 'success'> & { success?: boolean }) => {
      try {
          const logFunction = httpsCallable<ActivityLogData, void>(functions, 'logActivity');
          await logFunction({ ...data, success: data.success ?? true });
      } catch (err) {
          console.error("Erro ao registrar atividade (UserManagement):", err);
      }
  }, []); // Removido 'functions' da dependência

  const fetchUsers = useCallback(async (): Promise<ManagedUserData[]> => {
    setError(null);
    setLoading(true);
    try {
      console.warn("fetchUsers: Usando dados mockados!");
      const mockUsers: ManagedUserData[] = [
        { id: '1', fullName: 'Carlos Eduardo de Souza', userName: 'EduSouza', email: 'edu.souza@example.com', role: 'master', available: true, lastLogin: '22 de maio de 2025 às 12:36:30 UTC-3', createdAt: '22 de maio de 2025 às 12:34:16 UTC-3' },
        { id: '2', fullName: 'Maria Silva', userName: 'MariaS', email: 'maria.silva@example.com', role: 'admin', available: true, lastLogin: '21 de maio de 2025 às 10:15:22 UTC-3', createdAt: '15 de maio de 2025 às 09:30:00 UTC-3' },
        { id: '3', fullName: 'João Pereira', userName: 'JoaoP', email: 'joao.pereira@example.com', role: 'editor', available: false, createdAt: '10 de maio de 2025 às 14:22:45 UTC-3' }
      ];
      setUsers(mockUsers);
      return mockUsers;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar usuários";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (userId: string): Promise<ManagedUserData | null> => {
    setError(null);
    setLoading(true);
    try {
      console.warn(`getUser (${userId}): Usando dados mockados!`);
      const user = users.find(u => u.id === userId);
      return user || null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao buscar usuário";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [users]); 

  interface UserInputData {
      fullName?: string;
      userName?: string;
      email?: string;
      role?: string;
      available?: boolean;
      permissions?: AdminUserData['permissions']; // Usar tipo de permissão definido
      password?: string; 
  }

  const createUser = async (userData: UserInputData): Promise<ManagedUserData> => {
    setError(null);
    setLoading(true);
    const detailsToLog = { ...userData };
    if (detailsToLog.password) detailsToLog.password = '[REDACTED]';

    try {
      console.warn('createUser: Chamada simulada!');
      const newUser = { id: `new-${Date.now()}`, ...userData };
      delete newUser.password;
      
      await logActivity({
        action: 'create',
        resource: 'adminUser',
        details: { userData: detailsToLog },
        success: true
      });
      setUsers(prev => [...prev, newUser as ManagedUserData]);
      return newUser as ManagedUserData;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao criar usuário";
      setError(errorMessage);
      await logActivity({
        action: 'create',
        resource: 'adminUser',
        details: { error: errorMessage, inputData: detailsToLog },
        success: false
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserInputData>): Promise<ManagedUserData> => {
    setError(null);
    setLoading(true);
    try {
      console.warn(`updateUser (${userId}): Chamada simulada!`);
      const updatedUser = { id: userId, ...userData };
      
      await logActivity({
        action: 'update',
        resource: 'adminUser',
        resourceId: userId,
        details: { changes: userData },
        success: true
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
      return updatedUser as ManagedUserData;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao atualizar usuário";
      setError(errorMessage);
      await logActivity({
        action: 'update',
        resource: 'adminUser',
        resourceId: userId,
        details: { error: errorMessage, changes: userData },
        success: false
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      console.warn(`deleteUser (${userId}): Chamada simulada!`);
      
      await logActivity({
        action: 'delete',
        resource: 'adminUser',
        resourceId: userId,
        success: true
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao excluir usuário";
      setError(errorMessage);
      await logActivity({
        action: 'delete',
        resource: 'adminUser',
        resourceId: userId,
        details: { error: errorMessage },
        success: false
      });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  };
}

