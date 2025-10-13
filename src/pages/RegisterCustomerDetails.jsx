import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified || {};
  const phone = location.state?.phone || "";
  const from = location.state?.from;

  const [form, setForm] = useState({
    email: "",
    dob: verified.dob || "",
    address: "",
    permanentAddress: "",
    lga: "",
    state: "",
    country: "",
    passport: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((p) => ({ ...p, [name]: files[0] }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      // include verified fields
      payload.append("firstName", verified.firstName || "");
      payload.append("middleName", verified.middleName || "");
      payload.append("lastName", verified.lastName || "");
      payload.append("nin", verified.nin || "");
      payload.append("phone", phone || "");
      // include details from step 2
      payload.append("email", form.email);
      payload.append("dob", form.dob);
      payload.append("address", form.address);
      payload.append("permanentAddress", form.permanentAddress);
      payload.append("lga", form.lga);
      payload.append("state", form.state);
      payload.append("country", form.country);
      if (form.passport) payload.append("passport", form.passport);

      const res = await fetch("/register.php", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Registration failed");
        setSubmitting(false);
        return;
      }

      const profile = {
        firstName: verified.firstName,
        lastName: verified.lastName,
        email: form.email,
        nin: verified.nin,
      };
      try {
        localStorage.setItem("customerProfile", JSON.stringify(profile));
      } catch (e) {}

      // If the flow came from a booking, continue to payment
      if (from && from.state && from.state.lodge) {
        navigate("/payment", { state: { lodge: from.state.lodge, profile } });
        return;
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Registration request failed");
    } finally {
      setSubmitting(false);
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
          Additional Details
        </h2>
        <p className="text-white text-center mb-4">
          Verified: {verified.firstName} {verified.lastName} (NIN:{" "}
          {verified.nin})
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Date of Birth</label>
            <input
              name="dob"
              value={form.dob}
              onChange={handleChange}
              type="date"
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Current Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Permanent Address
            </label>
            <textarea
              name="permanentAddress"
              value={form.permanentAddress}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">LGA</label>
            <input
              name="lga"
              value={form.lga}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Passport</label>
            <input
              name="passport"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="p-2 rounded-xl"
              required
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl"
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
