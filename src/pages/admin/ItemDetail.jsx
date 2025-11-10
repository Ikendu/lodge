import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function ItemDetail() {
  const { resource, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) return;
    let mounted = true;
    setLoading(true);
    // fetch list and find by id
    apiFetch(`https://lodge.morelinks.com.ng/api/admin/${resource}.php`)
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        const found = (json.data || []).find(
          (x) => String(x.id) === String(id)
        );
        if (!found) throw new Error("Item not found");
        if (mounted) setItem(found);
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [resource, id]);

  // Close modal
  const close = () => navigate(-1);

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded p-4">Loading item...</div>
      </div>
    );
  if (error)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded p-4 text-red-600">{error}</div>
      </div>
    );

  const entries = Object.entries(item || {});

  return (
    // full-screen modal overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-white rounded shadow p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{resource} — Details</h3>
          <div className="space-x-2">
            <button
              onClick={close}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {entries.map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-start">
              <div className="w-full sm:w-40 text-sm text-gray-500">{k}</div>
              <div className="mt-1 sm:mt-0 sm:ml-4 break-words">
                {String(v ?? "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
