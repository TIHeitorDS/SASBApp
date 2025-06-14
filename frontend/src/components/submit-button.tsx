export default function SubmitButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="bg-white w-full text-black pt-4 pb-[18px] font-semibold cursor-pointer hover:bg-white/90 transition-all"
    >
      {text}
    </button>
  );
}
