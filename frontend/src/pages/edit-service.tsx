import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Input from "../components/input";
import Layout from "../ui/cadaster";
import apiClient from "../api/client";
import SubmitButton from "../components/submit-button";

export default function EditService() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  // Estados do formulário
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiClient.get(`/services/${serviceId}/`)
      .then(response => {
        const service = response.data;
        setName(service.name);
        setDuration(String(service.duration));
        setPrice(String(service.price));
      })
      .catch(error => {
        console.error("Erro ao buscar serviço:", error);
        setMessage("Erro: Não foi possível carregar os dados do serviço.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [serviceId]);

  const validateForm = (): { isValid: boolean; newErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    const durationRegex = /^\d+$/;
    const priceRegex = /^\d+([.,]\d{1,2})?$/;

    if (!name.trim()) newErrors.name = "Nome do serviço é obrigatório";
    if (!duration.trim()) {
      newErrors.duration = "Duração é obrigatória";
    } else if (!duration.match(durationRegex)) {
      newErrors.duration = "Duração deve conter apenas números";
    }
    if (!price.trim()) {
      newErrors.price = "Preço é obrigatório";
    } else if (!price.match(priceRegex)) {
      newErrors.price = "Preço deve ter um formato monetário válido";
    }
    
    return { isValid: Object.keys(newErrors).length === 0, newErrors };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      setErrors(newErrors);
      const errorValues = Object.values(newErrors);
      const formattedMessage = `Por favor, corrija os seguintes erros:\n${errorValues.join('\n')}`;
      setMessage(formattedMessage);
      return;
    }
    
    const durationInt = parseInt(duration, 10);
    const priceFloat = parseFloat(price.replace(",", "."));

    try {
      await apiClient.patch(`/services/${serviceId}/`, {
        name: name,
        duration: durationInt,
        price: priceFloat.toFixed(2),
      });

      setMessage("Sucesso!\nServiço atualizado com sucesso!");
      setTimeout(() => {
        navigate("/servicos");
      }, 1500);

    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const errorData = err.response.data;
        const errorMessages = Object.values(errorData).flat();
        setMessage(`Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`);
      } else {
        setMessage("Ocorreu um erro desconhecido ao atualizar o serviço.");
      }
      console.error(err);
    }
  };
  
  const handleCancel = () => {
    navigate("/servicos");
  };

  if (isLoading) {
    return (
      <Layout title="Editar Serviço" onSubmit={() => {}}>
        <p className="text-center">Carregando dados do serviço...</p>
      </Layout>
    );
  }

  return (
    <Layout
      title="Editar Serviço"
      tableColumns="3"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        placeholder="Nome do Serviço"
        theme="black"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!errors.name}
      />
      <Input
        type="text"
        placeholder="Duração (em minutos)"
        theme="black"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        error={!!errors.duration}
      />
      <Input
        type="text"
        placeholder="Preço (ex: 160,00)"
        theme="black"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={!!errors.price}
      />
      
      <div className="lg:col-span-3">
        {message && (
          <div className={`p-4 rounded-md text-sm ${
            message.startsWith("Sucesso")
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            {message.includes('\n') ? (
              <div className="text-left">
                <div className="font-bold mb-2">{message.split('\n')[0]}</div>
                <ul className="list-disc pl-5">
                  {message.split('\n').slice(1).map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : (
              message
            )}
          </div>
        )}
      </div>
      
      <div className="lg:col-span-3 mt-4 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-3 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold"
        >
          Cancelar
        </button>
        <SubmitButton text="Salvar Alterações" type="submit" />
      </div>
    </Layout>
  );
}