import SubmitButton from "../components/submit-button";
import clsx from "clsx";

export default function Layout({
  title,
  children,
  tableColumns = "2",
  onSubmit,
  buttonText,
}: {
  title: string;
  children: React.ReactNode;
  tableColumns?: string;
  onSubmit: (e: React.FormEvent) => void;
  buttonText?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-[27px]">
      <p className="font-syne font-semibold text-2xl text-center lg:text-4xl">
        {title}
      </p>

      <form
        onSubmit={onSubmit}
        className={clsx(
          "grid w-full gap-[27px]",
          tableColumns === "2" && "lg:grid-cols-2",
          tableColumns === "3" && "lg:grid-cols-3",
          tableColumns === "4" && "lg:grid-cols-4"
        )}
      >
        {children}

        {buttonText && (
          <div className="w-full ml-auto">
            <SubmitButton text={buttonText} type="submit" />
          </div>
        )}
      </form>
    </div>
  );
}
