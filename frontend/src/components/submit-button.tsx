import clsx from "clsx";
import { useLocation } from "react-router";

export default function SubmitButton({
  text,
  type = "button", // Adicionado com valor padrão 'button'
}: {
  text: string;

  type?: "button" | "submit" | "reset"; // Propriedade de tipo adicionada
}) {
  const location = useLocation();
  const isCadasterOrLoginPage =
    location.pathname.includes("signup") || location.pathname.includes("login");

  return (
    <button
      type={type} // Usando a propriedade de tipo
      className={clsx(
        isCadasterOrLoginPage
          ? "bg-white text-black hover:bg-white/90"
          : "bg-black text-white hover:bg-black/90",
        "w-full pt-4 pb-[18px] font-semibold cursor-pointer hover:bg-${theme}/90 transition-all"
      )}
    >
      {text}
    </button>
  );
}
