export default function ServicesTable() {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-4 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-start pl-12 font-semibold col-span-3">Serviço</div>
        <div className="text-center font-semibold">Categoria</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-4 items-center">
          <div className="pl-12 col-span-3">Maquiagem para casamento</div>
          <div className="text-center">Maquiagem</div>
        </div>

        <div className="grid grid-cols-4 items-center">
          <div className="pl-12 col-span-3">Manutenção de unhas de gel</div>
          <div className="text-center">Unhas</div>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}
