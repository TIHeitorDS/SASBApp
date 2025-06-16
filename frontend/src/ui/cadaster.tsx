import SubmitButton from "../components/submit-button";

export default function Layout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-[27px]">
      <p className="font-syne font-semibold text-4xl">{title}</p>

      <form action="" className="grid grid-cols-2 w-full gap-[27px]">
        {children}
      </form>
      
      <div className="w-50 mr-auto">
        <SubmitButton text="Cadastrar" theme="black" />
      </div>
    </div>
  );
}
