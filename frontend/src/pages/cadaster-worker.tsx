import { useState } from "react";
import { createEmployee } from "../api/api";
import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterWorker() {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createEmployee(formData);
      setMessage("Funcionário cadastrado com sucesso!");
    } catch (error) {
      setMessage("Erro ao cadastrar funcionário.");
    }
  };

  return (
    <Layout title="Cadastrar Funcionário" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Nome de usuário"
        theme="black"
        value={formData.username}
        onChange={handleChange("username")}
      />
      <Input
        type="password"
        placeholder="Senha"
        theme="black"
        value={formData.password}
        onChange={handleChange("password")}
      />
      <Input
        type="text"
        placeholder="Nome"
        theme="black"
        value={formData.first_name}
        onChange={handleChange("first_name")}
      />
      <Input
        type="text"
        placeholder="Sobrenome"
        theme="black"
        value={formData.last_name}
        onChange={handleChange("last_name")}
      />
      <Input
        type="email"
        placeholder="Email"
        theme="black"
        value={formData.email}
        onChange={handleChange("email")}
      />
      <Input
        type="text"
        placeholder="Telefone (opcional)"
        theme="black"
        value={formData.phone}
        onChange={handleChange("phone")}
      />
      
      {message && <p>{message}</p>}
    </Layout>
  );
}
