// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import guest from "../assets/logos/guest.png";
import ownerh from "../assets/logos/ownerh.png";
import { Star } from "lucide-react";
import { lodges } from "../lodgedata";

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

  const handleLodgeClick = (lodge) => {
    navigate(`/lodge/${lodge.id}`, { state: { lodge } });
  };

  const [user] = useAuthState(auth);

  const handleListLodge = () => {
    if (!user) {
      // send to login and preserve the full target location so on return we can continue
      navigate("/login", { state: { from: { pathname: "/registeruser" } } });
      return;
    }
    navigate("/registeruser");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white p-6">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-center m-12 drop-shadow-lg"
      >
        Welcome to <span className="text-yellow-300">MoreLink Lodge</span>
      </motion.h1>

      {/* Options Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-20">
        {/* Lodge Seeker */}
        <motion.div
          className="cursor-pointer bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-white/30"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          custom={0}
          onClick={() =>
            window.scrollTo({
              top: document.body.scrollHeight / 3.5,
              behavior: "smooth",
            })
          }
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
          onClick={handleListLodge}
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

      {/* Lodges List Section */}
      <div className="w-full max-w-6xl bg-white/10 rounded-2xl p-8 shadow-lg mb-12">
        <h2 className="text-3xl font-semibold text-center mb-8 text-yellow-300">
          Explore Available Lodges
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lodges.map((lodge, i) => (
            <motion.div
              key={lodge.id}
              className="rounded-2xl bg-white text-gray-800 shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer transition-all"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleLodgeClick(lodge)}
            >
              <img
                src={
                  lodge.images && lodge.images.length > 0 ? lodge.images[0] : ""
                }
                alt={lodge.title}
                className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{lodge.title}</h3>
                <p className="text-gray-500 text-sm">{lodge.location}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-blue-600">
                    ₦{lodge.price.toLocaleString()}/night
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} className="fill-yellow-500" />
                    <span className="ml-1 text-sm">{lodge.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
