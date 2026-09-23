import { Routes, Route, Outlet, Navigate } from "react-router-dom";

import LandingPage from "./components/pages/LandingPage";
import ServicesPage from "./components/pages/ServicesPage";
import PassportPage from "./components/pages/PassportPage";
import ReadinessAssessmentPage from "./components/pages/ReadinessAssessmentPage";
import TeamPage from "./components/pages/TeamPage";
import ContactPage from "./components/pages/ContactPage";
import ConsortiumPage from "./components/pages/ConsortiumPage";
import ConsortiumTiersPage from "./components/pages/ConsortiumTiersPage";
import PrivacyPage from "./components/pages/PrivacyPage";
import AdminPage from "./components/pages/AdminPage";
import PublicLayout from "./components/templates/PublicLayout";
import AdvisoryThemeLayout from "./components/templates/AdvisoryThemeLayout";
import CatenaXThemeLayout from "./components/templates/CatenaXThemeLayout";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import ApiSanityWarning from "./components/atoms/ApiSanityWarning";
import { useApiSanityCheck } from "./hooks/useApiSanityCheck";
import {
  ROUTE_ADMIN,
  ROUTE_CONSORTIUM,
  ROUTE_CONSORTIUM_TIERS,
  ROUTE_CONTACT,
  ROUTE_LEGACY_CATENA_X,
  ROUTE_LEGACY_CATENA_X_READINESS,
  ROUTE_LEGACY_DATA,
  ROUTE_LEGACY_DATA_READINESS,
  ROUTE_PASSPORT,
  ROUTE_PRIVACY,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "./constants/routes";

export default function App() {
  const { warning } = useApiSanityCheck();

  return (
    <>
      <ApiSanityWarning warning={warning} />
      <Routes>
        <Route
          path={ROUTE_ADMIN}
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
            <Route path={ROUTE_SERVICES} element={<ServicesPage />} />
            <Route path={ROUTE_TEAM} element={<TeamPage />} />
            <Route path={ROUTE_CONTACT} element={<ContactPage />} />
            <Route path={ROUTE_CONSORTIUM} element={<ConsortiumPage />} />
            <Route
              path={ROUTE_CONSORTIUM_TIERS}
              element={
                <ProtectedRoute redirectTo={ROUTE_CONSORTIUM}>
                  <ConsortiumTiersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTE_PRIVACY}
              element={
                <ProtectedRoute>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />
            {/* Legacy SEO routes consolidated onto /passport (mirrored by the
                301 redirects in vercel.json). The two readiness children
                mirror the 301s added for them in the same file. */}
            <Route
              path={ROUTE_LEGACY_DATA}
              element={<Navigate replace to={ROUTE_PASSPORT} />}
            />
            <Route
              path={ROUTE_LEGACY_CATENA_X}
              element={<Navigate replace to={ROUTE_PASSPORT} />}
            />
            <Route
              path={ROUTE_LEGACY_DATA_READINESS}
              element={<Navigate replace to={ROUTE_READINESS_ASSESSMENT} />}
            />
            <Route
              path={ROUTE_LEGACY_CATENA_X_READINESS}
              element={<Navigate replace to={ROUTE_READINESS_ASSESSMENT} />}
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
            <Route path={ROUTE_PASSPORT} element={<PassportPage />} />
            <Route
              path={ROUTE_READINESS_ASSESSMENT}
              element={<ReadinessAssessmentPage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
