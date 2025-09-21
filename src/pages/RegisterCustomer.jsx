import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    nin: "",
    dob: "",
    address: "",
    permanentAddress: "",
    lga: "",
    state: "",
    country: "",
    passport: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    fetch("http://localhost/lodge/register.php", {
      method: "POST",
      body: formDataToSend,
    })
      .then((res) => res.json())
      .then((data) => console.log("Response:", data))
      .catch((err) => console.error("Error:", err));
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
          New User Registration
        </h2>
        <p
          className="font-bold text-gray-700 text-center mb-6 cursor-pointer"
          onClick={() => navigate("/registerowner")}
        >
          Want to rent out your lodge instead?{" "}
          <i className="underline">Click here</i>
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* First Name */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

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

          {/* Current Address */}
          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Current Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              required
            />
          </div>

          {/* Permanent Address */}
          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Permanent Address
            </label>
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              required
            />
          </div>

          {/* LGA */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Local Govt. of Origin
            </label>
            <input
              type="text"
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* State */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              State of Origin
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* Country */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="p-3 rounded-xl border border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />
          </div>

          {/* Passport */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Passport</label>
            <input
              type="file"
              name="passport"
              accept="image/*"
              onChange={handleChange}
              className="p-2 rounded-xl border border-white/30 bg-white/10 text-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              required
            />
          </div>

          {/* Submit */}
          <div className="col-span-1 md:col-span-2">
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
