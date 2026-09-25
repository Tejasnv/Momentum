import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { MomentPage, PlannerProvider } from "./features/planner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PlannerProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/moments/:id" element={<MomentPage />} />
        </Routes>
      </PlannerProvider>
    </BrowserRouter>
  </StrictMode>,
);
