import { useEffect } from "react";
import Navbar from "../components/navbar";
import { Outlet } from "react-router";
import { useLocation, useNavigate } from "react-router";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/agendamentos");
    }
  }, [location]);

  return (
    <>
      <Navbar />

      <hr className="text-gray" />

      <div className="lg:w-[932px] p-5 lg:p-0 mt-8 mx-auto">
        <Outlet />
      </div>
    </>
  );
}
