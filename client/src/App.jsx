import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import LandingPage from "./components/pages/LandingPage";
import ServicesPage from "./components/pages/ServicesPage";
import PassportPage from "./components/pages/PassportPage";
import TeamPage from "./components/pages/TeamPage";
import ContactPage from "./components/pages/ContactPage";
import PrivacyPage from "./components/pages/PrivacyPage";
import AdminPage from "./components/pages/AdminPage";
import PublicLayout from "./components/templates/PublicLayout";
import AdvisoryThemeLayout from "./components/templates/AdvisoryThemeLayout";
import CatenaXThemeLayout from "./components/templates/CatenaXThemeLayout";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import ApiSanityWarning from "./components/atoms/ApiSanityWarning";
import { useApiSanityCheck } from "./hooks/useApiSanityCheck";

export default function App() {
  const { warning } = useApiSanityCheck();

  return (
    <>
      <ApiSanityWarning warning={warning} />
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route element={<AdvisoryThemeLayout />}>
          <Route
            element={
              <PublicLayout>
                <Outlet />
              </PublicLayout>
            }
          >
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />
            {/* Legacy SEO routes consolidated onto /passport (mirrored by the
                301 redirects in vercel.json). */}
            <Route
              path="/data"
              element={<Navigate replace to="/passport" />}
            />
            <Route
              path="/catena-x"
              element={<Navigate replace to="/passport" />}
            />
            <Route path="*" element={null} />
          </Route>
        </Route>
        <Route element={<CatenaXThemeLayout />}>
          <Route
            element={
              <PublicLayout>
                <Outlet />
              </PublicLayout>
            }
          >
            <Route path="/passport" element={<PassportPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
