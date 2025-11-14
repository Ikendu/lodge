// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";

export default function ProtectedRoute({ children }) {
  const [user] = useAuthState(auth);
  const location = useLocation();

  if (!user) {
    const from = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    };
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return children;
}
