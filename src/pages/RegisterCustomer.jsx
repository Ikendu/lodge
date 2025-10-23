import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nin, setNin] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const sanitizeDigits = (val) => (val || "").replace(/\D+/g, "");

  const handleNinChange = (e) => {
    // keep only digits for NIN per requirement
    setNin(sanitizeDigits(e.target.value));
  };

  const handlePhoneChange = (e) => {
    // keep only digits
    setPhone(sanitizeDigits(e.target.value));
  };

  const validateInputs = (ninVal, phoneVal) => {
    const ninOk = ninVal ? /^\d{5,20}$/.test(ninVal) : false;
    const phoneOk = phoneVal ? /^080\d{8}$/.test(phoneVal) : false;
    return { ninOk, phoneOk };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ninVal = (nin || "").trim();
    const phoneVal = (phone || "").trim();

    if (!ninVal && !phoneVal) {
      return alert("Please enter either your NIN or your phone number.");
    }

    const { ninOk, phoneOk } = validateInputs(ninVal, phoneVal);

    if (ninVal && !ninOk) {
      return alert("NIN must be numeric and between 5 to 20 digits.");
    }
    if (phoneVal && !phoneOk) {
      return alert(
        "Phone must be local 11 digits and start with 080. e.g. 08012345678"
      );
    }

    setLoading(true);
    try {
      const payload = new FormData();
      if (ninVal) payload.append("nin", ninVal);
      if (phoneVal) payload.append("phone", phoneVal);

      const res = await fetch("/verify_nin.php", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!data || !data.success) {
        return alert(data?.message || "Verification failed");
      }

      const verified = data.data || {};
      const provided = { nin: ninVal || null, phone: phoneVal || null };
      const state = {
        type: ninVal && phoneVal ? "both" : ninVal ? "nin" : "phone",
        verified,
        provided,
      };
      if (location.state?.from) state.from = location.state.from;
      navigate("/registeruser/details", { state });
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
      <motion.div
        className="w-full max-w-lg bg-white/5 backdrop-blur-sm rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.98, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold text-white text-center mb-2">
          Start Registration
        </h2>
        <p className="text-center text-white/90 mb-6">
          Provide your NIN or the local phone number (starting with 080) that is
          registered with your NIN. We'll verify the information before
          continuing to the next step.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">NIN</label>
            <input
              name="nin"
              value={nin}
              onChange={handleNinChange}
              placeholder="e.g. 12345678"
              className="p-3 rounded-xl bg-white/5 text-white placeholder-white/60"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
            />
            <div className="text-xs text-white/80 mt-2">
              - Enter your national identification number (numeric, 5-20
              digits).
            </div>
          </div>

          <div className="flex items-center justify-center text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/3">OR</span>
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Phone number</label>
            <input
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="e.g. 08012345678"
              className="p-3 rounded-xl bg-white/5 text-white placeholder-white/60"
              inputMode="tel"
              autoComplete="tel"
              maxLength={11}
            />
            <div className="text-xs text-white/80 mt-2">
              - Provide the local phone number registered with your NIN (must
              start with 080 and be 11 digits).
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-60"
            >
              {loading ? "Processing..." : "Continue"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
