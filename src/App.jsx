import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileInput from "./pages/FileInput";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./component/PrivateRoute";

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
      </Routes>
    </Router>
  );
}

export default App;
