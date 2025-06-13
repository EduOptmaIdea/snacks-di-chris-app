import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { Timestamp } from 'firebase/firestore';
import { Dialog, Transition } from '@headlessui/react';
import '../../styles/global.css'; // Import global styles

// Constante para z-index garantido
const MODAL_Z_INDEX = 9999;

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
}

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
  usersMap: ReferenceMap;
}

const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('pt-BR');
};

const getReferenceNames = (refs: string[] | undefined, map: ReferenceMap): string => {
  if (!refs || refs.length === 0) return 'Nenhum';
  return refs.map(ref => map[ref] || 'Desconhecido').join(', ');
};

const getUserName = (userId: string | undefined, map: ReferenceMap): string => {
  if (!userId) return 'Sistema';
  return map[userId] || userId;
};

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categoriesMap,
  ingredientsMap,
  allergensMap,
  usersMap
}) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Bloqueia scroll quando modal está aberto
  useEffect(() => {
    if (isImageZoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isImageZoomed]);

  if (!isOpen || !product) return null;

  const defaultImage = '/default.webp';
  const imageUrl = product.image || defaultImage;

  const status = product.descontinued ? 'Inativo' : 'Ativo';
  const availability = product.available ? 'Sim' : 'Não';
  const categoryName = categoriesMap[product.categoryRef || ''] || 'N/A';
  const ingredientNames = getReferenceNames(product.ingredientRefs, ingredientsMap);
  const allergenNames = getReferenceNames(product.allergenicAgentRefs, allergensMap);
  const createdByName = getUserName(product.createdBy, usersMap);
  const lastUpdatedByName = getUserName(product.lastUpdatedBy, usersMap);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageZoomed(true);
  };

  const handleZoomedImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      <ProductModal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Coluna da Imagem */}
          <div className="md:col-span-1 flex justify-center items-start">
            <div
              className="relative cursor-zoom-in group"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
            >
              <img
                src={imageUrl}
                alt={product.productname || 'Imagem do produto'}
                className="max-w-full h-auto max-h-60 object-contain rounded border border-gray-200 group-hover:opacity-90 transition-opacity"
                onError={(e) => (e.currentTarget.src = defaultImage)}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Clique para ampliar
                </span>
              </div>
            </div>
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
              <p><strong>Criado em:</strong> {formatTimestamp(product.createdAt)} por {createdByName || 'Desconhecido'}</p>
              <p><strong>Última Atualização:</strong> {formatTimestamp(product.updatedAt)} por {lastUpdatedByName || 'Desconhecido'}</p>
            </div>
          </div>
        </div>

        {/* Botão Fechar */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </ProductModal>

      {/* Modal de Zoom da Imagem - Atualizado com z-index garantido */}
      <Transition show={isImageZoomed} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 overflow-y-auto"
          style={{ zIndex: MODAL_Z_INDEX }}
          onClose={() => setIsImageZoomed(false)}
          static
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-90" aria-hidden="true" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-6xl p-2 my-8 overflow-hidden text-left align-middle transition-all transform">
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={product.productname || 'Imagem ampliada do produto'}
                    className="w-full h-auto max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl"
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      cursor: 'zoom-out'
                    }}
                    onClick={handleZoomedImageClick}
                    onError={(e) => (e.currentTarget.src = defaultImage)}
                  />
                  <button
                    onClick={() => setIsImageZoomed(false)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    aria-label="Fechar zoom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ViewProductModal;