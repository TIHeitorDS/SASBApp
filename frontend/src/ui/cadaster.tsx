import SubmitButton from "../components/submit-button";
import clsx from "clsx";

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

      <form
        action=""
        className={clsx(
          "grid w-full gap-[27px]",
          tableColumns === "2" && "lg:grid-cols-2",
          tableColumns === "3" && "lg:grid-cols-3",
          tableColumns === "4" && "lg:grid-cols-4",
        )}
      >
        {children}
      </form>

      <div className="w-full lg:w-50 mr-auto">
        <SubmitButton text="Cadastrar" theme="black" />
      </div>
    </div>
  );
}
