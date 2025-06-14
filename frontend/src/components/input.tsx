export default function Input({
  type,
  placeholder = "",
}: {
  type: "email" | "password" | "text";
  placeholder: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="border pt-[15px] pb-[17px] pl-[21px] border-white/25 w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent text-white placeholder:text-white/25 transition-all"
    />
  );
}
