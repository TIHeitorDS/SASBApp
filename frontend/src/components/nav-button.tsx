import { Link } from "react-router";

export default function NavButton({
  path,
  text,
}: {
  path: string;
  text: string;
}) {
  return (
    <div className="mt-10">
      <Link
        to={path}
        className="lg:w-[237px] text-center block px-5 bg-black text-white py-[19px] rounded-[2px] font-semibold hover:bg-black/90 transition-all"
      >
        {text}
      </Link>
    </div>
  );
}
