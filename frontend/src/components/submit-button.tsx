export default function SubmitButton({
  text,
  theme = "white",
}: {
  text: string;
  theme?: "white" | "black";
}) {
  return (
    <button
      type="button"
      className={`bg-${theme} w-full text-${
        theme === "white" ? "black" : "white"
      } pt-4 pb-[18px] font-semibold cursor-pointer hover:bg-${theme}/90 transition-all`}
    >
      {text}
    </button>
  );
}
