import NavButton from "../components/nav-button";
import ServicesTable from "../components/services-table";

export default function Services() {
  return (
    <>
      <ServicesTable />

      <NavButton path="/cadastrar-servico" text="Novo Serviço" />
    </>
  );
}
