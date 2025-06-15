import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./pages/login.tsx";
import SignUp from "./pages/signup.tsx";
import Appointment from "./pages/appointment.tsx";
import Layout from "./ui/dashboard.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route path="/" element={<Layout />}>
          <Route index path="agendamentos" element={<Appointment />} />
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);
