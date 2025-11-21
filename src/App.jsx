import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileInput from "./pages/FileInput";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./component/PrivateRoute";
import ClientSummaryPage from "./pages/ClientSummaryPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <FileInput />
            </PrivateRoute>
          }
        />
        <Route
          path="/client-summary"
          element={
            <PrivateRoute>
              <ClientSummaryPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
