import { Navigate } from "react-router-dom";
import { Auth } from "../utils/auth";

export default function PrivateRoute({ children }) {
  return Auth.isLoggedIn() ? children : <Navigate to="/login" replace />;
}
