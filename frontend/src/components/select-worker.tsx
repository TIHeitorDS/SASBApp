import { useState, useEffect } from "react";
import { getProfessionals, type Employee } from "../api/employees";

interface SelectWorkerProps {
  onWorkerSelect: (workerId: number) => void;
  selectedWorkerId: number | null;
  error?: boolean;
  disabled?: boolean;
}

export default function SelectWorker({ onWorkerSelect, selectedWorkerId, error = false, disabled = false }: SelectWorkerProps) {
  const [workers, setWorkers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await getProfessionals();
        setWorkers(data);
      } catch (err) {
        setFetchError("Erro ao carregar profissionais.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workerId = parseInt(e.target.value);
    onWorkerSelect(workerId);
  };

  if (loading) {
    return <p className="text-gray-500">Carregando profissionais...</p>;
  }

  if (fetchError) {
    return <p className="text-red-500">{fetchError}</p>;
  }

  return (
    <select
      className={`border pt-[15px] pb-[17px] pl-[21px] ${error ? "border-red-500" : "border-[#c4c4c4]"} w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent text-[#767575]/80 transition-all`}
      onChange={handleChange}
      value={selectedWorkerId || ""}
      disabled={disabled}
    >
      <option value="" disabled>
        Selecionar Profissional
      </option>
      {workers.map((worker) => (
        <option key={worker.id} value={worker.id} className="text-[#767575]">
          {worker.first_name} {worker.last_name} ({worker.role})
        </option>
      ))}
    </select>
  );
}
