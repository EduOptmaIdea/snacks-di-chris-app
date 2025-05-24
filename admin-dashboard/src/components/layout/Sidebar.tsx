import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    UsersIcon,
    ChartBarIcon,
    WrenchIcon,
    //Cog6ToothIcon,
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        { name: 'Usuários', path: '/admin/users', icon: UsersIcon },
        { name: 'Categorias', path: '/admin/categories', icon: DocumentTextIcon },
        { name: 'Produtos', path: '/admin/products', icon: ChartBarIcon },
        { name: 'Permissões', path: '/admin/permissions', icon: ShieldCheckIcon },
        { name: 'Configurações', path: '/admin/settings', icon: WrenchIcon },
    ];

    return (
        <div className={`bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : isMobile ? 'w-64' : 'w-64'
            } h-full flex flex-col`}>
            {isMobile && (
                <div className="flex justify-end p-2">
                    <button onClick={toggleSidebar} className="text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h1 className={`font-bold text-xl ${isCollapsed ? 'hidden' : 'block'}`}>
                    SNACKS di Chris
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
                                className={`flex items-center p-2 rounded-lg hover:bg-gray-700 ${location.pathname === item.path ? 'bg-gray-700' : ''
                                    }`}
                            >
                                <item.icon className="h-6 w-6" />
                                {!isCollapsed && <span className="ml-3">{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
                <Link
                    to="/logout"
                    className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    {!isCollapsed && <span className="ml-3">Sair</span>}
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
