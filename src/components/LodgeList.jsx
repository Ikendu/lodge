import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LodgeList({
  userUid,
  nin,
  onDelete,
  onEdit,
  refreshKey,
}) {
  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLodges = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (userUid) params.append("userUid", userUid);
        else if (nin) params.append("nin", nin);
        if (!params.toString()) {
          setLodges([]);
          setLoading(false);
          inFlight.current = false;
          return;
        }
        const url =
          "https://lodge.morelinks.com.ng/api/get_lodges.php?" +
          params.toString();
        const res = await fetch(url, { method: "GET", mode: "cors" });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("LodgeList: invalid json", text);
        }
        if (json && json.success && Array.isArray(json.data))
          setLodges(json.data);
        else setLodges([]);
      } catch (err) {
        console.error("LodgeList fetch error", err);
        setLodges([]);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    };

    fetchLodges();
  }, [userUid, nin, refreshKey]);

  if (loading)
    return <div className="text-sm text-white/70">Loading lodges…</div>;
  if (!loading && lodges.length === 0)
    return <div className="text-sm text-white/70">No lodges found.</div>;

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {lodges.map((lodge) => (
        <motion.div
          key={lodge.id}
          className="bg-white/5 p-4 rounded-lg border border-white/10"
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <div className="md:flex gap-4 items-start">
            <div className="w-full md:w-44 h-28 rounded-md overflow-hidden bg-gray-200">
              <img
                src={
                  lodge.image_first_url ||
                  lodge.image_second_url ||
                  lodge.image_third_url ||
                  ""
                }
                alt={lodge.title || "Lodge image"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 mt-3 md:mt-0">
              <div className="font-semibold text-white/95">
                {lodge.title || "Untitled"}
              </div>
              <div className="text-sm text-white/70">
                {lodge.location || ""} • {lodge.type || ""}
              </div>
              <div className="mt-2 text-sm text-white/80">
                {lodge.description
                  ? lodge.description.slice(0, 120) +
                    (lodge.description.length > 120 ? "…" : "")
                  : ""}
              </div>
            </div>
            <div className="text-right md:text-left ml-2 md:ml-4">
              <div className="text-sm font-semibold">
                {lodge.price ? `₦${lodge.price}` : "-"}
              </div>
              <div className="text-xs text-white/60">
                {new Date(lodge.created_at).toLocaleDateString()}
              </div>

              <div className="mt-3 flex flex-col justify-end gap-2">
                <button
                  onClick={() =>
                    navigate(`/lodges/${encodeURIComponent(lodge.id)}`, {
                      state: { lodge },
                    })
                  }
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  View
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(lodge)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Delete this lodge? This action cannot be undone."
                        )
                      )
                        onDelete(lodge.id);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
