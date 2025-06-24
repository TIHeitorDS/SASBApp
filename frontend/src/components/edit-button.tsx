import { NavLink } from "react-router";

export default function EditButton({ path }: { path: string }) {
  return (
    <NavLink
      to={path}
      className="bg-[#B490F0] text-black rounded-[2px] py-[10px] px-[43px] font-semibold"
    >
      Editar
    </NavLink>
  );
}
