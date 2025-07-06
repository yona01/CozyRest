import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getLoggedInUser } from "./lib/utils/auth";
import Home from "./routes/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Properties from "./routes/Properties";
import Guest from "./routes/Guest";
import Bookings from "./routes/Booking";
import Profile from "./routes/Profile";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [user, setUser] = useState(() => getLoggedInUser());
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authToken" || event.key === "loggedInUser") {
        setUser(getLoggedInUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const shouldRedirect = location.pathname === "/";

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Home />
            ) : shouldRedirect ? (
              <Navigate
                to={user.role === "guest" ? "/guest" : "/properties"}
                replace
              />
            ) : (
              <Home />
            )
          }
        />
        {/* Host-only routes */}
        <Route
          path="/properties"
          element={
            <ProtectedRoute user={user} allowedRoles={["host"]}>
              <Properties />
            </ProtectedRoute>
          }
        />

        {/* Guest-only routes */}
        <Route
          path="/guest"
          element={
            <ProtectedRoute user={user} allowedRoles={["guest"]}>
              <Guest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute user={user} allowedRoles={["guest"]}>
              <Bookings />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} allowedRoles={["host", "guest"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
