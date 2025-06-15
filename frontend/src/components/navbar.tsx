import { NavLink } from "react-router";
import icon from "../assets/SASBApp-logo.svg";
import userProfile from "../assets/user-profile.png";
import arrowDown from "../assets/arrow-down.svg";
import { useState } from "react";
import menuIcon from "../assets/open-menu.svg";
import closeIcon from "../assets/close-menu.svg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-6 md:px-[100px] h-[80px] md:h-[123px] relative">
      <div>
        <img src={icon} alt="imagem da logo SASBApp" className="h-10" />
      </div>

      <ul className="hidden md:flex gap-10">
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

      <div className="hidden md:flex items-center gap-4">
        <img
          src={userProfile}
          alt="foto de perfil do usuário"
          className="w-8 h-8 rounded-full"
        />
        <p>Maria</p>
        <button type="button" className="cursor-pointer">
          <img src={arrowDown} alt="Abrir menu" />
        </button>
      </div>

      <button
        className="md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        <img
          src={menuOpen ? closeIcon : menuIcon}
          alt="Ícone do menu"
          className="w-6 h-6"
        />
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white-secondary shadow-md flex flex-col items-start px-6 py-4 gap-4 md:hidden z-50">
          <NavLink
            to={"agendamentos"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
            onClick={() => setMenuOpen(false)}
          >
            Agendamentos
          </NavLink>
          <NavLink
            to={"servicos"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
            onClick={() => setMenuOpen(false)}
          >
            Serviços
          </NavLink>
          <NavLink
            to={"equipe"}
            className={({ isActive }) =>
              isActive
                ? "font-bold"
                : "font-normal hover:font-bold transition-all"
            }
            onClick={() => setMenuOpen(false)}
          >
            Equipe
          </NavLink>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={userProfile}
              alt="foto de perfil do usuário"
              className="w-8 h-8 rounded-full"
            />
            <p>Maria</p>
          </div>
        </div>
      )}
    </nav>
  );
}
