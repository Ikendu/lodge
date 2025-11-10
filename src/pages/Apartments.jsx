import { useMemo, useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import logo from "../assets/logos/logo.png";

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

  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
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

    return () => (mounted = false);
  }, []);

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
  }, [lodges, q, loc, min, max]);

  const handleRoomClick = (lodge) => {
    navigate(`/lodge/${lodge.id}`, { state: { lodge } });
  };

  return (
    <div className="p-4 md:p-10">
      <i
        onClick={() => navigate(-1)}
        class="fa-solid fa-arrow-left cursor-pointer pb-10 absolute top-20 left-4 z-10"
      ></i>
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
        Explore Available Lodges & Apartments
      </h2>

      <div className="">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="animate-spin h-20 w-20 text-gray-700"
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
            <p className="mt-4 text-lg text-gray-700">Loading lodges…</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">
            <h3>
              Failed to load lodges, Please check your nextwork and reload the
              page
            </h3>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
