import React from 'react';
import AlergenicModal from './AlergenicModal'; // Importar o modal de categoria

interface DeleteAlergenicModalProps { // Renomear interface
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  alergenic: string | undefined; // Usar category
}

const DeleteAlergenicModal: React.FC<DeleteAlergenicModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  alergenic // Usar category
}) => {
  if (!isOpen) return null;

  return (
    <AlergenicModal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão">
      <div className="text-center">
        <p className="text-md text-gray-700 mb-6">
          Tem certeza que deseja excluir o item alergênico?
          <strong className="font-semibold">{alergenic || 'selecionada'}</strong>?
        </p>
        <p className="text-sm text-red-600 mb-4">
          Esta ação não pode ser desfeita.
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-center items-center mt-6 space-x-4 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
        >
          Confirmar Exclusão
        </button>
      </div>
    </AlergenicModal>
  );
};

export default DeleteAlergenicModal;

