import { useState } from "react";
import { createUser, type CreateEmployee } from "../api/employees";
import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterWorker() {
  const [formData, setFormData] = useState<CreateEmployee>({
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

  const handleChange = (field: keyof CreateEmployee) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    const username = formData.username.trim();
    if (!username) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (username.includes(' ')) {
      newErrors.username = "O nome de usuário não pode conter espaços";
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Nome é obrigatório";
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Sobrenome é obrigatório";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    
    // Executa a validação e captura os erros
    const { isValid, errors: validationErrors } = validateForm();
    const username = formData.username.trim();
    
    // Se há erros, exibe a mensagem e para a execução
    if (!isValid) {
      const errorMessages = Object.values(validationErrors).filter(msg => msg);
      if (errorMessages.length > 0) {
        setMessage(`Por favor, corrija os seguintes erros:\n${errorMessages.join('\n')}`);
      }
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    
    createUser({ ...formData, username: username.toLowerCase(), role: formData.role })
      .then(() => {
        setMessage("Funcionário cadastrado com sucesso!");
        setFormData({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          phone: "",
          role: "EMPLOYEE",
        });
        setErrors({});
      })
      .catch(() => {
        setMessage("Erro ao cadastrar funcionário. Verifique os dados e tente novamente.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Layout
      title="Cadastrar Usuário"
      onSubmit={handleSubmit}
      buttonText="Cadastrar Funcionário"
    >
      {" "}
      {}
      <Input
        type="text"
        placeholder="Nome de usuário"
        theme="black"
        value={formData.username}
        onChange={handleChange("username")}
        error={!!errors.username}
      />
      <Input
        type="password"
        placeholder="Senha"
        theme="black"
        value={formData.password}
        onChange={handleChange("password")}
        error={!!errors.password}
      />
      <Input
        type="text"
        placeholder="Nome"
        theme="black"
        value={formData.first_name}
        onChange={handleChange("first_name")}
        error={!!errors.first_name}
      />
      <Input
        type="text"
        placeholder="Sobrenome"
        theme="black"
        value={formData.last_name}
        onChange={handleChange("last_name")}
        error={!!errors.last_name}
      />
      <Input
        type="email"
        placeholder="Email"
        theme="black"
        value={formData.email}
        onChange={handleChange("email")}
        error={!!errors.email}
      />
      <Input
        type="text"
        placeholder="Telefone (opcional)"
        theme="black"
        value={formData.phone || ""}
        onChange={handleChange("phone")}
      />
      <div className="mb-4">
        {/* <label htmlFor="role-select" className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de Usuário:
        </label> */}
        <select
          id="role-select"
          name="role"
          value={formData.role}
          onChange={handleChange("role")}
          className="appearance-none border border-[#c4c4c4] pt-[15px] pb-[17px] pl-[21px] w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent transition-all"
        >
          <option value="" disabled>
            Selecione um tipo
          </option>
          <option value="EMPLOYEE">Funcionário</option>
          <option value="PROFESSIONAL">Profissional</option>
        </select>
      </div>
      {message && (
        <div
          className={`p-3 rounded-md text-center ${
            message.includes("sucesso")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.includes("\n") ? (
            <div className="text-left">
              <div className="font-semibold mb-2">
                Por favor, corrija os seguintes erros:
              </div>
              {message
                .split("\n")
                .slice(1)
                .map((error, index) => (
                  <div key={index} className="ml-4">
                    • {error}
                  </div>
                ))}
            </div>
          ) : (
            message
          )}
        </div>
      )}
      {isSubmitting && (
        <div className="text-center text-blue-600">
          Cadastrando funcionário...
        </div>
      )}
    </Layout>
  );
}
