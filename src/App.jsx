import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileInput from "./pages/FileInput";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./component/PrivateRoute";
import ClientSummary from "./pages/ClientSummary";

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
              <ClientSummary />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
