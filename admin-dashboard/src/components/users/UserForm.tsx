import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserFormProps {
    userId: string | null;
    onClose: () => void;
    onSave: (userData: any) => void;
}

const UserForm = ({ userId, onClose, onSave }: UserFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        email: '',
        whatsapp: '',
        telefone: '',
        role: 'editor',
        available: true,
        notes: '',
        permissions: {
            categories: {
                read: true,
                write: false,
                delete: false
            },
            products: {
                read: true,
                write: false,
                delete: false
            },
            users: {
                read: false,
                write: false,
                delete: false
            }
        }
    });

    useEffect(() => {
        if (userId && userId !== 'new') {
            setLoading(true);
            // Simulação de carregamento de dados - será substituída pela integração com Firebase
            setTimeout(() => {
                if (userId === '1') {
                    setFormData({
                        fullName: 'Carlos Eduardo de Souza',
                        userName: 'EduSouza',
                        email: 'edu.souza@example.com',
                        whatsapp: '5511999999999',
                        telefone: '551133333333',
                        role: 'master',
                        available: true,
                        notes: 'Usuário de testes',
                        permissions: {
                            categories: {
                                read: true,
                                write: true,
                                delete: true
                            },
                            products: {
                                read: true,
                                write: true,
                                delete: true
                            },
                            users: {
                                read: true,
                                write: true,
                                delete: true
                            }
                        }
                    });
                }
                setLoading(false);
            }, 1000);
        }
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        if (name.includes('.')) {
            const [resource, permission] = name.split('.');
            setFormData(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [resource]: {
                        ...prev.permissions[resource as keyof typeof prev.permissions],
                        [permission]: checked
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulação de envio de dados - será substituída pela integração com Firebase
        setTimeout(() => {
            onSave(formData);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {userId === 'new' ? 'Novo Usuário' : 'Editar Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                                        Nome de Usuário *
                                    </label>
                                    <input
                                        type="text"
                                        name="userName"
                                        id="userName"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.userName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                                        WhatsApp *
                                    </label>
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        id="whatsapp"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefone"
                                        id="telefone"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.telefone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                        Função *
                                    </label>
                                    <select
                                        name="role"
                                        id="role"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="viewer">Visualizador</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Administrador</option>
                                        <option value="master">Master</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="available"
                                        id="available"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.available}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                                        Usuário ativo
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Observações
                                </label>
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.notes}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Permissões</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configure as permissões do usuário para cada recurso
                                </p>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h4 className="text-md font-medium text-gray-700">Categorias</h4>
                                        <div className="mt-2 flex space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="categories.read"
                                                    id="categories.read"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.categories.read}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="categories.read" className="ml-2 block text-sm text-gray-700">
                                                    Visualizar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="categories.write"
                                                    id="categories.write"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.categories.write}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="categories.write" className="ml-2 block text-sm text-gray-700">
                                                    Editar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="categories.delete"
                                                    id="categories.delete"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.categories.delete}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="categories.delete" className="ml-2 block text-sm text-gray-700">
                                                    Excluir
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-medium text-gray-700">Produtos</h4>
                                        <div className="mt-2 flex space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="products.read"
                                                    id="products.read"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.products.read}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="products.read" className="ml-2 block text-sm text-gray-700">
                                                    Visualizar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="products.write"
                                                    id="products.write"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.products.write}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="products.write" className="ml-2 block text-sm text-gray-700">
                                                    Editar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="products.delete"
                                                    id="products.delete"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.products.delete}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="products.delete" className="ml-2 block text-sm text-gray-700">
                                                    Excluir
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-medium text-gray-700">Usuários</h4>
                                        <div className="mt-2 flex space-x-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="users.read"
                                                    id="users.read"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.users.read}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="users.read" className="ml-2 block text-sm text-gray-700">
                                                    Visualizar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="users.write"
                                                    id="users.write"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.users.write}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="users.write" className="ml-2 block text-sm text-gray-700">
                                                    Editar
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="users.delete"
                                                    id="users.delete"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={formData.permissions.users.delete}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label htmlFor="users.delete" className="ml-2 block text-sm text-gray-700">
                                                    Excluir
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {userId !== 'new' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Redefinir Senha</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Deixe em branco para manter a senha atual
                                    </p>
                                    <div className="mt-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-2">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
