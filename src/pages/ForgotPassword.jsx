import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        // deep-link back to our app so the reset flow can use the oobCode
        url: window.location.origin + "/reset-password",
      });
      setMessage(
        "If an account with that email exists, a password reset link has been sent. Check your inbox (and spam folder)."
      );
    } catch (err) {
      console.error("Reset email error:", err);
      setError(err?.message || "Failed to send reset email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter the email address associated with your account and we'll send a
          link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="you@example.com"
                className="w-full p-2 outline-none"
              />
            </div>
          </div>

          {message ? (
            <div className="text-sm text-green-600">{message}</div>
          ) : null}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Sending..." : "Send reset email"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 underline"
            >
              Back
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
