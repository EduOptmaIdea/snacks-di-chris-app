import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { signOut } from 'firebase/auth'; // Import signOut
import { auth } from '../../../../src/firebase'; // Import auth instance
import {
    UsersIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    HomeIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

interface SidebarProps {
    isMobile: boolean;
    toggleSidebar?: () => void;
}

const Sidebar = ({ isMobile, toggleSidebar }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // State for logout process

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Handle Logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            console.log('Logout bem-sucedido.');
            navigate("/admin/login"); // Redirect to admin login page after logout
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao tentar sair. Tente novamente.'); // Inform user about error
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        { name: 'Usuários', path: '/admin/users', icon: UsersIcon },
        { name: 'Categorias', path: '/admin/categories', icon: DocumentTextIcon },
        { name: 'Produtos', path: '/admin/products', icon: ChartBarIcon },
        { name: 'Permissões', path: '/admin/permissions', icon: ShieldCheckIcon },
        { name: 'Configurações', path: '/admin/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className={`bg-[#a9373e] text-white transition-all duration-300 ${isCollapsed ? 'w-16' : isMobile ? 'w-64' : 'w-64'
            } h-full flex flex-col`}>
            {isMobile && (
                <div className="flex justify-end p-2">
                    <button onClick={toggleSidebar} className="text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between p-4 border-b bg-[#2b070a]">
                <h1 className={`font-bold text-xl ${isCollapsed ? 'hidden' : 'block'}`}>
                    <span style={{ fontFamily: 'Neufreit, sans-serif', color: '#fff', fontSize: '22px' }}>SNACKS</span>
                    <span style={{ fontFamily: 'Plau, sans-serif', color: '#fff', fontSize: '22px' }}> di Chris</span>
                </h1>
                {!isMobile && (
                    <button onClick={toggleCollapse} className="text-white">
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-2 px-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center p-2 rounded-lg hover:bg-[#583131] ${location.pathname === item.path ? 'bg-[#2b070a]' : ''
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                {!isCollapsed && <span className="ml-3">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut} // Disable button during logout
                    className="flex items-center p-2 rounded-lg hover:bg-gray-700 w-full text-left disabled:opacity-50"
                >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    {!isCollapsed && <span className="ml-3">{isLoggingOut ? 'Saindo...' : 'Sair'}</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;