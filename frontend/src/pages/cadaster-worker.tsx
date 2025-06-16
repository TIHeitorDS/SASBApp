import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterWorker() {
  return (
    <Layout title="Cadastrar Funcionário">
      <Input type="text" placeholder="Nome" theme="black" />

      <Input type="text" placeholder="Formação" theme="black" />
    </Layout>
  );
}
