import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../components/input";
import Layout from "../ui/cadaster";
import apiClient from "../api/api";

export default function CadasterService() {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const durationRegex = /^\d+$/;
    const priceRegex = /^\d+([.,]\d{1,2})?$/;

    if (!name || !duration.match(durationRegex) || !price.match(priceRegex)) {
      setError(
        "Por favor, preencha os campos com valores válidos. Duração deve conter apenas números (minutos), e o preço um valor monetário."
      );
      return;
    }

    // Conversão de dados
    const durationInt = parseInt(duration, 10);
    const priceFloat = parseFloat(price.replace(",", "."));

    try {
      await apiClient.post("/services/", {
        name: name,
        duration: durationInt,
        price: priceFloat.toFixed(2),
      });

      setSuccess("Serviço cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/servicos");
      }, 1500);
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido ao cadastrar o serviço.";

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const errorData = err.response.data;
        const firstErrorField = Object.keys(errorData)[0];
        errorMessage = errorData[firstErrorField][0];
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(`Erro: ${errorMessage}`);
      console.error(err);
    }
  };

  return (
    <Layout
      title="Cadastrar Novo Serviço"
      tableColumns="3"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        placeholder="Nome do Serviço"
        theme="black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Duração (em minutos)"
        theme="black"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Preço (ex: 160.00)"
        theme="black"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* Mensagens de feedback */}
      <div className="lg:col-span-3">
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mb-2">{success}</p>
        )}
      </div>
    </Layout>
  );
}
