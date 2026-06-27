import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");
  const location = useLocation();

  if (!token || role !== "admin") {
    return (
      <Navigate
        to="/admin"
        state={{ error: "Access Denied. Administrator privileges are required.", from: location }}
        replace
      />
    );
  }

  return children;
}
