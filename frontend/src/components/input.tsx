export default function Input({
  type,
  placeholder = "",
  theme = "white",
  value,
  onChange,
  error = false,
}: {
  type: "email" | "password" | "text";
  placeholder: string;
  theme?: "white" | "black";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
}) {
  const borderType = theme === "white" ? "border-white/25" : "border-[#c4c4c4]";
  const textColor = theme === "white" ? "text-white" : "text-[#767575]";
  const errorBorder = error ? "border-red-500" : borderType;

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border pt-[15px] pb-[17px] pl-[21px] ${errorBorder} w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent ${textColor} placeholder:${textColor}/25 transition-all`}
    />
  );
}
