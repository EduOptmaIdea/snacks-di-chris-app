import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    role: string;
    available: boolean;
    lastLogin?: string;
    createdAt: string;
}

interface UserListProps {
    onEdit: (userId: string) => void;
    onView: (userId: string) => void;
    onDelete: (userId: string) => void;
}

const UserList = ({ onEdit, onView, onDelete }: UserListProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');

    // Simulação de dados - será substituída pela integração com Firebase
    useEffect(() => {
        // Simular carregamento de dados
        setTimeout(() => {
            const mockUsers: User[] = [
                {
                    id: '1',
                    fullName: 'Carlos Eduardo de Souza',
                    userName: 'EduSouza',
                    email: 'edu.souza@example.com',
                    role: 'master',
                    available: true,
                    lastLogin: '22 de maio de 2025 às 12:36:30 UTC-3',
                    createdAt: '22 de maio de 2025 às 12:34:16 UTC-3'
                },
                {
                    id: '2',
                    fullName: 'Maria Silva',
                    userName: 'MariaS',
                    email: 'maria.silva@example.com',
                    role: 'admin',
                    available: true,
                    lastLogin: '21 de maio de 2025 às 10:15:22 UTC-3',
                    createdAt: '15 de maio de 2025 às 09:30:00 UTC-3'
                },
                {
                    id: '3',
                    fullName: 'João Pereira',
                    userName: 'JoaoP',
                    email: 'joao.pereira@example.com',
                    role: 'editor',
                    available: false,
                    createdAt: '10 de maio de 2025 às 14:22:45 UTC-3'
                }
            ];

            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    // Filtrar usuários
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (currentFilter === 'all') return matchesSearch;
        if (currentFilter === 'active') return matchesSearch && user.available;
        if (currentFilter === 'inactive') return matchesSearch && !user.available;
        if (currentFilter === 'admin') return matchesSearch && (user.role === 'admin' || user.role === 'master');

        return matchesSearch;
    });

    // Renderizar status do usuário
    const renderStatus = (available: boolean) => {
        return available ? (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Ativo
            </span>
        ) : (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                Inativo
            </span>
        );
    };

    // Renderizar badge de função
    const renderRoleBadge = (role: string) => {
        switch (role) {
            case 'master':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Master
                    </span>
                );
            case 'admin':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                    </span>
                );
            case 'editor':
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Editor
                    </span>
                );
            default:
                return (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {role}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Gerenciamento de Usuários</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Administre os usuários do sistema
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <select
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={currentFilter}
                        onChange={(e) => setCurrentFilter(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                        <option value="admin">Administradores</option>
                    </select>

                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => onEdit('new')}
                    >
                        Novo Usuário
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuário
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Função
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Último Login
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Criado em
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {user.userName.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                <div className="text-xs text-gray-400">@{user.userName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStatus(user.available)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin || 'Nunca acessou'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex space-x-2 justify-end">
                                            <button
                                                onClick={() => onView(user.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(user.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Nenhum usuário encontrado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
