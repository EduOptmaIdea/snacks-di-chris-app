import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import LoginPage from './components/auth/LoginPage';
import AuthGuard from './components/auth/AuthGuard'; // Import AuthGuard
import './App.css';

// Importar componentes reais
import Categories from './components/categories/Categories'; // Importar o componente real
import Products from './components/products/Products'; // Importar o componente real
import Ingredients from './components/ingredients/Ingredients';
import Alergenics from './components/alergenics/Alergenics'; // Importar o componente real

// Placeholder components for other routes (replace with actual components later)
const Users = () => <div>Página de Usuários</div>;
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
                            {/* Usar o componente Categories real */}
                            <Layout><Categories /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/products"
                    element={
                        <AuthGuard>
                            {/* Usar o componente Products real */}
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
                <Route
                    path="/admin/ingredients"
                    element={
                        <AuthGuard>
                            <Layout><Ingredients /></Layout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/admin/alergenics"
                    element={
                        <AuthGuard>
                            <Layout><Alergenics /></Layout>
                        </AuthGuard>
                    }
                />

                {/* Rota padrão - Redireciona para /login se não autenticado, ou /admin/dashboard se autenticado */}
                {/* O AuthGuard dentro da rota /admin/dashboard cuidará do redirecionamento se autenticado */}
                <Route
                    path="*"
                    element={<Navigate to="/admin/login" replace />} // Redireciona qualquer outra rota para login por padrão
                />
            </Routes>
        </Router>
    );
}

export default App;

