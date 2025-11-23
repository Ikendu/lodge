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
import { updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useModalContext } from "../components/ui/ModalProvider";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [user, authLoading] = useAuthState(auth);
  const modal = useModalContext();

  // (removed debug/test-only logging)

  // If a canonical customerProfile exists, prevent access to login page
  useEffect(() => {
    // Wait for Firebase auth state to resolve before deciding to redirect.
    if (authLoading) return;
    try {
      const cp = localStorage.getItem("customerProfile");
      // Only redirect when we have a canonical profile AND a currently
      // authenticated Firebase user. Avoid relying on stale `userLogin`.
      if (cp && user) {
        // user already has profile — redirect to profile/home
        navigate("/profile", { replace: true });
      }
    } catch (e) {
      /* ignore storage errors */
    }
  }, [user, authLoading, navigate]);

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
    // Try the primary production endpoint first, then fallback to localhost (dev).
    const endpoints = [
      "https://lodge.morelinks.com.ng/api/get_profile.php",
      "http://localhost/lodge/api/get_profile.php",
    ];

    const fetchWithTimeout = (url, options = {}, timeout = 4000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { ...options, signal: controller.signal }).finally(() =>
        clearTimeout(id)
      );
    };

    for (const url of endpoints) {
      try {
        const res = await fetchWithTimeout(
          url,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, email: emailAddr }),
          },
          4000
        );

        if (!res || !res.ok) {
          console.warn(
            `Profile fetch returned HTTP ${res?.status} from ${url}`
          );
          continue;
        }

        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.warn(`Invalid JSON from ${url}:`, text);
          continue;
        }

        if (json && json.success && json.profile) {
          try {
            localStorage.setItem(
              "customerProfile",
              JSON.stringify(json.profile)
            );
            // profile saved to localStorage
          } catch (e) {
            console.warn("Failed to save customerProfile to localStorage", e);
          }
          return true;
        } else {
          console.warn(`No profile found at ${url}`);
          continue;
        }
      } catch (err) {
        console.warn(`Request to ${url} failed or timed out:`, err);
        continue;
      }
    }

    // If we get here, no endpoint returned a valid profile.
    // IMPORTANT: do not remove any existing local customerProfile here —
    // transient network failures during login should not clear a previously
    // saved profile. Just return false and let the caller decide how to proceed.
    console.error("❌ Profile fetch failed for all endpoints");
    return false;
  };

  // When Firebase user changes (auto-login)
  useEffect(() => {
    if (user) {
      (async () => {
        // auto-login detected for user
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
            state: {
              from: { pathname: fromTarget.path, state: fromTarget.state },
            },
          });
          return;
        }

        // Avoid passing overly large or complex objects as history state. If
        // the returned state contains a `lodge` object, forward only that.
        const returnState =
          fromTarget.state && fromTarget.state.lodge
            ? { lodge: fromTarget.state.lodge }
            : fromTarget.state;
        navigate(fromTarget.path, { replace: true, state: returnState });
      })();
    }
  }, [user]);

  // Email/Password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Per-field validation
    const fErr = { email: "", password: "", fullName: "" };
    if (!email) fErr.email = "Enter email";
    if (!password) fErr.password = "Enter password";
    if (isRegister && !fullName) fErr.fullName = "Enter full name";
    setFieldErrors(fErr);
    if (fErr.email || fErr.password || fErr.fullName) {
      setError("Please complete the required fields.");
      return;
    }

    setError("");
    setLoading(true);

    // Quick connectivity check to common Google endpoint to fail fast when
    // the network or blockers prevent Firebase requests. This surfaces a
    // clearer error to the user instead of the generic Firebase network error.
    const testConnectivity = (timeout = 3000) => {
      return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const id = setTimeout(() => {
          controller.abort();
          reject(new Error("timeout"));
        }, timeout);

        // generate_204 is a tiny Google endpoint used for connectivity checks
        fetch("https://www.gstatic.com/generate_204", {
          method: "GET",
          signal: controller.signal,
          mode: "no-cors",
        })
          .then(() => {
            clearTimeout(id);
            resolve(true);
          })
          .catch((err) => {
            clearTimeout(id);
            reject(err);
          });
      });
    };

    try {
      await testConnectivity(3000);
    } catch (err) {
      console.warn("Connectivity test failed before auth:", err);
      setError(
        "Network connectivity to Firebase appears to be blocked or slow. Disable extensions (adblock/privacy), check firewall/proxy, or try another network."
      );
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Network error",
            message:
              "Network connectivity to Firebase appears to be blocked or slow. Disable extensions (adblock/privacy), check firewall/proxy, or try another network.",
          });
        }
      } catch (e) {
        console.warn("Modal alert failed:", e);
      }
      setLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // set displayName if provided
        try {
          if (fullName && userCredential && userCredential.user) {
            await updateProfile(userCredential.user, { displayName: fullName });
          }
        } catch (e) {
          console.warn("Failed to set displayName", e);
        }
        // use top-level `modal` (hooks must only be called at top level)
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Account created",
            message: "✅ Account created successfully.",
          });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Login",
            message: "✅ Login successful!",
          });
        }
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
        const returnState2 =
          fromTarget.state && fromTarget.state.lodge
            ? { lodge: fromTarget.state.lodge }
            : fromTarget.state;
        navigate(fromTarget.path, { replace: true, state: returnState2 });
      }
    } catch (err) {
      // authentication error
      const rawMsg = String(
        err?.message || err?.code || "Authentication failed."
      );
      if (err && err.code === "auth/network-request-failed") {
        setError(
          "Network error while contacting authentication server. Check your internet connection and disable blockers (adblock/privacy)."
        );
        try {
          if (modal && typeof modal.alert === "function") {
            await modal.alert({
              title: "Network error",
              message:
                "Network error while contacting authentication server. Check your internet connection and disable blockers (adblock/privacy).",
            });
          }
        } catch (e) {
          console.warn("Modal alert failed:", e);
        }
      } else {
        const rawMsg = String(err?.message || err?.code || "");
        const lower = rawMsg.toLowerCase();
        // treat these cases as "no account" or invalid credentials where we offer to create an account
        const createHints = [
          "auth/user-not-found",
          "auth/invalid-credential",
          "auth/wrong-password",
          "auth/invalid-email",
        ];
        const shouldOfferCreate =
          createHints.includes(err?.code) ||
          /user-not-found|no user|no account|user does not exist|invalid credential|invalid-credential|wrong password/i.test(
            lower
          );

        if (shouldOfferCreate) {
          try {
            if (modal && typeof modal.confirm === "function") {
              const confirmed = await modal.confirm({
                title: "Login failed",
                message: `Login failed,\n\nIf you don't have an account, would you like to create one?`,
                okText: "Create account",
                cancelText: "Cancel",
              });
              if (confirmed) setIsRegister(true);
            } else {
              // fallback
              setIsRegister(true);
            }
          } catch (e) {
            console.warn("Modal confirm failed", e);
            setIsRegister(true);
          }
          // user-not-found specific message is clearer
          if (
            err?.code === "auth/user-not-found" ||
            /user-not-found|no user|no account/i.test(lower)
          ) {
            setError("No account found for this email.");
          } else
            setError(
              "Authentication failed. Check credentials or create an account."
            );
        } else {
          const msg =
            err?.message ||
            (err?.code
              ? err.code.replace("auth/", "").replace(/-/g, " ")
              : "Authentication failed.");
          setError(msg);
        }
        // Show the detailed "Account Creation Error" modal only when the
        // user was attempting to create an account (isRegister === true).
        // Avoid showing this modal for ordinary login failures where we
        // already prompt the user to register.
        try {
          if (isRegister && modal && typeof modal.alert === "function") {
            await modal.alert({
              title: "Account Creation Error",
              message: rawMsg.includes("auth/email-already-in-us")
                ? "Account already exists for this email, check your password or try using <b>Google.<b>"
                : rawMsg.includes("at least 6 characters")
                ? "Password must be at least 6 characters long."
                : rawMsg,
            });
          }
        } catch (e) {
          console.warn("Modal alert failed:", e);
        }
      }
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
      // socialSignIn now returns the full popup result; handle both shapes for compatibility
      const signedUser = (result && result.user) || result;
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
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Login failed",
            message: String(error?.message || error),
          });
        }
      } catch (e) {
        console.warn("Modal alert failed:", e);
      }
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
            <div
              className={`flex items-center border rounded-lg px-3 mt-1 ${
                fieldErrors.email ? "border-red-500" : ""
              }`}
            >
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((s) => ({ ...s, email: "" }));
                }}
                placeholder="example@mail.com"
                className="w-full p-2 outline-none"
              />
            </div>
            {fieldErrors.email ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.email}
              </div>
            ) : null}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 mt-1 ${
                fieldErrors.password ? "border-red-500" : ""
              }`}
            >
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
            {fieldErrors.password ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.password}
              </div>
            ) : null}
          </div>

          {/* Full name (only on register) */}
          {isRegister ? (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Full name
              </label>
              <div
                className={`flex items-center border rounded-lg px-3 mt-1 ${
                  fieldErrors.fullName ? "border-red-500" : ""
                }`}
              >
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFieldErrors((s) => ({ ...s, fullName: "" }));
                  }}
                  placeholder="John Doe"
                  className="w-full p-2 outline-none"
                />
              </div>
              {fieldErrors.fullName ? (
                <div className="text-xs text-red-500 mt-1">
                  {fieldErrors.fullName}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Submit */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-lg font-semibold transition flex items-center justify-center ${
                loading
                  ? "bg-indigo-500 opacity-70 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  {isRegister ? "Creating..." : "Logging in..."}
                </>
              ) : isRegister ? (
                "Create account"
              ) : (
                "Login"
              )}
            </button>
          </div>

          <div className="mt-3 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
        {/* Divider */}
        <div className="my-6 text-center text-gray-500 relative">
          <span className="px-3 bg-white relative z-10">or continue with</span>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-px bg-gray-300"></div>
        </div>
        {/* Social Logins */}
        <div className="flex justify-center gap-3">
          {[
            { name: "Google", color: "bg-red-500" },
            { name: "Yahoo", color: "bg-purple-600" },
            // { name: "Facebook", color: "bg-blue-600" },
          ].map((provider, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSocialLogin(provider.name)}
              disabled={loading}
              className={`${provider.color} text-white py-2 w-32 rounded-lg font-semibold transition text-sm`}
            >
              {provider.name}
            </motion.button>
          ))}
        </div>
        {/* (logout button removed from login page - use profile menu to logout) */}
      </motion.div>
    </div>
  );
}
