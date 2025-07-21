export default function SubmitButton({
  text,
  theme = "white",
  type = "button", // Adicionado com valor padrão 'button'
}: {
  text: string;
  theme?: "white" | "black";
  type?: "button" | "submit" | "reset"; // Propriedade de tipo adicionada
}) {
  return (
    <button
      type={type} // Usando a propriedade de tipo
      className={`bg-${theme} w-full text-${
        theme === "white" ? "black" : "white"
      } pt-4 pb-[18px] font-semibold cursor-pointer hover:bg-${theme}/90 transition-all`}
    >
      {text}
    </button>
  );
}