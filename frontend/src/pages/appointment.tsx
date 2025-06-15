import NavButton from "../components/nav-button";
import Table from "../components/table";

export default function Appointment() {
  return (
    <>
      <Table />

      <NavButton path="servicos" text="Novo Agendamento" />
    </>
  );
}
