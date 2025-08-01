import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider.tsx";

// Componentes e Páginas
import Login from "./pages/login.tsx";
import Appointment from "./pages/appointment.tsx";
import Layout from "./ui/dashboard.tsx"; 
import Services from "./pages/services.tsx";
import Team from "./pages/team.tsx";
import CadasterAppointment from "./pages/cadaster-appointment.tsx";
import CadasterService from "./pages/cadaster-service.tsx";
import EditService from './pages/edit-service.tsx';
import CadasterWorker from "./pages/cadaster-worker.tsx";
import EditWorker from "./pages/edit-worker.tsx";
import AppointmentDetails from "./pages/appointment-details.tsx";
import PageNotFound from "./pages/page-not-found.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx"; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index path="agendamentos" element={<Appointment />} />
            <Route path="servicos" element={<Services />} />
            <Route path="equipe" element={<Team />} />
            <Route
              path="cadastrar-agendamento"
              element={<CadasterAppointment />}
            />
            <Route path="cadastrar-servico" element={<CadasterService />} />
            <Route path="editar-servico/:serviceId" element={<EditService />} />
          <Route path="cadastrar-funcionario" element={<CadasterWorker />} />
          <Route path="editar-funcionario/:id" element={<EditWorker />} />
          <Route path="detalhes-agendamento/:id" element={<AppointmentDetails />} />
        </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>
);