import React from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Interface para os dados da categoria
interface CategoryData {
  id: string;
  category?: string;
  description?: string;
  activeCategory?: boolean;
}

// Interface para as permissões do usuário
interface CategoryPermissions {
  canRead: boolean; // Embora não haja botão de "view", a leitura é necessária para exibir a tabela
  canWrite: boolean;
  canDelete: boolean;
}

// Interface para as props do componente CategoryTable
interface CategoryTableProps {
  categories: CategoryData[];
  permissions: CategoryPermissions;
  onView: (category: CategoryData) => void;
  onEdit: (category: CategoryData) => void;
  onDelete: (category: CategoryData) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  permissions,
  onView,
  onEdit,
  onDelete
}) => {

  const getStatus = (active: boolean | undefined): string => {
    return active === false ? 'Inativo' : 'Ativo'; // Considera undefined como Ativo por padrão
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left py-3 px-4 font-semibold text-sm">Nome da Categoria</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Descrição</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
            {(permissions.canWrite || permissions.canDelete) && (
              <th className="text-left py-3 px-4 font-semibold text-sm">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={permissions.canWrite || permissions.canDelete ? 5 : 4} className="text-center py-4 text-gray-500">
                Nenhuma categoria encontrada.
              </td>
            </tr>
          ) : (
            categories.map(cat => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{cat.category || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{cat.description || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{getStatus(cat.activeCategory)}</td>
                {(permissions.canWrite || permissions.canDelete) && (
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                    {permissions.canRead && (
                      <button
                        onClick={() => onView(cat)}
                        className="text-gray-600 hover:text-blue-600 mr-3 p-1"
                        title="Visualizar"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canWrite && (
                      <button
                        onClick={() => onEdit(cat)}
                        className="text-gray-600 hover:text-green-600 mr-3 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        onClick={() => onDelete(cat)}
                        className="text-gray-600 hover:text-red-600 p-1"
                        title="Excluir"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;

