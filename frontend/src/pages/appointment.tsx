import NavButton from "../components/nav-button";
import Table from "../components/table";

export default function Appointment() {
  return (
    <>
      <Table />

      <div className="mt-10">
        <NavButton path="servicos" text="Novo Agendamento" />
      </div>
    </>
  );
}
