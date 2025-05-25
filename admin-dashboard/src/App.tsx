import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from '../../src/admin/pages/Dashboard.jsx'; // Dashboard component
import LoginPage from '../../src/admin/pages/LoginPage.jsx'; // Actual Login page
import AuthGuard from './components/auth/AuthGuard'; // Import AuthGuard
import './App.css';

// Placeholder components for other routes (replace with actual components later)
const Users = () => <div>Página de Usuários</div>;
const Categories = () => <div>Página de Categorias</div>;
const Products = () => <div>Página de Produtos</div>;
const Permissions = () => <div>Página de Permissões</div>;
const Settings = () => <div>Página de Configurações</div>;

function App() {
    return (
        <Router>
            <Routes>
                {/* Rota de Login - Não protegida */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* Rotas Administrativas - Protegidas pelo AuthGuard */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard>
                            {/* Redireciona /admin para /admin/dashboard */}
                            <Navigate to="/admin/dashboard" replace />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <AuthGuard>
                            <Layout><Dashboard /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AuthGuard>
                            <Layout><Users /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/categories"
                    element={
                        <AuthGuard>
                            <Layout><Categories /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <AuthGuard>
                            <Layout><Products /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/permissions"
                    element={
                        <AuthGuard>
                            <Layout><Permissions /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <AuthGuard>
                            <Layout><Settings /></Layout>
                        </AuthGuard>
                    }
                />

                {/* Rota padrão - Redireciona para /login se não autenticado, ou /admin/dashboard se autenticado */}
                {/* O AuthGuard dentro da rota /admin/dashboard cuidará do redirecionamento se autenticado */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />} // Redireciona qualquer outra rota para login por padrão
                />
            </Routes>
        </Router>
    );
}

export default App;
