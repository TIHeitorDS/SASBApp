export default function Table() {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-4 bg-gray-secondary/3 border-[0.5px] border-gray py-3 font-syne">
        <div className="text-center lg:text-start text-sm lg:text-base lg:pl-12 font-semibold" >Serviço</div>
        <div className="text-center text-sm lg:text-base font-semibold">Cliente</div>
        <div className="text-center text-sm lg:text-base font-semibold">Profissional</div>
        <div className="text-center text-sm lg:text-base font-semibold">Data</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 pl-1.5 lg:px-0 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-4 items-center">
          <div className="lg:pl-12 text-sm lg:text-base">Maquiagem para casamento</div>
          <div className="text-center text-sm lg:text-base">Helena</div>
          <div className="text-center text-sm lg:text-base">Maria</div>
          <div className="text-center text-sm lg:text-base">03/07/2025 09h00</div>
        </div>

        <div className="grid grid-cols-4 items-center">
          <div className="lg:pl-12 text-sm lg:text-base">Aplicação de unhas de gel</div>
          <div className="text-center text-sm lg:text-base">Paula</div>
          <div className="text-center text-sm lg:text-base">Francisca</div>
          <div className="text-center text-sm lg:text-base">03/07/2025 09h00</div>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}
