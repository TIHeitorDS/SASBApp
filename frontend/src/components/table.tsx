export default function Table() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 bg-gray-secondary/3 border-[0.5px] border-gray py-3 font-syne">
        <div className="text-start pl-12">Serviço</div>
        <div className="text-center">Cliente</div>
        <div className="text-center">Profissional</div>
        <div className="text-center">Data</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-4 items-center">
          <div className="pl-12">Maquiagem para casamento</div>
          <div className="text-center">Helena</div>
          <div className="text-center">Maria</div>
          <div className="text-center">03/07/2025 09h00</div>
        </div>

        <div className="grid grid-cols-4 items-center">
          <div className="pl-12">Aplicação de unhas de gel</div>
          <div className="text-center">Paula</div>
          <div className="text-center">Francisca</div>
          <div className="text-center">03/07/2025 09h00</div>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}
