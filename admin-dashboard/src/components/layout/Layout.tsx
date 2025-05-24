import { useState, useEffect } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
                            <h1 className="text-xl font-semibold text-gray-800">SNACKS di Chris | Área Administrativa</h1>
                            <div className="ml-4 flex items-center">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src="https://via.placeholder.com/40"
                                    alt="Avatar do usuário"
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
