import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import guest from "../assets/logos/guest.png";
import ownerh from "../assets/logos/ownerh.png";

export default function Home() {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 40 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
    hover: { scale: 1.05, y: -5, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white p-6">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-12 drop-shadow-lg"
      >
        Welcome to <span className="text-yellow-300">MoreLink Lodge</span>
      </motion.h1>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Lodge Seeker */}
        <motion.div
          className="cursor-pointer bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-white/30"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          custom={0}
          onClick={() => navigate("/registeruser")}
        >
          <img
            src={guest}
            alt="guest or tenant"
            className="h-20 mb-4 drop-shadow-md"
          />
          <h4 className="text-2xl font-bold mb-2">Find a Lodge</h4>
          <p className="text-sm md:text-base opacity-90">
            Looking for the perfect place to lodge or rent? We've got you
            covered.
          </p>
          <span className="mt-4 inline-block bg-yellow-400 text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-yellow-300 transition-all">
            Click Here
          </span>
        </motion.div>

        {/* Lodge Owner */}
        <motion.div
          className="cursor-pointer bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-white/30"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          custom={1}
          onClick={() => navigate("/registerowner")}
        >
          <img
            src={ownerh}
            alt="lodge owner"
            className="h-20 mb-4 drop-shadow-md"
          />
          <h4 className="text-2xl font-bold mb-2">List a Lodge</h4>
          <p className="text-sm md:text-base opacity-90">
            Want to rent out your lodge, space, or apartment? Join us and reach
            thousands of potential tenants.
          </p>
          <span className="mt-4 inline-block bg-green-400 text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-green-300 transition-all">
            Click Here
          </span>
        </motion.div>
      </div>

      {/* Footer */}
    </div>
  );
}
