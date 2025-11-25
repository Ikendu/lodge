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

  // Modal for details
  const [modalDetails, setModalDetails] = useState(null);
  const showDetails = (item) => setModalDetails(item);
  const closeDetails = () => setModalDetails(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/refunds.php")
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        console.log("Refund Data", json.data);
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
      // console.log("Refund Data", j.data);
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
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">User Number</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Lodge title</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Owner Email</th>
              <th className="px-4 py-2 text-left">Owner Number</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr
                key={r.id}
                className="border-t cursor-pointer hover:bg-blue-50"
                onClick={() => showDetails(r)}
              >
                <td className="px-4 py-2">{r?.id}</td>
                <td className="px-4 py-2">{r.user_email}</td>
                <td className="px-4 py-2">{r?.user_name}</td>
                <td className="px-4 py-2">{r.user_mobile}</td>
                <td className="px-4 py-2">{r.amount}</td>
                <td className="px-4 py-2">{r.lodge_title}</td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2">{r.lodge_owner_email}</td>
                <td className="px-4 py-2">{r.lodge_owner_mobile}</td>
                <td className="px-4 py-2">
                  {r.status === "requested" ? (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
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

      {/* Modal for details */}
      {modalDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeDetails}
            >
              &times;
            </button>
            <h4 className="text-lg font-bold mb-3">Refund Request Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>ID:</strong> {modalDetails.id}
              </div>
              <div>
                <strong>User Email:</strong> {modalDetails.user_email}
              </div>
              <div>
                <strong>User Name:</strong> {modalDetails.user_name}
              </div>
              <div>
                <strong>User Number:</strong> {modalDetails.user_mobile}
              </div>
              <div>
                <strong>Amount:</strong> {modalDetails.amount}
              </div>
              <div>
                <strong>Lodge Title:</strong> {modalDetails.lodge_title}
              </div>
              <div>
                <strong>Reason:</strong> {modalDetails.reason}
              </div>
              <div>
                <strong>Owner Email:</strong> {modalDetails.lodge_owner_email}
              </div>
              <div>
                <strong>Owner Number:</strong> {modalDetails.lodge_owner_mobile}
              </div>
              <div>
                <strong>Status:</strong> {modalDetails.status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
