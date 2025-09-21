import { useState } from "react";
import { motion } from "framer-motion";

export default function RegisterCustomer() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    nin: "",
    dob: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you will send data to your PHP backend API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl w-full max-w-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          User Registration
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* First Name */}
          <motion.div whileFocus={{ scale: 1.05 }} className="flex flex-col">
            <label className="text-white mb-2 font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </motion.div>

          {/* Middle Name */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* NIN */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">NIN Number</label>
            <input
              type="text"
              name="nin"
              value={formData.nin}
              onChange={handleChange}
              maxLength={11}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* DOB */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* Address */}
          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Current Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="col-span-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-all"
            >
              Register
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
