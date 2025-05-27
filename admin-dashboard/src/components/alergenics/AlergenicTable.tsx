import React from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Interface para os dados da categoria
interface AlergenicData {
  id: string;
  name?: string;
}

// Interface para as permissões do usuário
interface AlergenicPermissions {
  canRead: boolean; // Embora não haja botão de "view", a leitura é necessária para exibir a tabela
  canWrite: boolean;
  canDelete: boolean;
}

// Interface para as props do componente AlergenicTable
interface AlergenicTableProps {
  alergenics: AlergenicData[];
  permissions: AlergenicPermissions;
  onView: (alergenic: AlergenicData) => void;
  onEdit: (alergenic: AlergenicData) => void;
  onDelete: (alergenic: AlergenicData) => void;
}

const AlergenicTable: React.FC<AlergenicTableProps> = ({
  alergenics,
  permissions,
  onView,
  onEdit,
  onDelete
}) => {

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left py-3 px-4 font-semibold text-sm">Nome da Categoria</th>
            {(permissions.canWrite || permissions.canDelete) && (
              <th className="text-left py-3 px-4 font-semibold text-sm">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {alergenics.length === 0 ? (
            <tr>
              <td colSpan={permissions.canWrite || permissions.canDelete ? 5 : 4} className="text-center py-4 text-gray-500">
                Nenhum alergenice encontrado.
              </td>
            </tr>
          ) : (
            alergenics.map(ingr => (
              <tr key={ingr.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{ingr.name || 'N/A'}</td>
                {(permissions.canWrite || permissions.canDelete) && (
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                    {permissions.canRead && (
                      <button
                        onClick={() => onView(ingr)}
                        className="text-gray-600 hover:text-blue-600 mr-3 p-1"
                        title="Visualizar"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canWrite && (
                      <button
                        onClick={() => onEdit(ingr)}
                        className="text-gray-600 hover:text-green-600 mr-3 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        onClick={() => onDelete(ingr)}
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

export default AlergenicTable;

