// frontend2/my-react-app/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// requiredRole: "admin" | "teacher" | "student"
const ProtectedRoute = ({ element, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;
