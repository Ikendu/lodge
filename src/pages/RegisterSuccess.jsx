import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Registration Submitted</h2>
        <p className="text-gray-700 mb-4">
          Thank you — your registration has been received. Our team will review
          your information and you'll receive a confirmation email once the
          review is complete.
        </p>
        <p className="text-gray-600 mb-6">
          Expected response time: 24-72 hours
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
