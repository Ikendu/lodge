import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

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

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nin || !form.firstName || !form.lastName)
      return alert("Please fill required fields");
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("nin", form.nin);

      const res = await fetch("/verify_nin.php", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!data.success)
        return alert(data.message || "NIN verification failed");

      // merge verified data returned from server with phone and navigate to details step
      const verified = data.data || {};
      const state = { verified, phone: form.phone };
      // preserve original booking flow state if present
      if (location.state && location.state.from)
        state.from = location.state.from;
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
