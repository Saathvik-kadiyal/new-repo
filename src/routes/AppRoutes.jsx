import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../Layout/Layout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import Comparision from "../component/Comparision.jsx";
import ClientSummaryDetailedPage from "../pages/ClientSummaryDetailPage.jsx";
import EmployeeEditPage from "../pages/EmployeeEditPage.jsx";
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const ClientSummaryPage = lazy(() => import("../pages/ClientSummaryPage.jsx"));
const FileInput = lazy(() => import("../pages/FileInput.jsx"));
const LoginPage = lazy(() => import("../pages/LoginPage.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
             <PrivateRoute>
            <Suspense fallback={<div className="p-6">Loading Dashboard...</div>}>
             
                <DashboardPage />
             
            </Suspense>
             </PrivateRoute>
          }
        />
         <Route
          path="comparison"
          element={
            <Suspense fallback={<div className="p-6">Loading Comparision.</div>}>
              <Comparision />
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
        path="shift-allowance/edit"
        element={
            <Suspense fallback={<div className="p-6">Loading Edit Page...</div>}>
              <EmployeeEditPage/>
            </Suspense>
        }
        />
        <Route
          path="client-summary"
          element={
            <Suspense fallback={<div className="p-6">Loading Client Summary...</div>}>
              {/* <ClientSummaryPage /> */}
              <ClientSummaryDetailedPage/>
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
