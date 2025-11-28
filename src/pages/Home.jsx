// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import guest from "../assets/logos/guest.png";
import ownerh from "../assets/logos/ownerh.png";
import herobg from "../assets/images/herobg.jpg";
import { Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

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

  const [user] = useAuthState(auth);
  const location = useLocation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const q = (params.get("q") || "").toLowerCase();
  const loc = (params.get("location") || "").toLowerCase();
  const min = parseFloat(params.get("min")) || 0;
  const max = parseFloat(params.get("max")) || Number.POSITIVE_INFINITY;

  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch("https://lodge.morelinks.com.ng/api/get_all_lodge.php")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        if (j && j.success && Array.isArray(j.data)) {
          const mapped = j.data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            location: row.location,
            price: parseFloat(row.price) || 0,
            rating: row.rating || 0,
            images: [
              row.image_first_url,
              row.image_second_url,
              row.image_third_url,
            ].filter(Boolean),
            raw: row,
          }));
          setLodges(mapped);
        } else {
          setError("Failed to load lodges");
        }
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return lodges.filter((l) => {
      if (l.price < min || l.price > max) return false;
      if (loc && !(l.location || "").toLowerCase().includes(loc)) return false;
      if (q) {
        const hay = (
          l.title +
          " " +
          l.description +
          " " +
          l.location
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [lodges, q, loc, min, max]);

  const handleListLodge = () => {
    if (!user) {
      // send to login and preserve the full target location so on return we can continue
      navigate("/login", { state: { from: { pathname: "/registeruser" } } });
      return;
    }
    navigate("/list_new_lodge");
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white p-2">
      {/* HERO SECTION with responsive background image (content sits on top) */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl mb-8"
        style={{
          backgroundImage: `url(${herobg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-5xl px-4 py-12">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-extrabold text-center drop-shadow-lg leading-tight"
          >
            <span className="inline-block mb-3 text-blue-300">Welcome to</span>
            <br />
            <span className="text-4xl md:text-6xl">MoreLinks Lodge</span>
          </motion.h1>
          <p className="mt-3 text-sm md:text-base text-white/90 italic text-center max-w-2xl mx-auto">
            where life is made easier and connections more safer
          </p>
          <div className="flex items-center justify-center mt-6 ">
            <button
              onClick={() => navigate("login")}
              className="bg-green-500 py-3 px-20 rounded-full cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Options Section (cards) placed on top of hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8 mx-auto">
            <motion.div
              className="cursor-pointer bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-white/30"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={0}
              onClick={() => navigate("/apartments")}
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
              <span className="mt-4 inline-block bg-blue-400 text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-yellow-300 transition-all">
                Click Here
              </span>
            </motion.div>

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
                Want to rent out your lodge, space, or apartment? Join us and
                reach thousands of potential tenants.
              </p>
              <span className="mt-4 inline-block bg-green-400 text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-green-300 transition-all">
                Click Here
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature / CTA sections (inserted) */}
      <div className="w-full max-w-6xl mb-8">
        {/* Part 1: Text left, mock graphics right (slide in from left) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 rounded-2xl mb-6 "
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              Affordable, Secure, Easy Bookings, Real Connections.
            </h3>
            <p className="text-white/90 text-base md:text-lg">
              Tired of missing that interview, training, or workshop just
              because accommodation costs too much? With Morelinks Lodge secure
              Listings, you can find comfortable, budget-friendly rooms near
              your destination — anytime, anywhere.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            {/* simple mockup graphic using SVG */}
            <svg
              className="w-64 h-40"
              viewBox="0 0 300 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="10"
                width="188"
                height="180"
                rx="12"
                fill="#0EA5E9"
                opacity="0.15"
              />
              <rect
                x="106"
                y="30"
                width="188"
                height="130"
                rx="12"
                fill="#7C3AED"
                opacity="0.12"
              />
              <rect
                x="20"
                y="24"
                width="150"
                height="24"
                rx="6"
                fill="#fff"
                opacity="0.9"
              />
              <rect
                x="20"
                y="62"
                width="110"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.8"
              />
              <rect
                x="140"
                y="62"
                width="120"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.6"
              />
              <rect
                x="20"
                y="88"
                width="240"
                height="14"
                rx="6"
                fill="#fff"
                opacity="0.5"
              />
              <circle cx="260" cy="150" r="22" fill="#F59E0B" opacity="0.95" />
              <circle cx="20" cy="150" r="22" fill="#F59E0B" opacity="0.60" />
            </svg>
          </div>
        </motion.div>

        {/* Part 2: Reversed layout - mock graphics left, text right (slide in from right) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 rounded-2xl mb-6 "
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <div className="flex justify-center md:justify-start">
            <svg
              className="w-64 h-40"
              viewBox="0 0 300 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="10"
                width="188"
                height="180"
                rx="12"
                fill="#34D399"
                opacity="0.12"
              />
              <rect
                x="106"
                y="30"
                width="188"
                height="130"
                rx="12"
                fill="#60A5FA"
                opacity="0.12"
              />
              <rect
                x="20"
                y="24"
                width="150"
                height="24"
                rx="6"
                fill="#fff"
                opacity="0.9"
              />
              <rect
                x="20"
                y="62"
                width="110"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.8"
              />
              <rect
                x="140"
                y="62"
                width="120"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.6"
              />
              <rect
                x="20"
                y="88"
                width="240"
                height="14"
                rx="6"
                fill="#fff"
                opacity="0.5"
              />
              <circle cx="260" cy="150" r="22" fill="black" opacity="0.95" />
              <circle cx="20" cy="150" r="22" fill="blue" opacity="0.60" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              Need a Place to Stay?
            </h3>
            <p className="text-white/90 text-base md:text-lg mb-4">
              Stay smart and save more with our verified, affordable secure
              lodges. Whether you’re traveling for work, studies, or events,
              we’ve got you covered.
            </p>
            <ul className="text-white/90 list-disc list-inside mb-4">
              <li>Find stays that fit your budget</li>
              <li> Book safely and easily online</li>
              <li> Enjoy comfort and convenience wherever you go</li>
              <li>Your security is sure</li>
            </ul>
            <button
              className="mt-2 inline-block bg-yellow-400 text-black font-semibold py-2 px-5 rounded-full shadow hover:bg-yellow-300 transition-all"
              onClick={() => navigate("/apartments")}
            >
              🔍 Find a Lodge
            </button>
          </div>
        </motion.div>

        {/* Part 3: Host CTA (slide in from left) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-8 rounded-2xl mb-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              Have a Free Room or Space? Earn from It!
            </h3>
            <p className="text-white/90 text-base md:text-lg mb-4">
              Turn your unused space rooms or apartment into steady income. At
              Morelinks, you’re in control — your space, your price, your rules.
            </p>
            <ul className="text-white/90 list-disc list-inside mb-4">
              <li>Earn extra income effortlessly</li>
              <li>List in minutes, get verified fast</li>
              <li>Connect with great guests near you</li>
              <li>At no cost</li>
            </ul>
            <button
              className="mt-2 inline-block bg-green-400 text-black font-semibold py-2 px-5 rounded-full shadow hover:bg-green-300 transition-all"
              onClick={handleListLodge}
            >
              ➕ List Your Space Now
            </button>
          </div>
          <div className="flex justify-center md:justify-end">
            <svg
              className="w-64 h-40"
              viewBox="0 0 300 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="6"
                y="10"
                width="188"
                height="180"
                rx="12"
                fill="#FBBF24"
                opacity="0.12"
              />
              <rect
                x="106"
                y="30"
                width="188"
                height="130"
                rx="12"
                fill="#34D399"
                opacity="0.12"
              />
              <rect
                x="20"
                y="24"
                width="150"
                height="24"
                rx="6"
                fill="#fff"
                opacity="0.9"
              />
              <rect
                x="20"
                y="62"
                width="110"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.8"
              />
              <rect
                x="140"
                y="62"
                width="120"
                height="12"
                rx="4"
                fill="#fff"
                opacity="0.6"
              />
              <circle cx="260" cy="150" r="22" fill="#F59E0B" opacity="0.70" />
              <circle cx="20" cy="150" r="22" fill="blue" opacity="0.60" />
            </svg>
          </div>
        </motion.div>

        {/* Part 4: Why Choose Morelinks (slide in from right) */}
        <motion.div
          className="bg-white/10 p-6 rounded-2xl"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h4 className="text-xl font-bold text-center p-3 text-gray-800 mb-3">
            Why Choose Morelinks?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <ul className="list-none space-y-2">
              <li>✔ Safe and verified listings</li>
              <li>✔ Affordable short or long stays</li>
            </ul>
            <ul className="list-none space-y-2">
              <li>✔ Secure payments and trusted support</li>
              <li>✔ Easy dashboard for hosts and guests</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Lodges preview section (click anywhere to view all) */}
      <div
        className="w-full max-w-6xl bg-white/10 rounded-2xl p-8 shadow-lg mb-12 cursor-pointer"
        onClick={() => navigate("/apartments")}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate("/apartments");
        }}
      >
        <h2 className="text-3xl font-semibold text-center mb-4 text-yellow-300">
          Explore Available Lodges
        </h2>
        <div className="text-center mb-6">
          <button
            className="inline-block bg-yellow-400 text-black font-semibold py-2 px-6 rounded-full shadow hover:bg-yellow-300 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/apartments");
            }}
          >
            Checkout Lodges
          </button>
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="animate-spin h-20 w-20 text-white opacity-90"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="mt-4 text-lg">Loading lodges…</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-100">
              Failed to load lodges, Please check your network and reload the
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-h-60 overflow-hidden">
              {lodges
                .slice()
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .slice(0, 3)
                .map((lodge, i) => (
                  <div
                    key={lodge.id}
                    className="rounded-2xl bg-white text-gray-800 shadow-lg overflow-hidden"
                  >
                    <img
                      src={
                        lodge.images && lodge.images.length > 0
                          ? lodge.images[0]
                          : ""
                      }
                      alt={lodge.title}
                      className="h-40 w-full object-cover"
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
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      <motion.div
        className="w-full max-w-6xl mt-6 p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-teal-400 text-white text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Join the Morelinks Community Today!
        </h3>
        <p className="max-w-2xl mx-auto text-white/90 mb-4">
          Whether you’re looking for a place to stay or ready to make money from
          your space, Morelinks connects people, opportunities, and comfort in
          one platform.
        </p>
        <button
          className="inline-block bg-white text-black font-semibold py-2 px-6 rounded-full shadow hover:opacity-95 transition-all"
          onClick={() => navigate("/registeruser")}
        >
          Get Started Now
        </button>
      </motion.div>
    </div>
  );
}
