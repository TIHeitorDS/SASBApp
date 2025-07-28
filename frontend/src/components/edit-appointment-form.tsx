import { useState, useEffect } from "react";
import Input from "./input";
import SelectService from "./select-service";
import SelectWorker from "./select-worker";
import { updateAppointment, type Appointment as AppointmentType, type UpdateAppointment } from "../api/appointments";
import { useAuth } from "../contexts/useAuth";

interface EditAppointmentFormProps {
  appointment: AppointmentType;
  onEditSuccess: (updatedAppointment: AppointmentType) => void;
  onCancelEdit: () => void;
}

export default function EditAppointmentForm({ appointment, onEditSuccess, onCancelEdit }: EditAppointmentFormProps) {
  const { user } = useAuth();
  const isProfessional = user?.role === "PROFESSIONAL";

  const [clientName, setClientName] = useState(appointment.client_name);
  const [clientContact, setClientContact] = useState(appointment.client_contact);
  const [notes, setNotes] = useState(appointment.notes || "");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(appointment.service.id);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(appointment.employee.id);
  const [startTime, setStartTime] = useState(appointment.start_time.substring(0, 16));

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setClientName(appointment.client_name);
    setClientContact(appointment.client_contact);
    setNotes(appointment.notes || "");
    setSelectedServiceId(appointment.service.id);
    setSelectedWorkerId(appointment.employee.id);
    setStartTime(appointment.start_time.substring(0, 16));
    setMessage("");
    setErrors({});
  }, [appointment]);

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.client_name = "Nome do cliente é obrigatório";
    }

    if (!clientContact.trim()) {
      newErrors.client_contact = "Contato do cliente é obrigatório";
    }

    if (!selectedServiceId) {
      newErrors.service_id = "Serviço é obrigatório";
    }

    if (!selectedWorkerId) {
      newErrors.employee_id = "Profissional é obrigatório";
    }

    if (!startTime.trim()) {
      newErrors.start_time = "Data e hora são obrigatórias";
    } else {
      try {
        new Date(startTime).toISOString();
      } catch {
        newErrors.start_time = "Formato de data/hora inválido (ex: YYYY-MM-DDTHH:mm:ss)";
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleUpdate = async () => {
    const { isValid, errors: validationErrors } = validateForm();

    if (!isValid) {
      const errorMessages = Object.values(validationErrors).filter(msg => msg);
      if (errorMessages.length > 0) {
        setMessage(`Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`);
      }
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setErrors({});

    const changedFields: Partial<UpdateAppointment> = {};
    let hasChanges = false;

    // Include all fields from the form data, even if they haven't changed,
    // to satisfy backend validation for required fields in PATCH requests.
    // Only actual changes will be processed by the backend due to partial=True.
    changedFields.client_name = clientName;
    changedFields.client_contact = clientContact;
    changedFields.service_id = selectedServiceId;
    changedFields.employee_id = selectedWorkerId;
    changedFields.start_time = startTime;
    changedFields.notes = notes || null; // Ensure notes is null if empty

    // Check for actual changes to determine if an API call is necessary
    if (clientName !== appointment.client_name) {
      hasChanges = true;
    }
    if (clientContact !== appointment.client_contact) {
      hasChanges = true;
    }
    if (selectedServiceId !== appointment.service.id) {
      hasChanges = true;
    }
    if (selectedWorkerId !== appointment.employee.id) {
      hasChanges = true;
    }
    if (startTime !== appointment.start_time.substring(0, 16)) {
      hasChanges = true;
    }
    const currentNotes = notes || null;
    const originalNotes = appointment.notes || null;
    if (currentNotes !== originalNotes) {
      hasChanges = true;
    }

    if (!hasChanges) {
      setMessage("Nenhuma alteração detectada para salvar.");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedData = await updateAppointment(appointment.id, changedFields);
      setMessage("Agendamento atualizado com sucesso!");
      setTimeout(() => {
        onEditSuccess(updatedData);
      }, 5000); // Increased delay to allow message to be seen for longer
    } catch (error: any) {
      if (error.response && error.response.data) {
        const data = error.response.data;
        let backendMsg = "";
        if (typeof data === "string") {
          backendMsg = data;
        } else if (typeof data === "object" && data !== null) {
          // Check if it's a dictionary of field errors
          if (Object.keys(data).length > 0 && Object.values(data).every(val => Array.isArray(val))) {
            const errorMessages = Object.entries(data).map(([field, messages]) => {
              const fieldName = field.replace(/_/g, ' '); // Replace underscores with spaces
              return `${fieldName}: ${(messages as string[]).join(', ')}`;
            });
            backendMsg = `Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`;
          } else {
            backendMsg = Object.values(data).flat().join(" ");
          }
        }
        setMessage(backendMsg || "Erro ao atualizar agendamento. Verifique os dados e tente novamente.");
      } else {
        setMessage("Erro ao atualizar agendamento. Verifique os dados e tente novamente.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Input
        type="text"
        placeholder="Nome do Cliente"
        theme="black"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        error={!!errors.client_name}
      />
      <Input
        type="text"
        placeholder="Contato do Cliente (Email ou Telefone)"
        theme="black"
        value={clientContact}
        onChange={(e) => setClientContact(e.target.value)}
        error={!!errors.client_contact}
      />
      <SelectService
        onServiceSelect={setSelectedServiceId}
        selectedServiceId={selectedServiceId}
        error={!!errors.service_id}
      />
      <SelectWorker
        onWorkerSelect={setSelectedWorkerId}
        selectedWorkerId={selectedWorkerId}
        error={!!errors.employee_id}
        disabled={isProfessional} // Disable if user is a professional
      />
      <Input
        type="datetime-local"
        placeholder="Data e Hora de Início"
        theme="black"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        error={!!errors.start_time}
      />
      <div className="flex gap-4 w-full">
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full pt-4 pb-[18px] font-semibold cursor-pointer transition-all bg-gray-500 text-white hover:bg-gray-600"
        >
          Cancelar Edição
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="w-full pt-4 pb-[18px] font-semibold cursor-pointer transition-all bg-[#B490F0] text-white hover:bg-[#8c6fc6]"
        >
          Salvar Alterações
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-center ${
          message.includes("sucesso") 
            ? "bg-green-100 text-green-800 border border-green-300" 
            : "bg-red-100 text-red-800 border border-red-300"
        }`}>
          {message.includes('\n') ? (
            <div className="text-left">
              <div className="font-semibold mb-2">Por favor, corrija os seguintes erros:</div>
              {message.split('\n').slice(1).map((error, index) => (
                <div key={index} className="ml-4">• {error}</div>
              ))}
            </div>
          ) : (
            message
          )}
        </div>
      )}
      {isSubmitting && (
        <div className="text-center text-blue-600">
          Salvando alterações...
        </div>
      )}
    </>
  );
}
