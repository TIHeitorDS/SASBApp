// login.tsx

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../components/input";
import SubmitButton from "../components/submit-button";
import Layout from "../ui/login-signup";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SASBApp | Login";
  }, []);

  // Função para lidar com a submissão do formulário
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Previne o recarregamento padrão da página
    setError(""); // Limpa mensagens de erro anteriores

    // Validação simples no frontend
    if (!username || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      // Chamada para a API do Django
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username: username,
          password: password,
        }
      );

      // Armazena os tokens no localStorage para persistir a sessão
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Configura o cabeçalho de autorização para futuras requisições com axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Redireciona para a página principal da aplicação após o login
      navigate("/servicos");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError("Usuário ou senha inválidos.");
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
      console.error("Falha no login:", err);
    }
  };

  return (
    <Layout
      title="Login"
      subtitle="Bem-vindo ao sistema! Estávamos esperando pela sua volta. Faça login para continuar."
    >
      <form onSubmit={handleLogin} className="space-y-9">
        <Input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-3 items-center">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="w-5 h-5 appearance-none border border-white/25 checked:bg-pink cursor-pointer"
          />
          <label htmlFor="remember">Lembrar de mim</label>
        </div>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

        <SubmitButton text="Entrar" type="submit" />
      </form>

      <p className="text-center mt-8">
        Não tem uma conta?{" "}
        <Link
          to={"/signup"}
          className="text-pink underline underline-offset-2 hover:text-pink/90 transition-all"
        >
          Cadastrar-se
        </Link>
      </p>
    </Layout>
  );
}
