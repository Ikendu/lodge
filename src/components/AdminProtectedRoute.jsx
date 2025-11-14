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
    const from = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };
    return <Navigate to="/admin/login" state={{ from }} replace />;
  }
  return children;
}
