// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import {
  googleProvider,
  yahooProvider,
  appleProvider,
  facebookProvider,
  twitterProvider,
  socialSignIn,
  auth,
} from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  // Get previous page (or default to home). `from` may be a string path or a full location object.
  const rawFrom = location.state?.from || "/";

  const buildTarget = (raw) => {
    if (!raw) return { path: "/", state: undefined };
    if (typeof raw === "string") return { path: raw, state: undefined };
    // raw is a location object
    const path = `${raw.pathname || "/"}${raw.search || ""}${raw.hash || ""}`;
    return { path, state: raw.state };
  };

  const fromTarget = buildTarget(rawFrom);

  // If user already signed in, return them to the page they came from (preserve state)
  useEffect(() => {
    if (user) {
      navigate(fromTarget.path, { replace: true, state: fromTarget.state });
    }
  }, [user, fromTarget.path, fromTarget.state, navigate]);

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ Login successful!");
      navigate(fromTarget.path, { replace: true, state: fromTarget.state }); // redirect back (preserve state)
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Social Login
  const handleSocialLogin = async (providerName) => {
    const providerMap = {
      Google: googleProvider,
      Yahoo: yahooProvider,
      Apple: appleProvider,
      Facebook: facebookProvider,
      X: twitterProvider,
    };

    const provider = providerMap[providerName];
    if (!provider) return;

    try {
      setLoading(true);
      await socialSignIn(provider);
      navigate(fromTarget.path, { replace: true, state: fromTarget.state }); // redirect to previous page (preserve state)
    } catch (error) {
      console.error("Social login failed:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Welcome Back 👋
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 mb-4 rounded">
            {error}
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email Address
            </label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full p-2 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 mt-1">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-500 relative">
          <span className="px-3 bg-white relative z-10">or continue with</span>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-px bg-gray-300"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: "Google", color: "bg-red-500" },
            { name: "Yahoo", color: "bg-purple-600" },
            { name: "Apple", color: "bg-gray-900" },
            { name: "Facebook", color: "bg-blue-600" },
            { name: "X", color: "bg-black" },
          ].map((provider, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSocialLogin(provider.name)}
              disabled={loading}
              className={`${provider.color} text-white py-2 rounded-lg font-semibold transition text-sm`}
            >
              {provider.name}
            </motion.button>
          ))}
        </div>

        {/* Register Link */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/registeruser" className="text-indigo-600 font-semibold">
            Register
          </a>
        </div>
      </motion.div>
    </div>
  );
}
