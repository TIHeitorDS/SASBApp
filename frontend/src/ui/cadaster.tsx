import SubmitButton from "../components/submit-button";

export default function Layout({
  title,
  children,
  tableColumns = "2",
}: {
  title: string;
  children: React.ReactNode;
  tableColumns?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-[27px]">
      <p className="font-syne font-semibold text-2xl text-center lg:text-4xl">
        {title}
      </p>

      <form action="" className={`grid lg:grid-cols-${tableColumns} w-full gap-[27px]`}>
        {children}
      </form>

      <div className="w-full lg:w-50 mr-auto">
        <SubmitButton text="Cadastrar" theme="black" />
      </div>
    </div>
  );
}
