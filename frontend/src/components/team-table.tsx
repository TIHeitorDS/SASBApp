import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getUsersByRole, deleteEmployee, type Employee } from "../api/employees";
import EditIcon from "/edit.svg";
import DeleteIcon from "/bin.svg";

export default function TeamTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getUsersByRole(['EMPLOYEE', 'PROFESSIONAL']);
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

  const handleRemove = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja remover este funcionário?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      alert("Erro ao remover funcionário.");
    }
  };

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
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-gray-secondary/3 border-[0.5px] border-gray py-3"> {}
        <div className="text-start pl-12 font-semibold">Nome</div>

        <div className="text-center font-semibold">Contato</div>

        <div className="text-center font-semibold">Cargo</div> {}

        <div className="text-center font-semibold">Ações</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-auto"> {}
        {employees.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p>Nenhum funcionário cadastrado</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-2 lg:grid-cols-4 items-center"> {}
              <div className="pl-12">
                {employee.first_name} {employee.last_name}
              </div>

              <div className="text-center">
                {employee.email}
              </div>

              <div className="text-center"> {}
                {employee.role}
              </div>

              <div className="text-center flex items-center gap-5 justify-center"> {}
                <NavLink 
                  to={`/editar-funcionario/${employee.id}`}
                  className="bg-[#B490F0] text-white rounded-[2px] py-[10px] px-[10px] font-semibold transition-all hover:bg-[#8c6fc6] flex items-center justify-center"
                >
                  <img src={EditIcon} alt="Editar" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                </NavLink>
                <button
                  type="button"
                  className="bg-black text-white rounded-[2px] py-[10px] px-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600 flex items-center justify-center"
                  onClick={() => handleRemove(employee.id)}
                >
                  <img src={DeleteIcon} alt="Remover" className="w-6 h-6" style={{ filter: 'invert(100%)' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
