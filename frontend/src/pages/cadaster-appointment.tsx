import { useState } from "react";
import Input from "../components/input";
import SelectService from "../components/select-service";
import SelectWorker from "../components/select-worker";
import Layout from "../ui/cadaster";
import { createAppointment, type CreateAppointment } from "../api/appointments";

export default function CadasterAppointment() {
  const [formData, setFormData] = useState<CreateAppointment>({
    client_name: "",
    client_contact: "",
    service_id: 0,
    employee_id: 0,
    start_time: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CreateAppointment) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      [field]: value 
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    setFormData((prev) => ({ ...prev, service_id: serviceId }));
    if (errors.service_id) {
      setErrors(prev => ({ ...prev, service_id: "" }));
    }
  };

  const handleWorkerSelect = (workerId: number) => {
    setFormData((prev) => ({ ...prev, employee_id: workerId }));
    if (errors.employee_id) {
      setErrors(prev => ({ ...prev, employee_id: "" }));
    }
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client_name.trim()) {
      newErrors.client_name = "Nome do cliente é obrigatório";
    }
    
    if (!formData.client_contact.trim()) {
      newErrors.client_contact = "Contato do cliente é obrigatório";
    }
    
    if (!formData.service_id) {
      newErrors.service_id = "Serviço é obrigatório";
    }
    
    if (!formData.employee_id) {
      newErrors.employee_id = "Profissional é obrigatório";
    }
    
    if (!formData.start_time.trim()) {
      newErrors.start_time = "Data e hora são obrigatórias";
    } else {
      try {
        new Date(formData.start_time).toISOString();
      } catch {
        newErrors.start_time = "Formato de data/hora inválido (ex: YYYY-MM-DDTHH:mm:ss)";
      }
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    
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
    
    createAppointment(formData)
      .then(() => {
        setMessage("Agendamento cadastrado com sucesso!");
        setFormData({
          client_name: "",
          client_contact: "",
          service_id: 0,
          employee_id: 0,
          start_time: "",
          notes: "",
        });
        setErrors({});
      })
      .catch(() => {
        setMessage("Erro ao cadastrar agendamento. Verifique os dados e tente novamente.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Layout title="Cadastrar Novo Agendamento" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Nome do Cliente"
        theme="black"
        value={formData.client_name}
        onChange={handleChange("client_name")}
        error={!!errors.client_name}
      />

      <Input
        type="text"
        placeholder="Contato do Cliente (Email ou Telefone)"
        theme="black"
        value={formData.client_contact}
        onChange={handleChange("client_contact")}
        error={!!errors.client_contact}
      />

      <SelectService onServiceSelect={handleServiceSelect} selectedServiceId={formData.service_id} />
      {errors.service_id && <p className="text-red-500 text-xs italic">{errors.service_id}</p>}

      <SelectWorker onWorkerSelect={handleWorkerSelect} selectedWorkerId={formData.employee_id} />
      {errors.employee_id && <p className="text-red-500 text-xs italic">{errors.employee_id}</p>}

      <Input
        type="datetime-local"
        placeholder="Data e Hora de Início"
        theme="black"
        value={formData.start_time}
        onChange={handleChange("start_time")}
        error={!!errors.start_time}
      />

      <Input
        type="text"
        placeholder="Observações (opcional)"
        theme="black"
        value={formData.notes || ""}
        onChange={handleChange("notes")}
      />
      
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
          Cadastrando agendamento...
        </div>
      )}
    </Layout>
  );
}
