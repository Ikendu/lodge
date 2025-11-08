// src/pages/RegisterCustomer.jsx
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    nin: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // also accept Firebase auth presence as a valid login
  const [firebaseUser, loadingAuth] = useAuthState(auth);

  // ✅ Wait for localStorage before deciding redirect
  useEffect(() => {
    // If a completed customerProfile exists, don't allow access to the verify/register flow
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) {
        console.log("Customer profile exists — redirecting to /profile");
        navigate("/profile", { replace: true });
        return;
      }
    } catch (e) {
      // ignore
    }
    // Allow access to this page if either we have a local storage flag
    // or Firebase reports a signed-in user. Otherwise redirect to login.
    const userData = localStorage.getItem("userLogin");

    // While Firebase auth is initializing, wait to avoid flicker
    if (loadingAuth) return;

    if (!userData && !firebaseUser) {
      console.log(
        "No user found (localStorage + firebase) → redirecting to /login"
      );
      navigate("/login");
    } else {
      console.log("User present → allow register page");
    }
    setCheckingLogin(false);
  }, [navigate, firebaseUser, loadingAuth]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nin || !form.firstName || !form.lastName || !form.phone) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("nin", form.nin);
      payload.append("firstName", form.firstName);
      payload.append("lastName", form.lastName);
      payload.append("phone", form.phone);

      // Try endpoints in order: production first, then  local dev
      const endpoints = [
        "https://lodge.morelinks.com.ng/api/verify_nin.php",
        "http://localhost/lodge/api/verify_nin.php",
      ];

      let data = null;
      let lastErr = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "POST", body: payload });
          const text = await res.text();
          try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object") {
              data = parsed;
            } else {
              // not an object — try next
              lastErr = new Error("Invalid JSON from " + url);
            }
          } catch (err) {
            // invalid json from this endpoint
            lastErr = err;
          }
        } catch (err) {
          // network error — try next endpoint
          lastErr = err;
        }
        if (data) break;
      }

      if (!data) {
        console.error("All verify endpoints failed", lastErr);
        throw new Error("Invalid JSON from server");
      }

      if (!data.success) {
        // If server indicates NIN already registered, show a clear toast and stop
        console.log("NIN data", data);
        toast.error(data.message || "NIN verification failed");
        return;
      }

      // merge verified data returned from server with phone and navigate to details step
      const verified = data.data || {};
      const state = {
        verified,
        phone: form.phone,
        nin: form.nin,
      };

      if (location.state && location.state.from)
        state.from = location.state.from;

      navigate("/registeruser/details", { state });
    } catch (err) {
      console.error(err);
      toast.error("Verification failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Prevent render flicker while checking login
  if (checkingLogin) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-indigo-700">
        Checking login...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl w-full max-w-3xl p-6 sm:p-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Verify NIN
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">NIN Number</label>
            <input
              name="nin"
              value={form.nin}
              onChange={handleChange}
              maxLength={20}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="p-3 rounded-xl"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
