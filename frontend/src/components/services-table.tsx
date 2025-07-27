import { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import editIcon from "/edit.svg";
import deleteIcon from "/bin.svg";
import ConfirmationModal from './ConfirmationModal';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export default function ServicesTable({ services, onDeleteService }: { services: Service[], onDeleteService: (id: number) => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const handleOpenModal = (service: Service) => {
    setServiceToDelete(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setServiceToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      onDeleteService(serviceToDelete.id);
    }
    handleCloseModal(); // Fecha o modal após a confirmação
  };

  return (
    <>
      <div className="w-full font-syne">
        <div className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-secondary/3 border-[0.5px] border-gray py-3`}>
          <div className="text-center lg:text-start text-sm lg:text-base lg-pl-12 font-semibold">Serviço</div>
          <div className="text-center font-semibold text-sm lg:text-base">Duração</div>
          <div className="text-center font-semibold text-sm lg:text-base ">Preço</div>
          {isAdmin && <div className="text-center font-semibold text-sm lg:text-base">Ações</div>}
        </div>

        <div className="h-1" />

        <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-auto">
          {services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.id}
                className={`grid ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} items-center`}
              >
                <div className="pl-12 text-sm lg:text-base ">{service.name}</div>
                <div className="text-center text-sm lg:text-base">
                  {formatDuration(service.duration)}
                </div>
                <div className="text-center text-sm lg:text-base">
                  R$ {service.price}
                </div>
                {isAdmin && (
                  <div className="flex justify-center items-center gap-4">
                    <Link
                      to={`/editar-servico/${service.id}`}
                      className="bg-[#B490F0] text-white rounded-[2px] py-[10px] px-[10px] font-semibold transition-all hover:bg-[#8c6fc6] flex items-center justify-center"
                    >
                      <img src={editIcon} alt="Editar" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                    </Link>
                    <button
                      onClick={() => handleOpenModal(service)} // O onClick agora abre o modal
                      className="bg-black text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600 flex items-center justify-center"
                    >
                      <img src={deleteIcon} alt="Excluir" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center pt-10">Nenhum serviço encontrado.</p>
          )}
          <div className="h-5" />
        </div>
      </div>

      {/* O componente do modal é renderizado aqui, mas só fica visível quando isOpen é true */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o serviço "${serviceToDelete?.name}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
}