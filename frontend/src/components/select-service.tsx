import { useState, useEffect } from "react";
import { getServices, type Service } from "../api/services";

interface SelectServiceProps {
  onServiceSelect: (serviceId: number) => void;
  selectedServiceId: number;
}

export default function SelectService({ onServiceSelect, selectedServiceId }: SelectServiceProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError("Erro ao carregar serviços.");
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

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <select
      className="border pt-[15px] pb-[17px] pl-[21px] border-[#c4c4c4] w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent text-[#767575]/80 transition-all"
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
