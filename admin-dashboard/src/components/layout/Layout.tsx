import { useState, useEffect, useContext } from 'react'; // Import useContext
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import defaultAvatar from '../../assets/default-avatar.png';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const authContext = useContext(AuthContext); // Usar useContext

    // Verificar se o contexto foi carregado antes de acessar adminUser
    const adminUser = authContext?.adminUser;

    // Extrair nome e avatar do adminUser, com fallbacks
    const userName = adminUser?.userName || 'Usuário'; // Usa userName do adminUser ou 'Usuário'
    const userAvatar = adminUser?.avatar; // Usa avatar do adminUser

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar para desktop */}
            {!isMobile && <Sidebar isMobile={false} />}

            {/* Sidebar para mobile (overlay) */}
            {isMobile && isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full z-50">
                        <Sidebar isMobile={true} toggleSidebar={toggleMobileMenu} />
                    </div>
                </div>
            )}

            {/* Conteúdo principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cabeçalho */}
                <header className="bg-white shadow-sm z-10">
                    <div className="px-4 py-3 flex items-center justify-between">
                        {isMobile && (
                            <button
                                onClick={toggleMobileMenu}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        )}
                        <div className="flex-1 flex justify-between items-center">
                            {/* Título */}
                            <h1 className="text-xl font-semibold text-gray-800">
                                <span style={{ fontFamily: 'Neufreit, sans-serif', color: '#a9373e', fontSize: '22px' }}>SNACKS</span>
                                <span style={{ fontFamily: 'Plau, sans-serif', color: '#a9373e', fontSize: '22px' }}> di Chris</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', color: '#a9373e', fontWeight: 'normal' }}> | Área Administrativa</span>
                            </h1>
                            {/* Informações do Usuário */}
                            <div className="ml-4 flex items-center gap-3">
                                <span style={{ fontFamily: 'Robotosemi, sans-serif', color: '#333', fontSize: '18px' }}>{userName}</span>
                                <img
                                    className="h-12 w-12 rounded-full object-cover bg-[#a9373e]"
                                    src={userAvatar || defaultAvatar} // Usa avatar do adminUser ou fallback
                                    alt="Avatar do usuário"
                                    onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo da página */}
                <main className="flex-1 overflow-auto p-4">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;