import { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
// Importar a imagem de fallback
import defaultAvatar from '../../assets/default-avatar.png';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const userAvatar = null; // Simular que não há avatar do usuário para testar o fallback
    const userName = 'EduSouza'; // Placeholder para o nome do usuário

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Verificar inicialmente
        checkIfMobile();

        // Adicionar listener para redimensionamento
        window.addEventListener('resize', checkIfMobile);

        // Limpar listener
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
                            {/* Título com fontes e cores personalizadas */}
                            <h1 className="text-xl font-semibold text-gray-800">
                                <span style={{ fontFamily: 'Neufreit, sans-serif', color: '#a9373e', fontSize: '22px' }}>SNACKS</span>
                                <span style={{ fontFamily: 'Plau, sans-serif', color: '#a9373e', fontSize: '22px' }}> di Chris</span>
                                <span style={{ fontFamily: 'Roboto, sans-serif', color: '#a9373e', fontWeight: 'normal' }}> | Área Administrativa</span>
                            </h1>
                            <div className="ml-4 flex items-center gap-3">
                                {/* Nome do usuário */}
                                <span style={{ fontFamily: 'Robotosemi, sans-serif', color: '#333', fontSize: '18px' }}>{userName}</span>
                                {/* Avatar do usuário com fallback */}
                                <img
                                    className="h-12 w-12 rounded-full object-cover bg-[#a9373e]" // Adicionado object-cover
                                    src={userAvatar || defaultAvatar} // Usa avatar do usuário ou fallback
                                    alt="Avatar do usuário"
                                    // onError é um fallback adicional caso a imagem principal falhe
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
