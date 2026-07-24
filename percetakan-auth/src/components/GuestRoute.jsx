import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
  const { admin } = useAuth();

  if (admin) return <Navigate to="/dashboard" replace />;
  return children;
}
