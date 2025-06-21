export default function SelectService() {
  return (
    <select className="border pt-[15px] pb-[17px] pl-[21px] border-[#c4c4c4] w-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink rounded bg-transparent text-[#767575]/25 transition-all">
      <option value="default" selected>
        Selecionar Serviço
      </option>

      <option value="1" className="text-[#767575]">
        1
      </option>
      <option value="2" className="text-[#767575]">
        2
      </option>
      <option value="3" className="text-[#767575]">
        3
      </option>
    </select>
  );
}
