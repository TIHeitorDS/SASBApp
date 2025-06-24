import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterWorker() {
  return (
    <Layout title="Cadastrar Funcionário">
      <Input type="text" placeholder="Nome" theme="black" />

      <Input type="text" placeholder="Sobrenome" theme="black" />

      <Input type="email" placeholder="Email" theme="black" />

      <Input type="password" placeholder="Senha" theme="black" />
    </Layout>
  );
}
