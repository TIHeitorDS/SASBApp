import { useEffect } from "react";
import Input from "../components/input";
import SubmitButton from "../components/submit-button";
import Layout from "../ui/login-signup";
import { Link } from "react-router";

export default function Login() {
  useEffect(() => {
    document.title = "SASBApp | Login";
  }, []);

  return (
    <Layout
      title="Login"
      subtitle="Bem-vindo ao sistema! Estávamos esperando pela sua volta. Faça login para continuar."
    >
      <form action="" className="space-y-9">
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Senha" />

        <div className="flex gap-3 items-center">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            className="w-5 h-5 appearance-none border border-white/25 checked:bg-pink cursor-pointer"
          />

          <label htmlFor="remember">Lembrar de mim</label>
        </div>

        <SubmitButton text="Entrar" />
      </form>

      <p className="text-center mt-8">
        Não tem uma conta?{" "}
        <Link to={"/signup"} className="text-pink underline underline-offset-2 hover:text-pink/90 transition-all">
          Cadastrar-se
        </Link>
      </p>
    </Layout>
  );
}
