import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./pages/login.tsx";
import SignUp from "./pages/signup.tsx";
import Appointment from "./pages/appointment.tsx";
import Layout from "./ui/dashboard.tsx";
import Services from "./pages/services.tsx";
import Team from "./pages/team.tsx";
import CadasterAppointment from "./pages/cadaster-appointment.tsx";
import CadasterService from "./pages/cadaster-service.tsx";
import CadasterWorker from "./pages/cadaster-worker.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/" element={<Layout />}>
          <Route index path="agendamentos" element={<Appointment />} />
          <Route path="servicos" element={<Services />} />
          <Route path="equipe" element={<Team />} />
          <Route
            path="cadastrar-agendamento"
            element={<CadasterAppointment />}
          />
          <Route path="cadastrar-servico" element={<CadasterService />} />
          <Route path="cadastrar-funcionario" element={<CadasterWorker />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);
