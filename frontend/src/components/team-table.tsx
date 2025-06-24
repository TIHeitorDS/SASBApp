import EditButton from "./edit-button";
import RemoveButton from "./remove-button";

export default function TeamTable() {
  return (
    <div className="w-full font-syne">
      <div className="grid grid-cols-2 lg:grid-cols-3 bg-gray-secondary/3 border-[0.5px] border-gray py-3">
        <div className="text-start pl-12 font-semibold">Nome</div>

        <div className="text-center font-semibold">Contato</div>

        <div className="text-center font-semibold">Ações</div>
      </div>

      <div className="h-1" />

      <div className="bg-gray-tertiary/3 border-[0.5px] border-gray font-syne py-3 space-y-[29px] h-[367px] overflow-scroll">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center">
          <div className="pl-12">Maria</div>

          <div className="text-center">maria@gmail.com</div>

          <div className="text-center flex items-center gap-5 ml-2.5">
            <EditButton path="#" />
            <RemoveButton />
          </div>
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
}
