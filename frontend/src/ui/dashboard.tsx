import Navbar from "../components/navbar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <Navbar />

      <hr className="text-gray" />

      <div className="w-[932px] min-h-screen mx-auto mt-[100px]">
        <Outlet />
      </div>
    </>
  );
}
