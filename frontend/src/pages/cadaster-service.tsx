import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterService() {
  return (
    <Layout title="Cadastrar Novo Serviço" tableColumns="3">
      <Input type="text" placeholder="Nome do Serviço" theme="black" />

      <Input type="text" placeholder="Duração" theme="black" />

      <Input type="text" placeholder="Preço" theme="black" />
    </Layout>
  );
}
