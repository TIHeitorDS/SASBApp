import NavButton from "../components/nav-button";
import TeamTable from "../components/team-table";

export default function Team() {
  return (
    <>
      <TeamTable />
      
      <NavButton path="/cadastrar-funcionario" text="Cadastrar Funcionário" />
    </>
  );
}
