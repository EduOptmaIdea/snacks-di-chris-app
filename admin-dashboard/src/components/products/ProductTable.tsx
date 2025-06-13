import React, { useState, useEffect } from 'react';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface ProductData {
  id: string;
  productname?: string;
  categoryRef?: string;
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean;
}

interface CategoryMap {
  [key: string]: string;
}

interface ProductPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

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
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [sortField, setSortField] = useState<'productname' | 'category'>('productname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Verifica o tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getCategoryName = (ref: string | undefined): string => {
    if (!ref) return 'N/A';
    return categoriesMap[ref] || 'N/A';
  };

  const formatPrice = (price: number | undefined): string => {
    return `R$ ${(price ?? 0).toFixed(2).replace('.', ',')}`;
  };

  const getStatus = (descontinued: boolean | undefined): string => {
    return descontinued ? 'Inativo' : 'Ativo';
  };

  const getAvailability = (available: boolean | undefined): string => {
    return available ? 'Sim' : 'Não';
  };

  const toggleSort = (field: 'productname' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleProductExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const filteredAndSortedProducts = products
    .filter(p => {
      const matchesSearch = p.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = selectedCategory ? p.categoryRef === selectedCategory : true;
      const matchesStatus = selectedStatus ? getStatus(p.descontinued) === selectedStatus : true;
      const matchesAvailability = selectedAvailability ? getAvailability(p.available) === selectedAvailability : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesAvailability;
    })
    .sort((a, b) => {
      let valueA = '';
      let valueB = '';

      if (sortField === 'productname') {
        valueA = a.productname?.toLowerCase() || '';
        valueB = b.productname?.toLowerCase() || '';
      } else {
        valueA = getCategoryName(a.categoryRef).toLowerCase();
        valueB = getCategoryName(b.categoryRef).toLowerCase();
      }

      const comparison = valueA.localeCompare(valueB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="overflow-x-auto">
      {/* Barra de Filtros - Versão Responsiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Nome do produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 rounded-md p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 rounded-md p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(categoriesMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-10 rounded-md p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm"
          >
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disponível</label>
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="w-full h-10 rounded-md p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm"
          >
            <option value="">Todos</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>
      </div>

      {/* Tabela para Desktop */}
      {!isMobile && (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th
                className="text-left py-3 px-4 font-semibold text-sm cursor-pointer hover:text-[#efb42b] whitespace-nowrap"
                onClick={() => toggleSort('productname')}
              >
                <div className="flex items-center gap-1">
                  Nome
                  {sortField === 'productname' && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>

              <th
                className="text-left py-3 px-4 font-semibold text-sm cursor-pointer hover:text-[#efb42b] whitespace-nowrap"
                onClick={() => toggleSort('category')}
              >
                <div className="flex items-center gap-1">
                  Categoria
                  {sortField === 'category' && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
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
            {filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={permissions.canRead || permissions.canWrite || permissions.canDelete ? 7 : 6}
                  className="text-center py-4 text-gray-500"
                >
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map(p => (
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
      )}

      {/* Lista de Cards para Mobile */}
      {isMobile && (
        <div className="space-y-3">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            filteredAndSortedProducts.map(p => (
              <div key={p.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div
                  className="p-3 flex justify-between items-center bg-gray-50 cursor-pointer"
                  onClick={() => toggleProductExpand(p.id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{p.productname || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">{getCategoryName(p.categoryRef)}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{formatPrice(p.price)}</span>
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {expandedProductId === p.id && (
                  <div className="p-3 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Estoque:</span>
                        <span className="ml-1">{p.currentStock ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-1">{getStatus(p.descontinued)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Disponível:</span>
                        <span className="ml-1">{getAvailability(p.available)}</span>
                      </div>
                    </div>

                    {(permissions.canRead || permissions.canWrite || permissions.canDelete) && (
                      <div className="flex justify-end space-x-2 mt-3 pt-2 border-t">
                        {permissions.canRead && (
                          <button
                            onClick={() => onView(p)}
                            className="text-blue-600 p-1"
                            title="Visualizar"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        )}
                        {permissions.canWrite && (
                          <button
                            onClick={() => onEdit(p)}
                            className="text-green-600 p-1"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            onClick={() => onDelete(p)}
                            className="text-red-600 p-1"
                            title="Excluir"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductTable;