import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getAppointment,
  cancelAppointment,
  completeAppointment,
  type Appointment as AppointmentType,
} from "../api/appointments";
import { useAuth } from "../contexts/useAuth";
import Layout from "../ui/cadaster";
import EditAppointmentForm from "../components/edit-appointment-form";
import editIcon from "/edit.svg";
import calendarCheckIcon from "/calendar-check.svg";
import calendarXmarkIcon from "/calendar-xmark.svg";

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<AppointmentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const canModifyAppointment =
    (user?.role === "ADMIN" ||
      user?.role === "EMPLOYEE" ||
      (user?.role === "PROFESSIONAL" &&
        user.id === appointment?.employee.id)) &&
    appointment?.status !== "completed";

  useEffect(() => {
    if (!id) {
      setMessage("ID do agendamento não fornecido.");
      setIsLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const data = await getAppointment(parseInt(id));
        setAppointment(data);
      } catch (err: any) {
        setMessage("Não foi possível carregar os detalhes do agendamento.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleEditSuccess = (updatedAppointment: AppointmentType) => {
    setAppointment(updatedAppointment);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage("");
  };

  if (isLoading) {
    return (
      <p className="text-center mt-10">Carregando detalhes do agendamento...</p>
    );
  }

  if (!appointment) {
    return <p className="text-center mt-10">Agendamento não encontrado.</p>;
  }

  const handleComplete = async () => {
    if (!appointment) return;
    setIsLoading(true);
    setMessage("");
    try {
      await completeAppointment(appointment.id);
      setMessage("Agendamento concluído com sucesso!");
      const updatedData = await getAppointment(appointment.id);
      setAppointment(updatedData);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(
          `Erro ao concluir agendamento: ${err.response.data.message}`
        );
      } else {
        setMessage("Erro ao concluir agendamento.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setIsLoading(true);
    setMessage("");
    try {
      await cancelAppointment(appointment.id);
      setMessage("Agendamento cancelado com sucesso!");
      const updatedData = await getAppointment(appointment.id);
      setAppointment(updatedData);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(
          `Erro ao cancelar agendamento: ${err.response.data.message}`
        );
      } else {
        setMessage("Erro ao cancelar agendamento.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title="Detalhes do Agendamento"
      onSubmit={() => {}}
      buttonText={undefined}
    >
      {isEditing && appointment ? (
        <EditAppointmentForm
          appointment={appointment}
          onEditSuccess={handleEditSuccess}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Serviço:
            </label>
            <p className="text-gray-900">{appointment.service.name}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profissional:
            </label>
            <p className="text-gray-900">
              {appointment.employee.first_name} {appointment.employee.last_name}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Data e Hora:
            </label>
            <p className="text-gray-900">
              {new Date(appointment.start_time).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status:
            </label>
            <p className="text-gray-900">{appointment.status}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nome do Cliente:
            </label>
            <p className="text-gray-900">{appointment.client_name}</p>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contato do Cliente:
            </label>
            <p className="text-gray-900">{appointment.client_contact}</p>
          </div>
          {}
          {canModifyAppointment && (
            <div className="flex gap-4">
              {appointment.status === "reserved" && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-[#B490F0] text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-[#8c6fc6] flex items-center justify-center"
                >
                  <img
                    src={editIcon}
                    alt="Editar Agendamento"
                    className="w-6 h-6"
                    style={{ filter: "invert(100%)" }}
                  />
                </button>
              )}
              {appointment.status === "reserved" && (
                <>
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="bg-green-500 text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-green-600 flex items-center justify-center"
                  >
                    <img
                      src={calendarCheckIcon}
                      alt="Concluir Agendamento"
                      className="w-6 h-6"
                      style={{ filter: "invert(100%)" }}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-red-500 text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600 flex items-center justify-center"
                  >
                    <img
                      src={calendarXmarkIcon}
                      alt="Cancelar Agendamento"
                      className="w-6 h-6"
                      style={{ filter: "invert(100%)" }}
                    />
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {message && (
        <div
          className={`p-3 rounded-md text-center ${
            message.includes("sucesso")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.includes("\n") ? (
            <div className="text-left">
              <div className="font-semibold mb-2">
                Por favor, corrija os seguintes erros:
              </div>
              {message
                .split("\n")
                .slice(1)
                .map((error, index) => (
                  <div key={index} className="ml-4">
                    • {error}
                  </div>
                ))}
            </div>
          ) : (
            message
          )}
        </div>
      )}
    </Layout>
  );
}
