import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { MomentPage, PlannerProvider } from "./features/planner";
import AppLayout from "./features/planner/components/AppLayout";
import ProfilePage from "./features/planner/pages/ProfilePage";
import SettingsPage from "./features/planner/pages/SettingsPage";
import AuthProvider from "./features/planner/store/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <PlannerProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<App />} />
              <Route path="/moments/:id" element={<MomentPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </PlannerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
