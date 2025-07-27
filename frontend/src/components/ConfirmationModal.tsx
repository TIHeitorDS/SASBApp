import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    // Fundo escurecido
<div 
  className="fixed inset-0 bg-black bg-opacity-60 z-[999] flex justify-center items-center"
  onClick={onClose}
>
      {/* Conteúdo do Modal */}
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-black"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;