import { useState, useEffect } from "react";
import NavButton from "../components/nav-button";
import ServicesTable from "../components/services-table";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  can_edit: boolean;
  can_delete: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [message, setMessage] = useState<string>("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/services/');
        setServices(response.data);
      } catch (err) {
        setMessage("Erro: Não foi possível carregar os serviços.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // --- LÓGICA DE EXCLUSÃO ---
  const handleDeleteService = async (serviceId: number) => {
    setMessage(""); // Limpa mensagens antigas

    try {
      await apiClient.delete(`/services/${serviceId}/`);
      setServices(currentServices =>
        currentServices.filter(service => service.id !== serviceId)
      );
      setMessage("Sucesso!\nServiço excluído com sucesso!");

    } catch (err: unknown) {
      let rawErrorMessage = "Ocorreu um erro ao tentar excluir o serviço.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        rawErrorMessage = err.response.data.message;
      }
      setMessage(`Ocorreu um erro:\n${rawErrorMessage}`);
      // console.error(err);
    }

    setTimeout(() => {
        setMessage("");
    }, 5000);
  };

  if (isLoading) {
    return <p className="text-center mt-10">Carregando serviços...</p>;
  }

  // Se o erro inicial de carregamento ocorrer
  if (message.startsWith("Erro") && services.length === 0) {
    return <p className="text-center mt-10 text-red-500">{message.split('\n')[1]}</p>;
  }

  return (
    <>
      <ServicesTable services={services} onDeleteService={handleDeleteService} />
      
      <div className="w-full text-center mt-4">
        {message && (
          <div className={`inline-block p-4 rounded-md text-sm ${
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

      {user?.role === 'ADMIN' && <NavButton path="/cadastrar-servico" text="Novo Serviço" />}
    </>
  );
}