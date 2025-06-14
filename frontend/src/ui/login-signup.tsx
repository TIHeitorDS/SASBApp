export default function Layout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:block w-1/2 bg-[url('/background-image.png')] relative before:bg-black before:absolute before:inset-0 before:opacity-40">
        <img
          src="/sasb-logotipo.svg"
          alt=""
          className="mx-auto h-full p-[69px] relative"
        />
      </div>

      <div className="bg-black lg:w-1/2 px-10 lg:pl-25 lg:pr-50  text-white flex flex-col justify-center">
        <div className="space-y-2.5">
          <p className="font-syne text-[32px]">{title}</p>

          <p className="text-[18px]">{subtitle}</p>
        </div>

        <div className="mt-14">{children}</div>
      </div>
    </div>
  );
}
