import React from 'react';
import AlergenicModal from './AlergenicModal';
import { Timestamp } from 'firebase/firestore';

// Interface completa para dados do produto, incluindo metadados
interface FullAlergenicData {
  id: string;
  name?: string;
  createdAt?: Timestamp;
  createdBy?: string;
  updatedAt?: Timestamp;
  lastUpdatedBy?: string;
}

interface ViewAlergenicModalProps {
  isOpen: boolean;
  onClose: () => void;
  alergenic: FullAlergenicData | null;
}

// Função auxiliar para formatar Timestamps
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleString('pt-BR');
};

const ViewAlergenicModal: React.FC<ViewAlergenicModalProps> = ({
  isOpen,
  onClose,
  alergenic,
}) => {
  if (!isOpen || !alergenic) return null;

  return (
    <AlergenicModal isOpen={isOpen} onClose={onClose} title="Detalhes da categoria">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">


        {/* Coluna de Detalhes Principais */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{alergenic.name || 'Nome não disponível'}</h3>

          {/* Metadados */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-3">
            <p><strong>Criado em:</strong> {formatTimestamp(alergenic.createdAt)} por {alergenic.createdBy || 'Desconhecido'}</p>
            <p><strong>Última Atualização:</strong> {formatTimestamp(alergenic.updatedAt)} por {alergenic.lastUpdatedBy || 'Desconhecido'}</p>
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
    </AlergenicModal>
  );
};

export default ViewAlergenicModal;

