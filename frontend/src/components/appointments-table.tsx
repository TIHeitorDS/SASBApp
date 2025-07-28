import { useAuth } from "../contexts/useAuth";
import { Link } from "react-router-dom";
import infoIcon from "/info.svg";
import calendarIcon from "/calendar.svg";
import calendarCheckIcon from "/calendar-check.svg";
import calendarXmarkIcon from "/calendar-xmark.svg";
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
  const canViewInfo = user?.role === "ADMIN" || user?.role === "EMPLOYEE" || user?.role === "PROFESSIONAL";

  const getStatusStyling = (status: string) => {
    switch (status) {
      case "reserved":
        return {
          bgColor: "bg-[#B490F0]",
          altText: "Agendamento Reservado",
          icon: calendarIcon,
        };
      case "completed":
        return {
          bgColor: "bg-green-500",
          altText: "Agendamento Concluído",
          icon: calendarCheckIcon,
        };
      case "cancelled":
        return {
          bgColor: "bg-red-500",
          altText: "Agendamento Cancelado",
          icon: calendarXmarkIcon,
        };
      default:
        return {
          bgColor: "bg-gray-500",
          altText: "Status Desconhecido",
          icon: calendarCheckIcon,
        };
    }
  };

  return (
    <div className="w-full font-syne">
      <div className={`grid ${canViewInfo ? 'grid-cols-5' : 'grid-cols-4'} bg-gray-secondary/3 border-[0.5px] border-gray py-3 font-syne`}>
        <div className="text-center lg:text-start text-sm lg:text-base lg:pl-12 font-semibold" >Serviço</div>
        <div className="text-center text-sm lg:text-base font-semibold">Cliente</div>
        <div className="text-center text-sm lg:text-base font-semibold">Profissional</div>
        <div className="text-center text-sm lg:text-base font-semibold">Data</div>
        {canViewInfo && <div className="text-center text-sm lg:text-base font-semibold">Info</div>}
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 pl-1.5 lg:px-0 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-auto">
        {appointments.length > 0 ? (
          appointments.map((appointment) => {
            const statusStyling = getStatusStyling(appointment.status);
            return (
              <div key={appointment.id} className={`grid ${canViewInfo ? 'grid-cols-5' : 'grid-cols-4'} items-center`}>
                <div className="lg:pl-12 text-sm lg:text-base">{appointment.service.name}</div>
                <div className="text-center text-sm lg:text-base">{appointment.client_name}</div>
                <div className="text-center text-sm lg:text-base">{appointment.employee.first_name}</div>
                <div className="text-center text-sm lg:text-base">{formatDate(appointment.start_time)}</div>
                {canViewInfo && (
                  <div className="flex justify-center items-center gap-4">
                  <button
                    title={statusStyling.altText}
                    className={`${statusStyling.bgColor} text-white rounded-[2px] py-[10px] px-[10px] font-semibold transition-all hover:opacity-80 flex items-center justify-center`}
                  >
                    <img src={statusStyling.icon} alt={statusStyling.altText} className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                  </button>
                    <Link
                      to={`/detalhes-agendamento/${appointment.id}`}
                      className="bg-black text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-gray-800 flex items-center justify-center"
                    >
                      <img src={infoIcon} alt="Detalhes do Agendamento" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center pt-10">Nenhum agendamento encontrado.</p>
        )}
        <div className="h-5" />
      </div>
    </div>
  );
}
