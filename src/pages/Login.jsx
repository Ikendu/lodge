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
import toast from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const rawFrom = location.state?.from || "/";
  const buildTarget = (raw) => {
    if (!raw) return { path: "/", state: undefined };
    if (typeof raw === "string") return { path: raw, state: undefined };
    const path = `${raw.pathname || "/"}${raw.search || ""}${raw.hash || ""}`;
    return { path, state: raw.state };
  };
  const fromTarget = buildTarget(rawFrom);

  // Fetch profile from backend
  const fetchUserProfile = async (uid, emailAddr) => {
    try {
      const res = await fetch("http://localhost/lodge/get_profile.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, email: emailAddr }),
      });

      const data = await res.json();

      console.log("Data", data);

      if (data.success && data.profile) {
        localStorage.setItem("customerProfile", JSON.stringify(data.profile));
        console.log("✅ Profile saved to localStorage:", data.profile);
      } else {
        localStorage.removeItem("customerProfile");
        console.warn("⚠️ No profile found for this user.");
      }
    } catch (err) {
      console.error("❌ Profile fetch failed:", err);
      localStorage.removeItem("customerProfile");
    }
  };

  // When Firebase user changes (auto-login)
  useEffect(() => {
    if (user) {
      (async () => {
        console.log("Auto-login detected for user:", user.email, user.uid);
        await fetchUserProfile(user.uid, user.email);

        // persist lightweight login info for other pages/components
        try {
          const userLogin = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
          };
          localStorage.setItem("userLogin", JSON.stringify(userLogin));
        } catch (e) {
          console.warn("Failed to persist userLogin", e);
        }

        // If there's no customerProfile, redirect to registration
        const cp = localStorage.getItem("customerProfile");
        if (!cp) {
          toast("Complete your profile to continue", { icon: "ℹ️" });
          navigate("/registeruser", {
            replace: true,
            state: { from: fromTarget.path },
          });
          return;
        }

        navigate(fromTarget.path, { replace: true, state: fromTarget.state });
      })();
    }
  }, [user]);

  // Email/Password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert("✅ Account created successfully.");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert("✅ Login successful!");
      }

      const uid = userCredential.user.uid;
      const userEmail = userCredential.user.email;
      // persist lightweight login info
      try {
        const userLogin = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || null,
          photoURL: userCredential.user.photoURL || null,
        };
        localStorage.setItem("userLogin", JSON.stringify(userLogin));
      } catch (e) {
        console.warn("Failed to persist userLogin", e);
      }
      await fetchUserProfile(uid, userEmail);

      // If there's no customerProfile, send user to registration to complete profile
      if (!localStorage.getItem("customerProfile")) {
        toast("Complete your profile to continue", { icon: "ℹ️" });
        navigate("/registeruser", { replace: true });
      } else {
        navigate(fromTarget.path, { replace: true, state: fromTarget.state });
      }
    } catch (err) {
      console.error(err);
      const msg = err?.code
        ? err.code.replace("auth/", "").replace(/-/g, " ")
        : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Social login
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
      const result = await socialSignIn(provider);
      const signedUser = result.user;
      if (signedUser) {
        await fetchUserProfile(signedUser.uid, signedUser.email);
        // persist lightweight login info for social sign-ins too
        try {
          const userLogin = {
            uid: signedUser.uid,
            email: signedUser.email,
            displayName: signedUser.displayName || null,
            photoURL: signedUser.photoURL || null,
          };
          localStorage.setItem("userLogin", JSON.stringify(userLogin));
        } catch (e) {
          console.warn("Failed to persist social userLogin", e);
        }
        // After fetching profile, ensure customerProfile exists
        if (!localStorage.getItem("customerProfile")) {
          toast("Complete your profile to continue", { icon: "ℹ️" });
          navigate("/registeruser", { replace: true });
        } else {
          navigate(fromTarget.path, { replace: true, state: fromTarget.state });
        }
      }
    } catch (error) {
      console.error("Social login failed:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("customerProfile");
      alert("You have logged out.");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isRegister ? "Create account" : "Sign in with email"}
            </div>
            <button
              type="button"
              onClick={() => setIsRegister((v) => !v)}
              className="text-xs text-indigo-600 underline"
            >
              {isRegister ? "Have an account? Sign in" : "No account? Register"}
            </button>
          </div>

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
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? isRegister
                  ? "Creating..."
                  : "Logging in..."
                : isRegister
                ? "Create account"
                : "Login"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-500 relative">
          <span className="px-3 bg-white relative z-10">or continue with</span>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-px bg-gray-300"></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: "Google", color: "bg-red-500" },
            { name: "Yahoo", color: "bg-purple-600" },
            { name: "Facebook", color: "bg-blue-600" },
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

        {/* Logout (for testing) */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
          >
            Logout
          </button>
        )}
      </motion.div>
    </div>
  );
}
