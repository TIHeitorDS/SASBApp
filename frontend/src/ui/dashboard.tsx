import Navbar from "../components/navbar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <Navbar />

      <hr className="text-gray" />

      <div className="lg:w-[932px] p-5 lg:p-0 min-h-screen mx-auto mt-[100px]">
        <Outlet />
      </div>
    </>
  );
}
