import { NavLink } from "react-router-dom";
import icon from "../assets/SASBApp-logo.svg";
import arrowDown from "../assets/arrow-down.svg";
import { useState } from "react";
import menuIcon from "../assets/open-menu.svg";
import closeIcon from "../assets/close-menu.svg";
import { useAuth } from "../contexts/useAuth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  let userRole = "";
  if (user?.role === "ADMIN") {
    userRole = "Administrador";
  } else if (user?.role === "EMPLOYEE") {
    userRole = "Funcionário";
  } else if (user?.role === "PROFESSIONAL") {
    userRole = "Profissional";
  }

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
        {isAdmin && (
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
        )}
      </ul>

      <div className="hidden md:flex items-center gap-4 relative h-full">
        <p className="font-semibold">
          {isLoading ? "Carregando..." : user ? `Logado como ${user.username} (${userRole})` : "Não autenticado"}
        </p>

        <button
          type="button"
          className="cursor-pointer"
          onClick={() => setShowExitButton(!showExitButton)}
        >
          <img
            src={arrowDown}
            alt="Abrir menu"
            className={`${
              showExitButton ? "rotate-180" : "rotate-0"
            } transform transition-all`}
          />
        </button>

        {showExitButton && (
          <button
            onClick={logout}
            className="bg-black text-white absolute bottom-1 inset-x-0 text-center py-1.5 w-full hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        )}
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
          {isAdmin && (
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
          )}

          <div className="w-full flex items-center gap-2 mt-4">
            <p className="font-semibold">
              {isLoading ? "Carregando..." : user ? `Logado como ${user.username} (${userRole})` : "Não autenticado"}
            </p>
            <div className="ml-auto">
              <button
                onClick={logout}
                className="bg-black text-white px-12 text-center py-1.5 hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}