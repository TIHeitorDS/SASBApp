import { useState, useEffect } from "react";
import { getServices, type Service } from "../api/services";

interface SelectServiceProps {
  onServiceSelect: (serviceId: number) => void;
  selectedServiceId: number | null;
  error?: boolean;
}

export default function SelectService({ onServiceSelect, selectedServiceId, error = false }: SelectServiceProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setFetchError("Erro ao carregar serviços.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = parseInt(e.target.value);
    onServiceSelect(serviceId);
  };

  if (loading) {
    return <p className="text-gray-500">Carregando serviços...</p>;
  }

  if (fetchError) {
    return <p className="text-red-500">{fetchError}</p>;
  }

  return (
    <select
      className={`border pt-[15px] pb-[17px] pl-[21px] ${error ? "border-red-500" : "border-[#c4c4c4]"} w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent text-[#767575]/80 transition-all`}
      onChange={handleChange}
      value={selectedServiceId || ""}
    >
      <option value="" disabled>
        Selecionar Serviço
      </option>
      {services.map((service) => (
        <option key={service.id} value={service.id} className="text-[#767575]">
          {service.name}
        </option>
      ))}
    </select>
  );
}
