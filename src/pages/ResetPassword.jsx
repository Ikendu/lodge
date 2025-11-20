import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { confirmPasswordReset } from "firebase/auth";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("oobCode") || searchParams.get("oobcode");
    setOobCode(code);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!oobCode) {
      setError("Missing or invalid reset code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password changed successfully. Please sign in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password failed:", err);
      setError(err?.message || "Failed to reset password.");
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
          Reset Password
        </h2>
        {oobCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            {message ? <div className="text-sm text-green-600">{message}</div> : null}
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`py-2 px-4 rounded-lg text-white font-semibold transition-colors ${
                  loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Updating..." : "Change password"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-600 underline">Back</button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-red-600">Invalid or missing reset code.</div>
        )}
      </motion.div>
    </div>
  );
}
