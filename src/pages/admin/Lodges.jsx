import React, { useEffect, useState } from "react";
import { useModalContext } from "../../components/ui/ModalProvider";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const modal = useModalContext();

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
    const ok = await modal.confirm({
      title: "Delete lodge",
      message: `Delete lodge #${id}? This is irreversible.`,
      okText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
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
      await modal.alert({
        title: "Deleted",
        message: json.message || "Deleted",
      });
      // refresh
      setLoading(true);
      const r = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/lodges.php"
      );
      const jt = await r.text();
      const j = jt ? JSON.parse(jt) : {};
      setLodges(j.data || []);
    } catch (err) {
      await modal.alert({ title: "Error", message: err.message || "Error" });
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
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Date Created</th>
            </tr>
          </thead>
          <tbody>
            {lodges.map((l) => (
              <tr
                key={l.id}
                className="border-t cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  // avoid triggering when delete button clicked
                  const target = e.target;
                  if (
                    target &&
                    (target.tagName === "BUTTON" || target.closest("button"))
                  )
                    return;
                  navigate(`/admin/lodges/${l.id}`, { state: l });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    navigate(`/admin/lodges/${l.id}`, { state: l });
                }}
              >
                <td className="px-4 py-2">{l.id}</td>
                <td className="px-4 py-2">{l.title}</td>
                <td className="px-4 py-2">{l.userLoginMail}</td>
                <td className="px-4 py-2">{l.location}</td>
                <td className="px-4 py-2">{l.price}</td>
                <td className="px-4 py-2">{l.type}</td>
                <td className="px-4 py-2">{l.created_at}</td>
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
