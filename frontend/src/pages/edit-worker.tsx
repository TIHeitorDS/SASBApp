import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployee, updateEmployee } from "../api/employees";
import type { UpdateEmployee, Employee } from "../api/employees";
import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function EditWorker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateEmployee>({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setMessage("ID do funcionário não fornecido");
        setIsLoading(false);
        return;
      }

      try {
        const employee: Employee = await getEmployee(parseInt(id));
        setFormData({
          username: employee.username,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          password: "",
          phone: employee.phone || "",
          role: employee.role,
        });
      } catch (error) {
        setMessage("Erro ao carregar dados do funcionário");
        console.error("Error fetching employee:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (field: keyof UpdateEmployee) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      [field]: field === 'phone' ? (value || undefined) : value 
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};
    
    const username = formData.username?.trim() || "";
    if (!username) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (username.includes(' ')) {
      newErrors.username = "O nome de usuário não pode conter espaços";
    }
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "Nome é obrigatório";
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Sobrenome é obrigatório";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };


  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm();
    const username = formData.username?.trim() || "";
    
    if (!isValid) {
      const errorMessages = Object.values(validationErrors).filter(msg => msg);
      if (errorMessages.length > 0) {
        setMessage(`Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`);
      }
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    
    const updateData: UpdateEmployee = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    if (username) {
      updateData.username = username.toLowerCase();
    }

    updateEmployee(parseInt(id!), updateData)
      .then(() => {
        setMessage("Funcionário atualizado com sucesso!");
        setTimeout(() => {
          navigate("/equipe");
        }, 2000);
      })
      .catch((error: any) => {
        if (error.response && error.response.data) {
          const data = error.response.data;
          let backendMsg = "";
          if (typeof data === "string") {
            backendMsg = data;
          } else if (typeof data === "object") {
            backendMsg = Object.values(data).flat().join(" ");
          }
          setMessage(backendMsg || "Erro ao atualizar funcionário. Verifique os dados e tente novamente.");
        } else {
          setMessage("Erro ao atualizar funcionário. Verifique os dados e tente novamente.");
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando dados do funcionário...</p>
      </div>
    );
  }

  return (
    <Layout title="Editar Usuário" onSubmit={handleSubmit} buttonText="Salvar"> {}
      <Input
        type="text"
        placeholder="Nome de usuário"
        theme="black"
        value={formData.username || ""}
        onChange={handleChange("username")}
        error={!!errors.username}
      />
      
      <Input
        type="text"
        placeholder="Nome"
        theme="black"
        value={formData.first_name || ""}
        onChange={handleChange("first_name")}
        error={!!errors.first_name}
      />
      
      <Input
        type="text"
        placeholder="Sobrenome"
        theme="black"
        value={formData.last_name || ""}
        onChange={handleChange("last_name")}
        error={!!errors.last_name}
      />
      
      <Input
        type="email"
        placeholder="Email"
        theme="black"
        value={formData.email || ""}
        onChange={handleChange("email")}
        error={!!errors.email}
      />
      
      <Input
        type="password"
        placeholder="Nova senha (opcional)"
        theme="black"
        value={formData.password || ""}
        onChange={handleChange("password")}
        error={!!errors.password}
      />
      
      <Input
        type="text"
        placeholder="Telefone (opcional)"
        theme="black"
        value={formData.phone || ""}
        onChange={handleChange("phone")}
      />
      
      <div className="mb-4">
        <label htmlFor="role-select" className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de Usuário:
        </label>
        <select
          id="role-select"
          name="role"
          value={formData.role || ""}
          onChange={handleChange("role")}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="EMPLOYEE">Funcionário</option>
          <option value="PROFESSIONAL">Profissional</option>
        </select>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md text-center ${
          message.includes("sucesso") 
            ? "bg-green-100 text-green-800 border border-green-300" 
            : "bg-red-100 text-red-800 border border-red-300"
        }`}>
          {message.includes('\n') ? (
            <div className="text-left">
              <div className="font-semibold mb-2">Por favor, corrija os seguintes erros:</div>
              {message.split('\n').slice(1).map((error, index) => (
                <div key={index} className="ml-4">• {error}</div>
              ))}
            </div>
          ) : (
            message
          )}
        </div>
      )}
      
      {isSubmitting && (
        <div className="text-center text-blue-600">
          Atualizando funcionário...
        </div>
      )}
    </Layout>
  );
}
