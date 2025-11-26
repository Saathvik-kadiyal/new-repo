import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../Layout/Layout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

// Lazy imports
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const ClientSummaryPage = lazy(() => import("../pages/ClientSummaryPage.jsx"));
const FileInput = lazy(() => import("../pages/FileInput.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Layout with nested pages */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<div className="p-6">Loading Dashboard...</div>}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="shift-allowance"
          element={
            <Suspense fallback={<div className="p-6">Loading Employee Page...</div>}>
              <FileInput />
            </Suspense>
          }
        />
        <Route
          path="client-summary"
          element={
            <Suspense fallback={<div className="p-6">Loading Client Summary...</div>}>
              <ClientSummaryPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch-all 404 */}
      <Route
        path="*"
        element={
          <PrivateRoute>
            <Suspense fallback={<div className="p-6">Loading...</div>}>
              <NotFound />
            </Suspense>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
