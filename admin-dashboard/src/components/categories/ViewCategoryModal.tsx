import React from 'react';
import ProductModal from './CategoryModal';
import { Timestamp } from 'firebase/firestore';

// Interface para mapas de referência (ID -> Nome)
interface ReferenceMap {
  [key: string]: string;
}

// Interface completa para dados do produto, incluindo metadados
interface FullCategoryData {
  id: string;
  category?: string;
  description?: string;
  activeCategory?: boolean;
  image?: string | null | undefined;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
}

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: FullCategoryData | null;
  usersMap: ReferenceMap;
}

// Função auxiliar para formatar Timestamps
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('pt-BR');
};

// Função auxiliar para obter nome do usuário
const getUserName = (userId: string | undefined, map: ReferenceMap): string => {
  if (!userId) return 'Sistema'; // Ou 'Desconhecido'
  return map[userId] || userId; // Retorna nome ou ID se não encontrado
};

const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  usersMap
}) => {
  if (!isOpen || !category) return null;

  const defaultImage = '/default.webp'; // Caminho para a imagem padrão
  const imageUrl = category.image || defaultImage;

  const availability = category.activeCategory ? 'Sim' : 'Não';

  // Obter nomes dos usuários
  const createdByName = getUserName(category.createdBy, usersMap);
  const lastUpdatedByName = getUserName(category.lastUpdatedBy, usersMap);

  return (
    <ProductModal isOpen={isOpen} onClose={onClose} title="Detalhes da categoria">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Coluna da Imagem */}
        <div className="md:col-span-1 flex justify-center items-start">
          <img
            src={imageUrl}
            alt={category.category || 'Imagem do produto'}
            className="max-w-full h-auto max-h-60 object-contain rounded border border-gray-200"
            onError={(e) => (e.currentTarget.src = defaultImage)} // Fallback se a URL falhar
          />
        </div>

        {/* Coluna de Detalhes Principais */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{category.category || 'Nome não disponível'}</h3>
          <p className="text-sm text-gray-600">{category.description || 'Descrição não disponível.'}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><strong className="text-gray-700">Categoria ativa:</strong> {availability}</div>
          </div>

          {/* Metadados */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-3">
            <p><strong>Criado em:</strong> {formatTimestamp(category.createdAt)} por {createdByName || 'Desconhecido'}</p>
            <p><strong>Última Atualização:</strong> {formatTimestamp(category.updatedAt)} por {lastUpdatedByName || 'Desconhecido'}</p>
          </div>
        </div>
      </div>

      {/* Botão Fechar */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
        >
          Fechar
        </button>
      </div>
    </ProductModal>
  );
};

export default ViewCategoryModal;

