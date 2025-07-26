import { useState, useEffect } from "react";
import NavButton from "../components/nav-button";
import AppointmentsTable from "../components/appointments-table";
import { getAppointments, type Appointment as AppointmentType } from "../api/appointments";
import { useAuth } from "../contexts/AuthContext";

export default function Appointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getAppointments();
        setAppointments(response);
      } catch (err) {
        setError("Não foi possível carregar os agendamentos.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (isLoading) {
    return <p className="text-center mt-10">Carregando agendamentos...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  const canCreateAppointment = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

  return (
    <>
      <AppointmentsTable appointments={appointments} />
      {canCreateAppointment && <NavButton path="/cadastrar-agendamento" text="Novo Agendamento" />}
    </>
  );
}
