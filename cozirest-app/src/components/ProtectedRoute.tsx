import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  user: { role: string } | null;
  allowedRoles: string[];
  children: ReactNode;
}

export default function ProtectedRoute({
  user,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate 
      to={user.role === "guest" ? "/guest" : "/properties"} 
      state={{ from: location }} 
      replace 
    />;
  }

  return <>{children}</>;
}