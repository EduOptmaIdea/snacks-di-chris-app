import React from 'react';
import IngredientModal from './IngredientModal';
import { Timestamp } from 'firebase/firestore';

// Interface completa para dados do produto, incluindo metadados
interface FullIngredientData {
  id: string;
  name?: string;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
}

interface ViewIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: FullIngredientData | null;
}

// Função auxiliar para formatar Timestamps
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('pt-BR');
};

const ViewIngredientModal: React.FC<ViewIngredientModalProps> = ({
  isOpen,
  onClose,
  ingredient,
}) => {
  if (!isOpen || !ingredient) return null;

  return (
    <IngredientModal isOpen={isOpen} onClose={onClose} title="Detalhes da categoria">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">


        {/* Coluna de Detalhes Principais */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{ingredient.name || 'Nome não disponível'}</h3>

          {/* Metadados */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-3">
            <p><strong>Criado em:</strong> {formatTimestamp(ingredient.createdAt)} por {ingredient.createdBy || 'Desconhecido'}</p>
            <p><strong>Última Atualização:</strong> {formatTimestamp(ingredient.updatedAt)} por {ingredient.lastUpdatedBy || 'Desconhecido'}</p>
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
    </IngredientModal>
  );
};

export default ViewIngredientModal;

