import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFunctions, 
  httpsCallable 
} from 'firebase/functions';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDQqcLpqTI-DxfxL1NMH9Mh1x-gnbV_IeQ",
  authDomain: "snack-di-chris-app.firebaseapp.com",
  projectId: "snack-di-chris-app",
  storageBucket: "snack-di-chris-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

// Hook para autenticação
export function useAuth() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Registrar atividade de login
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'login',
        resource: 'adminUser',
        resourceId: userCredential.user.uid,
        details: { method: 'email' },
        success: true
      });
      
      return userCredential.user;
    } catch (err: any) {
      setError(err.message);
      
      // Registrar tentativa de login falha
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'login',
        resource: 'adminUser',
        details: { method: 'email', error: err.message },
        success: false
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      setLoading(true);
      
      // Registrar atividade de logout
      if (currentUser) {
        const logActivity = httpsCallable(functions, 'logActivity');
        await logActivity({
          action: 'logout',
          resource: 'adminUser',
          resourceId: currentUser.uid,
          success: true
        });
      }
      
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    error,
    login,
    logout
  };
}

// Hook para verificação de permissões
export function usePermissions() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!currentUser) {
        setPermissions(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const checkPermission = httpsCallable(functions, 'checkPermission');
        const result = await checkPermission({});
        setPermissions(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [currentUser]);

  const hasPermission = (resource: string, operation: 'read' | 'write' | 'delete') => {
    if (!permissions) return false;
    return permissions[resource]?.[operation] === true;
  };

  return {
    permissions,
    loading,
    error,
    hasPermission
  };
}

// Hook para gerenciamento de usuários
export function useUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setError(null);
    try {
      setLoading(true);
      // Implementar chamada para função Cloud que busca usuários
      // Esta é uma simulação
      const mockUsers = [
        {
          id: '1',
          fullName: 'Carlos Eduardo de Souza',
          userName: 'EduSouza',
          email: 'edu.souza@example.com',
          role: 'master',
          available: true,
          lastLogin: '22 de maio de 2025 às 12:36:30 UTC-3',
          createdAt: '22 de maio de 2025 às 12:34:16 UTC-3'
        },
        {
          id: '2',
          fullName: 'Maria Silva',
          userName: 'MariaS',
          email: 'maria.silva@example.com',
          role: 'admin',
          available: true,
          lastLogin: '21 de maio de 2025 às 10:15:22 UTC-3',
          createdAt: '15 de maio de 2025 às 09:30:00 UTC-3'
        },
        {
          id: '3',
          fullName: 'João Pereira',
          userName: 'JoaoP',
          email: 'joao.pereira@example.com',
          role: 'editor',
          available: false,
          createdAt: '10 de maio de 2025 às 14:22:45 UTC-3'
        }
      ];
      
      setUsers(mockUsers);
      return mockUsers;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (userId: string) => {
    setError(null);
    try {
      setLoading(true);
      // Implementar chamada para função Cloud que busca um usuário específico
      // Esta é uma simulação
      const user = users.find(u => u.id === userId);
      return user || null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    setError(null);
    try {
      setLoading(true);
      // Implementar chamada para função Cloud que cria um usuário
      // Esta é uma simulação
      console.log('Criando usuário:', userData);
      
      // Registrar atividade
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'create',
        resource: 'adminUser',
        details: { userData: { ...userData, password: '[REDACTED]' } },
        success: true
      });
      
      return { id: 'new-user-id', ...userData };
    } catch (err: any) {
      setError(err.message);
      
      // Registrar erro
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'create',
        resource: 'adminUser',
        details: { error: err.message },
        success: false
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    setError(null);
    try {
      setLoading(true);
      // Implementar chamada para função Cloud que atualiza um usuário
      // Esta é uma simulação
      console.log('Atualizando usuário:', userId, userData);
      
      // Registrar atividade
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'update',
        resource: 'adminUser',
        resourceId: userId,
        details: { changes: userData },
        success: true
      });
      
      return { id: userId, ...userData };
    } catch (err: any) {
      setError(err.message);
      
      // Registrar erro
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'update',
        resource: 'adminUser',
        resourceId: userId,
        details: { error: err.message },
        success: false
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setError(null);
    try {
      setLoading(true);
      // Implementar chamada para função Cloud que exclui um usuário
      // Esta é uma simulação
      console.log('Excluindo usuário:', userId);
      
      // Registrar atividade
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'delete',
        resource: 'adminUser',
        resourceId: userId,
        success: true
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      
      // Registrar erro
      const logActivity = httpsCallable(functions, 'logActivity');
      await logActivity({
        action: 'delete',
        resource: 'adminUser',
        resourceId: userId,
        details: { error: err.message },
        success: false
      });
      
      throw err;
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

export default {
  useAuth,
  usePermissions,
  useUserManagement
};
