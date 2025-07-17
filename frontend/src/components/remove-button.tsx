export default function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="bg-black text-white rounded-[2px] py-[10px] px-[32.5px] font-semibold cursor-pointer transition-all hover:bg-red-600"
      onClick={onClick}
    >
      Remover
    </button>
  );
}
