import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(auth.role))
    return <div className="text-center mt-10 text-red-500">Unauthorized</div>;

  return <Outlet />;
};

export default ProtectedRoute;
