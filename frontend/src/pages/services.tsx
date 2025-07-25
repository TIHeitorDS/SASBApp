import { useState, useEffect } from "react";
import NavButton from "../components/nav-button";
import ServicesTable from "../components/services-table";
import apiClient from "../api/client";

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

  useEffect(() => {
    // Função para buscar os dados da API
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
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // Renderização condicional
  if (isLoading) {
    return <p className="text-center mt-10">Carregando serviços...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <>
      <ServicesTable services={services} />
      <NavButton path="/cadastrar-servico" text="Novo Serviço" />
    </>
  );
}
