import NavButton from "../components/nav-button";
import ServicesTable from "../components/services-table";

export default function Services() {
  return (
    <>
      <ServicesTable />

      <NavButton path="/novo-servico" text="Novo Serviço" />
    </>
  );
}
