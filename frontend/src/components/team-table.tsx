import { useState, useEffect } from "react";
import EditButton from "./edit-button";
import RemoveButton from "./remove-button";
import { getEmployees } from "../api/api";
import type { Employee } from "../api/api";

export default function TeamTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        setError("Erro ao carregar funcionários");
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="w-full font-syne">
        <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
          <div className="text-start pl-12 font-semibold">Nome</div>
          <div className="text-center font-semibold">Contato</div>
          <div className="text-center font-semibold">Ações</div>
        </div>
        <div className="h-1" />
        <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 flex items-center justify-center h-[367px]">
          <p>Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full font-syne">
        <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
          <div className="text-start pl-12 font-semibold">Nome</div>
          <div className="text-center font-semibold">Contato</div>
          <div className="text-center font-semibold">Ações</div>
        </div>
        <div className="h-1" />
        <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 flex items-center justify-center h-[367px]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-start pl-12 font-semibold">Nome</div>

        <div className="text-center font-semibold">Contato</div>

        <div className="text-center font-semibold">Ações</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        {employees.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p>Nenhum funcionário cadastrado</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-2 lg:grid-cols-3 items-center">
              <div className="pl-12">
                {employee.first_name} {employee.last_name}
              </div>

              <div className="text-center">
                {employee.email}
              </div>

              <div className="text-center flex items-center gap-5 ml-2.5">
                <EditButton path={`/editar-funcionario/${employee.id}`} />
                <RemoveButton />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
