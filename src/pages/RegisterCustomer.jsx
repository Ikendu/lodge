import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nin, setNin] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null); // stores API payload.data

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

    // If we already have verification data, navigate to details page
    if (verification) {
      const state = {
        type:
          verification?.id_type ||
          (nin && phone ? "both" : nin ? "nin" : "phone"),
        verified: verification,
        provided: { nin: nin || null, phone: phone || null },
      };
      if (location.state?.from) state.from = location.state.from;
      return navigate("/registeruser/details", { state });
    }

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
      const formData = new FormData();
      if (ninVal) formData.append("nin", ninVal);
      if (phoneVal) formData.append("phone", phoneVal);

      const res = await fetch("http://localhost/lodge/verify_nin.php", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.debug("verify_nin response:", data);
      // support both `success` and `status` boolean keys from different backends
      const ok = Boolean(data && (data.success || data.status));
      if (!ok) {
        return alert(data?.message || "Verification failed");
      }

      // store the returned payload for review instead of navigating
      const result = data.data || data || {};
      console.debug("verification payload:", result);
      // Navigate to details page with the verification payload and origin
      const state = {
        type:
          result?.id_type || (nin && phone ? "both" : nin ? "nin" : "phone"),
        verified: result,
        provided: { nin: ninVal || null, phone: phoneVal || null },
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
              placeholder="e.g. 41234567890"
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
              {loading ? "Processing..." : verification ? "Submit" : "Continue"}
            </motion.button>
          </div>
        </form>

        {/* Verification review card (appears after successful verification) */}
        {verification && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/6 rounded-xl p-4"
          >
            <div className="flex gap-4 items-start">
              <div className="w-28 h-28 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                {verification.image ? (
                  <img
                    src={
                      verification.image && verification.image.startsWith
                        ? verification.image.startsWith("data:")
                          ? verification.image
                          : `data:image/jpg;base64,${verification.image}`
                        : verification.image
                    }
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 text-white">
                <h3 className="text-lg font-semibold">
                  {verification.first_name} {verification.middle_name}{" "}
                  {verification.last_name}
                </h3>
                <div className="text-sm text-white/80 mt-1">
                  {verification.id_type || "NIN/Phone"} •{" "}
                  {verification.reference}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-white/85">
                  <div>
                    <div className="text-xs text-white/70">Date of birth</div>
                    <div>{verification.date_of_birth}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/70">Gender</div>
                    <div>{verification.gender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/70">NIN</div>
                    <div>{verification.nin || verification.id || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/70">Phone</div>
                    <div>
                      {verification.phone_number || verification.id || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-white/80">
                  <div className="text-xs text-white/60">Address</div>
                  <div>
                    {verification.address?.street}, {verification.address?.town}
                    , {verification.address?.lga}, {verification.address?.state}
                  </div>
                </div>
              </div>
            </div>

            {/* validation summary */}
            {verification.validation && (
              <div className="mt-4 text-sm text-white/85">
                <div className="text-xs text-white/70 mb-2">Validation</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(verification.validation).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white/3 rounded">
                      <div className="text-xs text-white/60">{k}</div>
                      <div className="font-medium">
                        {v.value || (v.match ? "Matched" : "-")}
                      </div>
                      {typeof v.match === "boolean" && (
                        <div
                          className={`text-xs mt-1 ${
                            v.match ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {v.match ? "Match" : "Mismatch"}
                        </div>
                      )}
                      {v.confidence_rating && (
                        <div className="text-xs text-white/60">
                          Confidence: {v.confidence_rating}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setVerification(null)}
                className="px-4 py-2 rounded-lg bg-white/6 text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  const state = {
                    type:
                      verification?.id_type ||
                      (nin && phone ? "both" : nin ? "nin" : "phone"),
                    verified: verification,
                    provided: { nin: nin || null, phone: phone || null },
                  };
                  if (location.state?.from) state.from = location.state.from;
                  navigate("/registeruser/details", { state });
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Debug: if verification exists but key fields are missing, show raw JSON for troubleshooting */}
        {verification &&
          !(
            verification.first_name ||
            verification.last_name ||
            verification.nin ||
            verification.phone_number
          ) && (
            <pre className="mt-4 text-xs text-white/80 overflow-auto max-h-40 bg-black/20 p-3 rounded">
              {JSON.stringify(verification, null, 2)}
            </pre>
          )}
      </motion.div>
    </div>
  );
}
