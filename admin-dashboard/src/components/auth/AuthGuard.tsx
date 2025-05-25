import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth'; // Importar o hook de autenticação do novo local

interface AuthGuardProps {
    children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // You can replace this with a more sophisticated loading spinner/component
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verificando autenticação...</div>;
    }

    if (!currentUser) {
        // User not logged in, redirect them to the login page.
        // Pass the current location in state so we can redirect back after login.
        console.log('AuthGuard: Usuário não autenticado, redirecionando para /login');
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // User is logged in, render the requested component.
    console.log('AuthGuard: Usuário autenticado, renderizando children');
    return <>{children}</>;
};

export default AuthGuard;

