import { useState } from 'react';

// Tipos
export type SortField = 'productname' | 'category' | 'price' | 'currentStock' | 'status' | 'available';
type ProductData = {
  id: string;
  productname?: string;
  categoryRef?: string;
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean;
};

interface UseProductTableFilterProps {
  initialData: ProductData[];
  categoriesMap: Record<string, string>;
}

export const useProductTableFilter = ({ initialData, categoriesMap }: UseProductTableFilterProps) => {
  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(''); // Ativo / Inativo
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');

  // Ordenação
  const [sortField, setSortField] = useState<SortField>('productname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtragem + Ordenação
  const filteredAndSortedProducts = initialData
    .filter(p => {
      const matchesSearch = p.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = selectedCategory ? p.categoryRef === selectedCategory : true;
      const matchesStatus = selectedStatus
        ? (selectedStatus === 'Ativo' && !p.descontinued) || (selectedStatus === 'Inativo' && p.descontinued)
        : true;
      const matchesAvailability = selectedAvailability
        ? (selectedAvailability === 'Sim' && p.available) || (selectedAvailability === 'Não' && !p.available)
        : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesAvailability;
    })
    .sort((a, b) => {
      let valueA: string | number = '';
      let valueB: string | number = '';

      switch (sortField) {
        case 'productname':
          valueA = a.productname?.toLowerCase() || '';
          valueB = b.productname?.toLowerCase() || '';
          break;
        case 'category':
          valueA = (categoriesMap[a.categoryRef ?? ''] || '').toLowerCase();
          valueB = (categoriesMap[b.categoryRef ?? ''] || '').toLowerCase();
          break;
        case 'price':
          valueA = a.price ?? 0;
          valueB = b.price ?? 0;
          break;
        case 'currentStock':
          valueA = a.currentStock ?? 0;
          valueB = b.currentStock ?? 0;
          break;
        case 'status':
          valueA = a.descontinued ? 'Inativo' : 'Ativo';
          valueB = b.descontinued ? 'Inativo' : 'Ativo';
          break;
        case 'available':
          valueA = a.available ? 'Sim' : 'Não';
          valueB = b.available ? 'Sim' : 'Não';
          break;
      }

      if (typeof valueA === 'string') {
        return sortDirection === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      }

      return sortDirection === 'asc'
        ? (Number(valueA) - Number(valueB))
        : (Number(valueB) - Number(valueA));
    });

  // Calcula total de páginas
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Retorna dados paginados
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Funções para controle
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedAvailability,
    setSelectedAvailability,
    sortField,
    sortDirection,
    toggleSort,
    paginatedProducts,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage
  };
};