import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function Complaints() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/complaints.php")
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        if (mounted) setItems(json.data || []);
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleResolve = async (id) => {
    if (!confirm(`Mark complaint #${id} as resolved?`)) return;
    try {
      const res = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/complaints_action.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "resolve" }),
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.success) throw new Error(json.message || "Action failed");
      toast.success(json.message || "Resolved");
      // refresh
      setLoading(true);
      const r = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/complaints.php"
      );
      const jt = await r.text();
      const j = jt ? JSON.parse(jt) : {};
      setItems(j.data || []);
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading complaints...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Complaints</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">Against</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.id}</td>
                <td className="px-4 py-2">{r.from_name || r.from_email}</td>
                <td className="px-4 py-2">{r.against_name || r.against}</td>
                <td className="px-4 py-2">{r.message}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">
                  {r.status !== "resolved" ? (
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={() => handleResolve(r.id)}
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-sm text-gray-600">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
