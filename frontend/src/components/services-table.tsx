interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
}

// Função auxiliar para formatar a duração de minutos para horas/minutos
const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export default function ServicesTable({ services }: { services: Service[] }) {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-center lg:text-start text-sm lg:text-base lg:pl-12 font-semibold">Serviço</div>
        <div className="text-center font-semibold text-sm lg:text-base">Duração</div>
        <div className="text-center font-semibold text-sm lg:text-base ">Preço</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-auto">
        {services.length > 0 ? (
          services.map((service) => (
            <div
              key={service.id} // Chave única para cada item da lista
              className="grid grid-cols-2 lg:grid-cols-3 items-center"
            >
              <div className="pl-12 text-sm lg:text-base ">{service.name}</div>
              <div className="text-center text-sm lg:text-base">
                {formatDuration(service.duration)}
              </div>
              <div className="text-center text-sm lg:text-base">
                R$ {service.price}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center pt-10">Nenhum serviço encontrado.</p>
        )}
        <div className="h-5" />
      </div>
    </div>
  );
}