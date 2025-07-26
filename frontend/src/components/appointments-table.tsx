import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import editIcon from "/edit.svg";
import deleteIcon from "/bin.svg";
import type { Appointment } from "../api/appointments";

interface AppointmentsTableProps {
  appointments: Appointment[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "EMPLOYEE";

  return (
    <div className="w-full font-syne">
      <div className={`grid ${canManage ? 'grid-cols-5' : 'grid-cols-4'} bg-gray-secondary/3 border-[0.5px] border-gray py-3 font-syne`}>
        <div className="text-center lg:text-start text-sm lg:text-base lg:pl-12 font-semibold" >Serviço</div>
        <div className="text-center text-sm lg:text-base font-semibold">Cliente</div>
        <div className="text-center text-sm lg:text-base font-semibold">Profissional</div>
        <div className="text-center text-sm lg:text-base font-semibold">Data</div>
        {canManage && <div className="text-center text-sm lg:text-base font-semibold">Ações</div>}
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 pl-1.5 lg:px-0 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-auto">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className={`grid ${canManage ? 'grid-cols-5' : 'grid-cols-4'} items-center`}>
              <div className="lg:pl-12 text-sm lg:text-base">{appointment.service.name}</div>
              <div className="text-center text-sm lg:text-base">{appointment.client_name}</div>
              <div className="text-center text-sm lg:text-base">{appointment.employee.first_name}</div>
              <div className="text-center text-sm lg:text-base">{formatDate(appointment.start_time)}</div>
              {canManage && (
                <div className="flex justify-center items-center gap-4">
                  <Link
                    to={`/editar-agendamento/${appointment.id}`}
                    className="bg-[#B490F0] text-white rounded-[2px] py-[10px] px-[10px] font-semibold transition-all hover:bg-[#8c6fc6] flex items-center justify-center"
                  >
                    <img src={editIcon} alt="Editar" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                  </Link>
                  <button
                    onClick={() => alert(`Cancelar agendamento ${appointment.id}`)}
                    className="bg-black text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600 flex items-center justify-center"
                  >
                    <img src={deleteIcon} alt="Cancelar" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center pt-10">Nenhum agendamento encontrado.</p>
        )}
        <div className="h-5" />
      </div>
    </div>
  );
}
