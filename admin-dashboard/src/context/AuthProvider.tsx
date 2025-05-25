import React, { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../src/firebase'; // Adjust path if firebase config is elsewhere
import { AuthContext, AdminUserData } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    console.log("[AuthProvider] Component rendering..."); // Log de renderização
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<AdminUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Listener for Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("[AuthProvider] Auth state changed. User:", user?.uid || "null");
            setCurrentUser(user);
            setAdminUser(null); // Reset admin user data on auth change
            setError(null); // Clear previous errors
            setLoading(true); // Set loading true while fetching admin data

            if (user) {
                console.log('Usuário autenticado:', user.uid);
                // User is signed in, fetch their data from adminUser collection
                try {
                    console.log(`[AuthProvider] Buscando documento adminUser para UID: ${user.uid}`);
                    const userDocRef = doc(db, 'adminUser', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    console.log(`[AuthProvider] Documento adminUser existe? ${userDocSnap.exists()}`);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data() as Omit<AdminUserData, 'uid'>; // Cast data, uid comes from auth
                        console.log('Dados do adminUser encontrados:', userData);
                        setAdminUser({
                            ...userData,
                            uid: user.uid,
                            email: user.email, // Prioritize Auth email
                        });
                    } else {
                        console.warn(`Documento adminUser não encontrado para UID: ${user.uid}`);
                        // Handle case where user is authenticated but has no adminUser record
                        // Option 1: Set minimal adminUser data
                        setAdminUser({ uid: user.uid, email: user.email });
                        // Option 2: Set error or specific state
                        // setError('Dados administrativos não encontrados para este usuário.');
                        // Option 3: Log them out if adminUser record is required
                        // await auth.signOut(); 
                    }
                } catch (err) {
                    console.error('Erro ao buscar dados do adminUser:', err);
                    setError('Falha ao carregar dados do usuário administrativo.');
                    // Optionally sign out the user if admin data is critical
                    // await auth.signOut();
                }
            } else {
                // User is signed out
                console.log('Nenhum usuário autenticado.');
            }
            setLoading(false); // Auth check finished
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const value = {
        currentUser,
        adminUser,
        loading,
        error,
    };

    // Don't render children until loading is false to prevent flicker or showing protected content briefly
    // Or, render children immediately and let protected routes handle loading state
    return (
        <AuthContext.Provider value={value}>
            {/* Render children immediately and let consumers handle loading state */}
            {children}
            {/* Or conditionally render based on loading state: */}
            {/* {!loading ? children : <div>Verificando autenticação...</div>} */}
        </AuthContext.Provider>
    );
};


