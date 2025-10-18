import { useState, useMemo } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { lodges } from "../lodgedata";
import { useLocation } from "react-router-dom";

export default function Apartments() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const q = (params.get("q") || "").toLowerCase();
  const loc = (params.get("location") || "").toLowerCase();
  const min = parseFloat(params.get("min")) || 0;
  const max = parseFloat(params.get("max")) || Number.POSITIVE_INFINITY;

  const filtered = useMemo(() => {
    return lodges.filter((l) => {
      // price filter
      if (l.price < min || l.price > max) return false;
      // location filter
      if (loc) {
        if (!(l.location || "").toLowerCase().includes(loc)) return false;
      }
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
  }, [q, loc, min, max]);

  const handleRoomClick = (lodge) => {
    navigate(`/lodge/${lodge.id}`, { state: { lodge } });
  };

  return (
    <div className="p-4 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
        Explore Available Lodges & Apartments
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(filtered.length ? filtered : lodges).map((lodge, index) => (
          <motion.div
            key={lodge.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl shadow-md hover:shadow-xl transition duration-300 bg-white overflow-hidden cursor-pointer"
            onClick={() => handleRoomClick(lodge)}
          >
            <img
              src={lodge.images?.[0] ?? ""}
              alt={lodge.title}
              className="h-56 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{lodge.title}</h3>
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
  );
}
