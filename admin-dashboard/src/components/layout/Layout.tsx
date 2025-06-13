import { useState, useEffect, useContext } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import defaultAvatar from '../../assets/default-avatar.png';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/global.css'; // Import global styles

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const authContext = useContext(AuthContext);

    const adminUser = authContext?.adminUser;
    const userName = adminUser?.userName || 'Usuário';
    const userAvatar = adminUser?.avatar;

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
        <div className="flex h-screen bg-gray-100 relative">
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
                {/* Cabeçalho - z-index reduzido */}
                <header className="bg-white shadow-sm z-10">
                    <div className="px-2 py-2 flex items-center justify-between w-full">
                        {isMobile ? (
                            <>
                                {/* Esquerda: Botão + Título */}
                                <div className="flex items-start gap-2">
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="text-gray-600 hover:text-gray-900 focus:outline-none"
                                    >
                                        <Bars3Icon className="h-6 w-6" />
                                    </button>

                                    <div className="flex flex-col leading-tight">
                                        {/* Linha 1: SNACKS + di Chris juntos */}
                                        <div className="flex gap-1">
                                            <span style={{
                                                fontFamily: 'Neufreit, sans-serif',
                                                color: '#a9373e',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                SNACKS
                                            </span>
                                            <span style={{
                                                fontFamily: 'Plau, sans-serif',
                                                color: '#a9373e',
                                                fontSize: '12px'
                                            }}>
                                                di Chris
                                            </span>
                                        </div>

                                        {/* Linha 2: Área Administrativa */}
                                        <span style={{
                                            fontFamily: 'Roboto, sans-serif',
                                            color: '#a9373e',
                                            fontSize: '10px'
                                        }}>
                                            Área Administrativa
                                        </span>
                                    </div>

                                </div>

                                {/* Direita: Nome + Avatar */}
                                <div className="flex items-center gap-2">
                                    <span style={{
                                        fontFamily: 'Robotosemi, sans-serif',
                                        color: '#333',
                                        fontSize: '10px'
                                    }}>
                                        {userName}
                                    </span>
                                    <img
                                        className="h-10 w-10 rounded-full object-cover bg-[#a9373e]"
                                        src={userAvatar || defaultAvatar}
                                        alt="Avatar do usuário"
                                        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                                    />
                                </div>
                            </>
                        ) : (
                            // Versão desktop
                            <div className="flex-1 flex justify-between items-center">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    <span style={{
                                        fontFamily: 'Neufreit, sans-serif',
                                        color: '#a9373e',
                                        fontSize: '22px'
                                    }}>
                                        SNACKS
                                    </span>
                                    <span style={{
                                        fontFamily: 'Plau, sans-serif',
                                        color: '#a9373e',
                                        fontSize: '22px'
                                    }}>
                                        di Chris
                                    </span>
                                    <span style={{
                                        fontFamily: 'Roboto, sans-serif',
                                        color: '#a9373e',
                                        fontWeight: 'normal'
                                    }}>
                                        {' '}| Área Administrativa
                                    </span>
                                </h1>

                                <div className="ml-4 flex items-center gap-3">
                                    <span style={{
                                        fontFamily: 'Robotosemi, sans-serif',
                                        color: '#333',
                                        fontSize: '18px'
                                    }}>
                                        {userName}
                                    </span>
                                    <img
                                        className="h-12 w-12 rounded-full object-cover bg-[#a9373e]"
                                        src={userAvatar || defaultAvatar}
                                        alt="Avatar do usuário"
                                        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </header>


                {/* Conteúdo da página */}
                <main className="flex-1 overflow-auto px-2 py-0 relative z-20">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;