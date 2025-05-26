import React from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'; // Usando outline para consistência

// Interface para os dados do produto como recebidos pelo componente
interface ProductData {
  id: string;
  productname?: string;
  categoryRef?: string; // ID da categoria
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean; // Campo para status Ativo/Inativo
  // Adicione outros campos se necessário para exibição direta na tabela
}

// Interface para o mapa de categorias (ID -> Nome)
interface CategoryMap {
  [key: string]: string; // Mapeia ID da categoria para o nome
}

// Interface para as permissões do usuário
interface ProductPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

// Interface para as props do componente ProductTable
interface ProductTableProps {
  products: ProductData[];
  categoriesMap: CategoryMap;
  permissions: ProductPermissions;
  onView: (product: ProductData) => void;
  onEdit: (product: ProductData) => void;
  onDelete: (product: ProductData) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categoriesMap,
  permissions,
  onView,
  onEdit,
  onDelete
}) => {

  const getCategoryName = (ref: string | undefined): string => {
    if (!ref) return 'N/A';
    return categoriesMap[ref] || 'N/A'; // Retorna nome ou 'N/A' se não encontrado
  };

  const formatPrice = (price: number | undefined): string => {
    return `R$ ${(price ?? 0).toFixed(2).replace('.', ',')}`;
  };

  const getStatus = (descontinued: boolean | undefined): string => {
    // Lógica invertida: descontinued=true significa Inativo
    return descontinued ? 'Inativo' : 'Ativo';
  };

  const getAvailability = (available: boolean | undefined): string => {
    return available ? 'Sim' : 'Não';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left py-3 px-4 font-semibold text-sm">Nome</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Categoria</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Preço</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Estoque</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Disponível</th>
            {(permissions.canRead || permissions.canWrite || permissions.canDelete) && (
              <th className="text-left py-3 px-4 font-semibold text-sm">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={permissions.canRead || permissions.canWrite || permissions.canDelete ? 7 : 6} className="text-center py-4 text-gray-500">
                Nenhum produto encontrado.
              </td>
            </tr>
          ) : (
            products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{p.productname || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{getCategoryName(p.categoryRef)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{formatPrice(p.price)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{p.currentStock ?? 0}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{getStatus(p.descontinued)}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{getAvailability(p.available)}</td>
                {(permissions.canRead || permissions.canWrite || permissions.canDelete) && (
                  <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                    {permissions.canRead && (
                      <button
                        onClick={() => onView(p)}
                        className="text-gray-600 hover:text-blue-600 mr-3 p-1"
                        title="Visualizar"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canWrite && (
                      <button
                        onClick={() => onEdit(p)}
                        className="text-gray-600 hover:text-green-600 mr-3 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canDelete && (
                      <button
                        onClick={() => onDelete(p)}
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

export default ProductTable;

