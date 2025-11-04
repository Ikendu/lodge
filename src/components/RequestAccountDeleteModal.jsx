import React, { useState, useEffect } from "react";

export default function RequestAccountDeleteModal({
  isOpen,
  onClose,
  defaultValues = {},
  onSubmit,
}) {
  const [fullname, setFullname] = useState(defaultValues.fullname || "");
  const [email, setEmail] = useState(defaultValues.email || "");
  const [phone, setPhone] = useState(defaultValues.phone || "");
  const [mobile, setMobile] = useState(defaultValues.mobile || "");
  const [reason, setReason] = useState(defaultValues.reason || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFullname(defaultValues.fullname || "");
      setEmail(defaultValues.email || "");
      setPhone(defaultValues.phone || "");
      setMobile(defaultValues.mobile || "");
      setReason(defaultValues.reason || "");
      setError(null);
    }
  }, [isOpen, defaultValues]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // clickaway closes modal
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!fullname.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill fullname, email and phone");
      return;
    }
    const payload = {
      fullname: fullname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      mobile: mobile.trim(),
      reason: reason.trim(),
    };
    try {
      setSubmitting(true);
      if (onSubmit) {
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      setError(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Request account delete</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-gray-800">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="text-sm block mb-1">Full name</label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Mobile (optional)</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">
              Reason for account deletion
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1 bg-red-600 text-white rounded"
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
