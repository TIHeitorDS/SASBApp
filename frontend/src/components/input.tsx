export default function Input({
  type,
  placeholder = "",
  theme = "white",
}: {
  type: "email" | "password" | "text";
  placeholder: string;
  theme?: "white" | "black";
}) {
  const borderType = theme === "white" ? "border-white/25" : "border-[#c4c4c4]";
  const textColor = theme === "white" ? "text-white" : "text-[#767575]";

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`border pt-[15px] pb-[17px] pl-[21px] ${borderType} w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent ${textColor} placeholder:${textColor}/25 transition-all`}
    />
  );
}
