import { Link } from "react-router";

export default function NavButton({
  path,
  text,
}: {
  path: string;
  text: string;
}) {
  return (
    <Link to={path} className="px-5 bg-black text-white py-[19px] rounded-[2px] font-semibold hover:bg-black/90 transition-all">
      {text}
    </Link>
  );
}
