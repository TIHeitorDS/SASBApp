import { useState, useEffect } from "react";
import NavButton from "../components/nav-button";
import ServicesTable from "../components/services-table";
import apiClient from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface Service {
  id: number;
  name: string;
  duration: number; // Em minutos
  price: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/services/');
        setServices(response.data);
      } catch (err) {
        setError("Não foi possível carregar os serviços.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // --- LÓGICA DE EXCLUSÃO ---
  const handleDeleteService = async (serviceId: number) => {
    try {
      await apiClient.delete(`/services/${serviceId}/`);

      setServices(currentServices =>
        currentServices.filter(service => service.id !== serviceId)
      );
      
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro ao tentar excluir o serviço.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      alert(`Erro: ${errorMessage}`);
      console.error(err);
    }
  };

  if (isLoading) {
    return <p className="text-center mt-10">Carregando serviços...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <>
      <ServicesTable services={services} onDeleteService={handleDeleteService} />
      {user?.role === 'ADMIN' && <NavButton path="/cadastrar-servico" text="Novo Serviço" />}
    </>
  );
}