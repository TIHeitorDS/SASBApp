import Input from "../components/input";
import Layout from "../ui/cadaster";

export default function CadasterAppointment() {
  return (
    <Layout title="Cadastrar Novo Agendamento">
      <Input type="text" placeholder="Cliente" theme="black" />
      <Input type="email" placeholder="Email" theme="black" />
      <Input type="text" placeholder="Telefone" theme="black" />
      <Input type="text" placeholder="Selecionar Serviço" theme="black" />
      <Input type="text" placeholder="Selecionar Data" theme="black" />
      <Input type="email" placeholder="Selecionar profissional" theme="black" />
    </Layout>
  );
}
