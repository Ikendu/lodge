import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const [token] = useState(() => {
    try {
      return localStorage.getItem("adminToken") || "";
    } catch {
      return "";
    }
  });
  const location = useLocation();

  // simple guard: require token; more thorough validation happens on each API call
  if (!token) {
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  }
  return children;
}
