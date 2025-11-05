import React, { useEffect, useState } from "react";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function Lodges() {
  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/lodges.php")
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        if (mounted) setLodges(json.data || []);
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(`Delete lodge #${id}? This is irreversible.`)) return;
    try {
      const res = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/lodges_action.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action: "delete" }),
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.success) throw new Error(json.message || "Delete failed");
      alert(json.message || "Deleted");
      // refresh
      setLoading(true);
      const r = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/lodges.php"
      );
      const jt = await r.text();
      const j = jt ? JSON.parse(jt) : {};
      setLodges(j.data || []);
    } catch (err) {
      alert(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading lodges...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Lodges</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Owner</th>
              <th className="px-4 py-2 text-left">City</th>
            </tr>
          </thead>
          <tbody>
            {lodges.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-2">{l.id}</td>
                <td className="px-4 py-2">{l.title}</td>
                <td className="px-4 py-2">{l.owner_name || l.owner || ""}</td>
                <td className="px-4 py-2">{l.city}</td>
                <td className="px-4 py-2">
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(l.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
