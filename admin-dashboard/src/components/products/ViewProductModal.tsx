import React from 'react';
import ProductModal from './ProductModal';
import { Timestamp } from 'firebase/firestore';

// Interface completa para dados do produto, incluindo metadados
interface FullProductData {
  id: string;
  productname?: string;
  description?: string;
  categoryRef?: string;
  price?: number;
  currentStock?: number;
  available?: boolean;
  descontinued?: boolean;
  image?: string | null | undefined;
  ingredientRefs?: string[];
  allergenicAgentRefs?: string[];
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
  timesOrder?: number;
  views?: number;
  // Adicione quaisquer outros campos que possam existir no Firestore
}

// Interface para mapas de referência (ID -> Nome)
interface ReferenceMap {
  [key: string]: string;
}

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FullProductData | null;
  categoriesMap: ReferenceMap;
  ingredientsMap: ReferenceMap;
  allergensMap: ReferenceMap;
}

// Função auxiliar para formatar Timestamps
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('pt-BR');
};

// Função auxiliar para obter nomes de referências
const getReferenceNames = (refs: string[] | undefined, map: ReferenceMap): string => {
  if (!refs || refs.length === 0) return 'Nenhum';
  return refs.map(ref => map[ref] || 'Desconhecido').join(', ');
};

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categoriesMap,
  ingredientsMap,
  allergensMap
}) => {
  if (!isOpen || !product) return null;

  const defaultImage = '/default.webp'; // Caminho para a imagem padrão
  const imageUrl = product.image || defaultImage;

  const status = product.descontinued ? 'Inativo' : 'Ativo';
  const availability = product.available ? 'Sim' : 'Não';
  const categoryName = categoriesMap[product.categoryRef || ''] || 'N/A';
  const ingredientNames = getReferenceNames(product.ingredientRefs, ingredientsMap);
  const allergenNames = getReferenceNames(product.allergenicAgentRefs, allergensMap);

  return (
    <ProductModal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Coluna da Imagem */}
        <div className="md:col-span-1 flex justify-center items-start">
          <img
            src={imageUrl}
            alt={product.productname || 'Imagem do produto'}
            className="max-w-full h-auto max-h-60 object-contain rounded border border-gray-200"
            onError={(e) => (e.currentTarget.src = defaultImage)} // Fallback se a URL falhar
          />
        </div>

        {/* Coluna de Detalhes Principais */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{product.productname || 'Nome não disponível'}</h3>
          <p className="text-sm text-gray-600">{product.description || 'Descrição não disponível.'}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><strong className="text-gray-700">Categoria:</strong> {categoryName}</div>
            <div><strong className="text-gray-700">Preço:</strong> R$ {(product.price ?? 0).toFixed(2).replace('.', ',')}</div>
            <div><strong className="text-gray-700">Estoque Atual:</strong> {product.currentStock ?? 0}</div>
            <div><strong className="text-gray-700">Status:</strong> {status}</div>
            <div><strong className="text-gray-700">Disponível:</strong> {availability}</div>
            <div><strong className="text-gray-700">Vezes Pedido:</strong> {product.timesOrder ?? 0}</div>
            <div><strong className="text-gray-700">Visualizações:</strong> {product.views ?? 0}</div>
          </div>

          <div className="text-sm">
            <strong className="text-gray-700">Ingredientes:</strong>
            <p className="text-gray-600">{ingredientNames}</p>
          </div>
          <div className="text-sm">
            <strong className="text-gray-700">Agentes Alergênicos:</strong>
            <p className="text-gray-600">{allergenNames}</p>
          </div>

          {/* Metadados */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-3">
            <p><strong>Criado em:</strong> {formatTimestamp(product.createdAt)} por {product.createdBy || 'Desconhecido'}</p>
            <p><strong>Última Atualização:</strong> {formatTimestamp(product.updatedAt)} por {product.lastUpdatedBy || 'Desconhecido'}</p>
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

export default ViewProductModal;

