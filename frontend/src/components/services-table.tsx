export default function ServicesTable() {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-center lg:text-start text-sm lg:text-base lg:pl-12 font-semibold">
          Serviço
        </div>

        <div className="text-center font-semibold text-sm lg:text-base">
          Duração
        </div>

        <div className="text-center font-semibold text-sm lg:text-base ">
          Preço
        </div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center">
          <div className="pl-12 text-sm lg:text-base ">
            Maquiagem para casamento
          </div>

          <div className="text-center text-sm lg:text-base">120 horas</div>

          <div className="text-center text-sm lg:text-base">R$ 145,50</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 items-center">
          <div className="pl-12 text-sm lg:text-base ">
            Manutenção de unhas de gel
          </div>

          <div className="text-center text-sm lg:text-base">1 horas</div>

          <div className="text-center text-sm lg:text-base">R$ 50,00</div>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}
