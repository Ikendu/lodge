import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DojahNINTest() {
  const [nin, setNin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  const API_URL = "https://api.korapay.com/merchant/api/v1/identities/ng/nin";
  const API_KEY = "sk_test_diVJ33chcUTmUNTeLnwaa4s8fSvDT9SqK5sJW5N5";

  const verifyNIN = async () => {
    if (!nin) return alert("Please enter a NIN");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin,
          verification_consent: true,
        }),
      });

      const data = await response.json();
      console.log("✅ Verification Response:", data);

      if (data?.status || data?.success) {
        setResult(data);
        setVerified(true);
      } else {
        setError(data?.message || "Verification failed");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error verifying NIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600 p-6">
      <motion.div
        className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          NIN Verification Test
        </h2>
        <p className="text-center text-white/80 mb-6">
          Enter your NIN below to verify and display your details instantly.
        </p>

        <div className="flex flex-col gap-4">
          <input
            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            placeholder="Enter NIN e.g. 12345678901"
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={verifyNIN}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold shadow-lg disabled:opacity-60 transition-all"
          >
            {loading ? "Verifying..." : verified ? "Submit" : "Continue"}
          </motion.button>

          {error && (
            <motion.p
              className="text-red-300 text-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Display result with animation */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="mt-8 bg-white/10 text-white p-5 rounded-xl shadow-md border border-white/10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-3 text-center">
                Verification Result
              </h3>
              <div className="flex flex-col items-center gap-3 mb-4">
                {result?.data?.image && (
                  <img
                    src={result.data.image}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white/40"
                  />
                )}
                <div className="text-center">
                  <p className="font-medium">
                    {result?.data?.first_name} {result?.data?.last_name}
                  </p>
                  <p className="text-sm text-white/70">
                    {result?.data?.date_of_birth}
                  </p>
                  <p className="text-sm text-white/70">
                    {result?.data?.address?.state}, {result?.data?.address?.lga}
                  </p>
                </div>
              </div>

              <motion.pre
                className="text-xs bg-black/40 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {JSON.stringify(result, null, 2)}
              </motion.pre>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
