export default function TeamTable() {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-start pl-12 font-semibold lg:col-span-3">Nome</div>
        <div className="text-center font-semibold">Formação</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-2 lg:grid-cols-4 items-center">
          <div className="pl-12 lg:col-span-3">Maria</div>
          <div className="text-center">Maquiadora</div>
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
}
