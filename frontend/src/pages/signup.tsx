import { useEffect } from "react";
import Input from "../components/input";
import SubmitButton from "../components/submit-button";
import Layout from "../ui/login-signup";

export default function SignUp() {
  useEffect(() => {
    document.title = "SASBApp | Cadastro";
  }, []);

  return (
    <Layout
      title="Cadastro"
      subtitle="Bem-vindo ao SASBApp. Esperamos que nossa parceria seja duradoura!"
    >
      <form action="" className="space-y-9">
        <Input type="text" placeholder="Seu Nome" />
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Senha" />

        <SubmitButton text="Cadastrar" />
      </form>

      <p className="text-center mt-8">
        Já tem uma conta?{" "}
        <span className="text-pink underline underline-offset-2 hover:text-pink/90 transition-all">
          Login
        </span>
      </p>
    </Layout>
  );
}
