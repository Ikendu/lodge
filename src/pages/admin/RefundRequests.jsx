import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useModalContext } from "../../components/ui/ModalProvider";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function RefundRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const modal = useModalContext();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/refunds.php")
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

  const handleAction = async (id, action) => {
    const ok = await modal.confirm({
      title: `${action} refund request`,
      message: `Are you sure you want to ${action} request #${id}?`,
      okText: action === "approve" ? "Approve" : "Proceed",
      cancelText: "Cancel",
    });
    if (!ok) return;
    try {
      const res = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/refunds_action.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!json.success) throw new Error(json.message || "Action failed");
      toast.success(json.message || "Done");
      // refresh list
      setLoading(true);
      const r = await apiFetch(
        "https://lodge.morelinks.com.ng/api/admin/refunds.php"
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

  if (loading) return <div className="p-4">Loading refund requests...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Refund Requests</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.id}</td>
                <td className="px-4 py-2">
                  {r.user_name || r.user || r.user_email}
                </td>
                <td className="px-4 py-2">{r.amount}</td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">
                  {r.status === "requested" ? (
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => handleAction(r.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-600 text-white rounded"
                        onClick={() => handleAction(r.id, "deny")}
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">{r.status}</span>
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
