import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterService() {
  return (
    <Layout title="Cadastrar Novo Serviço">
      <Input type="text" placeholder="Nome do Serviço" theme="black" />

      <Input type="text" placeholder="Categoria" theme="black" />
    </Layout>
  );
}
