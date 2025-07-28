import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../components/input";
import Layout from "../ui/cadaster";
import apiClient from "../api/client";

export default function CadasterService() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();

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
    
    // Conversão de dados    
    const durationInt = parseInt(duration, 10);
    const priceFloat = parseFloat(price.replace(",", "."));

    try {
      await apiClient.post("/services/", {
        name: name,
        duration: durationInt,
        price: priceFloat.toFixed(2),
      });

      setMessage("Serviço cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/servicos");
      }, 1500);

    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const errorData = err.response.data;
        const errorMessages = Object.values(errorData).flat();
        setMessage(`Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`);
      } else {
        setMessage("Ocorreu um erro desconhecido ao cadastrar o serviço.");
      }
      console.error(err);
    }
  };

  return (
    <Layout
      title="Cadastrar Novo Serviço"
      tableColumns="3"
      onSubmit={handleSubmit}
      buttonText="Cadastrar Serviço"
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
        placeholder="Preço (ex: 160.00)"
        theme="black"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={!!errors.price} 
      />
      
      <div className="lg:col-span-3">
        {message && (
          <div className={`p-4 rounded-md text-sm ${
            message.includes("sucesso") 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            {message.includes('\n') ? (
              <div className="text-left">
                <div className="font-bold mb-2">{message.split('\n')[0]}</div>
                <ul className="list-disc pl-5">
                  {message.split('\n').slice(1).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              message
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}