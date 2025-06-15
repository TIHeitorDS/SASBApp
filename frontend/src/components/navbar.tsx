import { NavLink } from "react-router";
import icon from "../assets/SASBApp-logo.svg";
import userProfile from "../assets/user-profile.png";
import arrowDown from "../assets/arrow-down.svg";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-[100px] h-[123px]">
      <div>
        <img src={icon} alt="imagem da logo SASBApp" />
      </div>

      <ul className="flex gap-10">
        <li>
          <NavLink
            to={"agendamentos"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
          >
            Agendamentos
          </NavLink>
        </li>

        <li>
          <NavLink
            to={"servicos"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
          >
            Serviços
          </NavLink>
        </li>

        <li>
          <NavLink
            to={"equipe"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
          >
            Equipe
          </NavLink>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        <img src={userProfile} alt="foto de perfil do usuário" />
        <p>Maria</p>

        <button type="button" className="cursor-pointer">
          <img src={arrowDown} alt="" />
        </button>
      </div>
    </nav>
  );
}
