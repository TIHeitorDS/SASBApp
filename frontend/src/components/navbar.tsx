import { Link, NavLink } from "react-router";
import icon from "../assets/SASBApp-logo.svg";
import userProfile from "../assets/user-profile.png";
import arrowDown from "../assets/arrow-down.svg";
import { useState, useEffect, createContext, useContext } from "react";
import menuIcon from "../assets/open-menu.svg";
import closeIcon from "../assets/close-menu.svg";
import { getMe } from "../api/api";

interface AuthUser {
  username: string;
  role: string;
}

const AuthContext = createContext<AuthUser | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getMe().then((data) => {
      setUser({
        username: data.username,
        role: data.role === "ADMIN" ? "Administrador" : "funcionário"
      });
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const isAdmin = user?.role === "Administrador";

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
          {user ? `Logado como ${user.username} (${user.role})` : "Autenticando..."}
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
          <Link
            to="/login"
            className="bg-black text-white absolute bottom-1 inset-x-0 text-center py-1.5"
          >
            Sair
          </Link>
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
              {user ? `Logado como ${user.username} (${user.role})` : "Autenticando..."}
            </p>

            <div className="ml-auto">
              <Link
                to="/login"
                className="bg-black text-white px-12 text-center py-1.5"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
