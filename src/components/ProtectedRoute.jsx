import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// A route component that checking for user authentication
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}