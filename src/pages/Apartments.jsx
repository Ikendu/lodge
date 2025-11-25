import { useMemo, useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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
    const cacheKey = "cachedLodges_v1";
    const mapRows = (rows) =>
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        price: parseFloat(row.price) || 0,
        rating: row.rating || 3,
        images: [
          row.image_first_url,
          row.image_second_url,
          row.image_third_url,
        ].filter(Boolean),
        raw: row,
      }));

    const backgroundFetch = async (silent = true) => {
      try {
        const res = await fetch(
          "https://lodge.morelinks.com.ng/api/get_all_lodge.php"
        );
        const j = await res.json();
        if (!mounted) return;
        if (j && j.success && Array.isArray(j.data)) {
          const mapped = mapRows(j.data);
          // compare with existing cached value to avoid unnecessary re-renders
          const prev = JSON.parse(localStorage.getItem(cacheKey) || "null");
          const prevJson = prev && prev.data ? JSON.stringify(prev.data) : null;
          const newJson = JSON.stringify(mapped);
          if (prevJson !== newJson) {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ ts: Date.now(), data: mapped })
            );
            if (!silent) setLodges(mapped);
            else
              setLodges((cur) => {
                try {
                  return JSON.stringify(cur) === newJson ? cur : mapped;
                } catch (e) {
                  return mapped;
                }
              });
          }
        } else if (!silent) {
          setError("Failed to load lodges");
        }
      } catch (err) {
        if (!mounted) return;
        if (!silent) {
          setError(String(err));
        }
      } finally {
        if (!silent && mounted) setLoading(false);
      }
    };

    // Try to restore from cache first to avoid blocking UI
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && Array.isArray(cached.data)) {
        setLodges(cached.data);
        setLoading(false);
        // perform a silent background refresh to keep data fresh
        backgroundFetch(true);
      } else {
        // no cache: show loader and fetch
        setLoading(true);
        backgroundFetch(false);
      }
    } catch (e) {
      // parsing error -> fetch normally
      setLoading(true);
      backgroundFetch(false);
    }

    // periodic silent refresh every 5 minutes
    const interval = setInterval(() => backgroundFetch(true), 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return lodges.filter((l) => {
      const typeRaw =
        (l.raw && (l.raw.type || l.raw.lodge_type || l.raw.type_name)) || "";
      const type = String(typeRaw).toLowerCase();
      // Exclude hotel rooms and guest houses from the Apartments listing
      if (type.includes("hotel") || type.includes("guest")) return false;
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
      <div>
        <i
          onClick={() => navigate(-1)}
          class="fa-solid fa-arrow-left cursor-pointer py-5 pr-10 absolute top-14 left-4 z-10"
        ></i>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-800 pt-8">
        Explore Available Lodges & Apartments
      </h2>
      <div className=" text-center mb-6 flex flex-col gap-3">
        <button
          onClick={() => navigate("/hotel-guesthouse")}
          className="text-blue-600 hover:underline w-full flex items-center justify-center gap-2"
        >
          <i class="fa-solid fa-bed"></i>
          Click here to view Hotel Rooms & Guest Houses instead
        </button>
        <Link className="text-blue-500" to={"/list_new_lodge"}>
          Have a lodge to list? Click here
        </Link>
      </div>

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
                    {/* <div className="flex items-center text-yellow-500">
                      <Star size={16} className="fill-yellow-500" />
                      <span className="ml-1 text-sm">{lodge.rating}</span>
                    </div> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-10 text-center flex flex-col gap-5 font-semibold">
        <p className="text-yellow-700">
          More Lodges coming soon at your prefared locations...
        </p>
        <Link className="text-blue-500" to={"/list_new_lodge"}>
          Have a lodge to list? Click here
        </Link>
      </div>
    </div>
  );
}
