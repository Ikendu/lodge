import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import LodgeList from "../components/LodgeList";
import RequestAccountDeleteModal from "../components/RequestAccountDeleteModal";
import { useModalContext } from "../components/ui/ModalProvider";

export default function UserProfilePage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const modal = useModalContext();

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const savedData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("customerProfile"));
    } catch (e) {
      return <div>Getting your profile ready, please wait...</div>;
    }
  }, []);
  const display = profileData || savedData || {};
  console.log("Saved Data:", savedData);

  // Paid bookings / payments
  const [paidBookings, setPaidBookings] = useState([]);
  const [loadingPaid, setLoadingPaid] = useState(false);

  // populate form when display changes
  useEffect(() => {
    setForm({
      contactAddress: display.address || "",
      permanentAddress: display.permanentAddress || "",
      mobile: display.mobile || display.phone || "",
      nextOfKinName: display.nextOfKinName || "",
      nextOfKinPhone: display.nextOfKinPhone || "",
      nextOfKinAddress: display.nextOfKinAddress || "",
      nextOfKinRelation: display.nextOfKinRelation || "",
      email: display.userLoginMail || display.email || "",
      nin: display.nin || display.id || "",
    });
    // mark profile as loaded once we populate the form from storage/profile
    setLoadingProfile(false);
  }, [display]);

  // Lodges are handled in the LodgeList component below
  const [lodgesRefreshKey, setLodgesRefreshKey] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // helper to resolve image value
  const getImageSrc = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return null;
    if (val.startsWith("data:")) return val;
    if (/^[A-Za-z0-9+/=\s]+$/.test(val) && val.length > 100)
      return `data:image/jpeg;base64,${val}`;
    const trimmed = val.trim();
    if (!trimmed.startsWith("http") && !trimmed.includes("/")) {
      const base = "https://lodge.morelinks.com.ng/api/userImage/";
      return base + encodeURIComponent(trimmed);
    }
    return val;
  };

  const ninImage =
    getImageSrc(display.verified_image) ||
    getImageSrc(display.verified_image_url);
  const uploadedImageRaw = display.image || display.uploadedImage;
  const uploadedImage = getImageSrc(uploadedImageRaw) || null;
  const signatureRaw =
    display.verified_signature ||
    display.signature ||
    display.verified_signature_url ||
    display.signature_url ||
    display.signatureImage;
  const signatureSrc = getImageSrc(signatureRaw) || null;

  const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };
  const imgHover = { scale: 1.05, rotate: 1.5 };
  const btnHover = { scale: 1.05 };

  const profile = {
    givenPhoto: uploadedImage,
    ninPhoto: ninImage,
    fullName: `${display?.firstName || ""} ${display?.middleName || ""} ${
      display?.lastName || ""
    }`.trim(),
    dob: display.dob || "Not provided",
    email: display.userLoginMail || "-",
    nin_phone: display.phone || "-",
    mobile: display.mobile || "-",
    nin: display.nin || display.id || "-",
    address:
      `${display.address}, ${display.addressLga}, ${display.addressState} ` ||
      "Not provided",
    verifiedAddress: display.nin_address || "Not provided",
    permanentAddress: display.permanentAddress || "Not provided",
    lgaOfOrigin: display.lga || "Not provided",
    nextOfKinName: display.nextOfKinName || "Not provided",
    nextOfKinPhone: display.nextOfKinPhone || "Not provided",
    nextOfKinAddress: display.nextOfKinAddress || "Not provided",
    nextOkinRelation: display.nextOfKinRelation || "Not provided",
  };

  // fetch paid bookings for this user (email or nin)
  useEffect(() => {
    async function fetchPaid() {
      const email =
        savedData?.userLoginMail ||
        savedData?.email ||
        display?.userLoginMail ||
        display?.email ||
        "";
      const nin = savedData?.nin || display?.nin || "";
      if (!email && !nin) return;
      setLoadingPaid(true);

      const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal }).finally(
          () => clearTimeout(id)
        );
      };

      const endpoints = [
        "https://lodge.morelinks.com.ng/api/get_user_payments.php",
        "http://localhost/lodge/api/get_user_payments.php",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetchWithTimeout(
            url,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, nin }),
            },
            4000
          );
          if (!res || !res.ok) continue;
          const text = await res.text();
          let json = null;
          try {
            json = JSON.parse(text);
          } catch (e) {
            continue;
          }
          if (json && json.success && Array.isArray(json.payments)) {
            setPaidBookings(json.payments);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      setLoadingPaid(false);
    }
    fetchPaid();
  }, [savedData, display]);

  const requestRefund = async (payment) => {
    console.log("Requesting refund for payment:", payment);
    const ok = await modal.confirm({
      title: "Request refund",
      message: "Are you sure you want to request a refund for this booking?",
      okText: "Yes",
      cancelText: "No",
    });
    if (!ok) return;
    const reason = await modal.prompt({
      title: "Refund reason (optional)",
      message: "Optional: enter a short reason for the refund request",
      placeholder: "Reason for refund",
      okText: "Submit",
      cancelText: "Skip",
      defaultValue: "",
    });
    const endpoints = [
      "https://lodge.morelinks.com.ng/api/request_refund.php",
      "http://localhost/lodge/api/request_refund.php",
    ];
    const payload = {
      payment_id: payment?.id || 0,
      reference:
        payment?.reference ||
        payment?.payment_reference ||
        payment?.order_id ||
        "",
      userEmail: savedData?.userLoginMail || display?.userLoginMail || "",
      userMobile: savedData?.mobile || display?.mobile || "",
      userName:
        `${savedData?.firstName || display?.firstName || ""} ${
          savedData?.lastName || display?.lastName
        }` || "",
      amount: payment?.amount || 0,
      lodgeTitle: payment?.lodge_title || payment?.lodge || "Untitled lodge",
      lodgeOwnerNumber: payment?.owner_mobile || "",
      lodgeOwnerEmail: payment?.owner_email || "",
      reason: reason || "",
    };
    console.log("Refund Payload:", payload);
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          await modal.alert({
            title: "Error",
            message: "Invalid response from server",
          });
          return;
        }
        if (!res.ok) {
          await modal.alert({
            title: "Request failed",
            message: json.message || "Request failed",
          });
          continue;
        }
        if (json.success) {
          await modal.alert({
            title: "Refund request",
            message:
              "Refund request submitted. Support will contact you shortly.",
          });
          // update local status
          setPaidBookings((prev) =>
            prev.map((p) =>
              p.id === payment.id ? { ...p, refund_status: "requested" } : p
            )
          );
          return;
        } else {
          await modal.alert({
            title: "Request failed",
            message: json.message || "Request failed",
          });
          continue;
        }
      } catch (e) {
        continue;
      }
    }
    await modal.alert({
      title: "Error",
      message: "Failed to submit refund request. Please try again later.",
    });
  };

  const handleDeleteLodge = async (lodgeId) => {
    if (!lodgeId) return;
    const ok = await modal.confirm({
      title: "Delete lodge",
      message:
        "Are you sure you want to delete this lodge? This cannot be undone.",
      okText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;

    const payload = {
      id: lodgeId,
      userUid: savedData?.userUid || display?.userUid || user?.uid || "",
      nin: savedData?.nin || display?.nin || "",
    };

    const endpoints = [
      "https://lodge.morelinks.com.ng/api/delete_lodge.php",
      "http://localhost/lodge/api/delete_lodge.php",
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          await modal.alert({
            title: "Error",
            message: "Invalid response from server",
          });
          return;
        }
        if (!res.ok) {
          await modal.alert({
            title: "Delete failed",
            message: json.message || "Failed to delete lodge",
          });
          continue;
        }
        if (json.success) {
          await modal.alert({ title: "Deleted", message: "Lodge deleted" });
          setLodgesRefreshKey((k) => k + 1);
          return;
        } else {
          await modal.alert({
            title: "Delete failed",
            message: json.message || "Failed to delete lodge",
          });
          continue;
        }
      } catch (e) {
        continue;
      }
    }
    await modal.alert({
      title: "Error",
      message: "Failed to delete lodge. Please try again later.",
    });
  };

  const handleAccountDeleteSubmit = async (payload) => {
    // try submitting to backend endpoints (prod then local)
    const endpoints = [
      "https://lodge.morelinks.com.ng/api/request_account_delete.php",
      "http://localhost/lodge/api/request_account_delete.php",
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid response from server");
        }
        if (!res.ok) {
          throw new Error(json.message || "Request failed");
        }
        if (json.success) {
          await modal.alert({
            title: "Account deletion",
            message:
              "Account deletion request submitted. Support will contact you.",
          });
          return;
        } else {
          throw new Error(json.message || "Request failed");
        }
      } catch (e) {
        // try next
        continue;
      }
    }
    throw new Error(
      "Failed to submit account deletion request. Please try again later."
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading authentication state…</div>
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 flex justify-center items-center flex-col p-6 overflow-y-auto"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-5xl mb-6">
        <h2 className="text-xl text-white font-semibold mb-3">
          Your Bookings (Paid)
        </h2>
        <div className="bg-white/5 p-4 rounded-lg text-white">
          {loadingPaid ? (
            <div>Loading your paid bookings…</div>
          ) : paidBookings.length === 0 ? (
            <div className="text-sm text-gray-300">
              No paid bookings found, If you have booking try reloading the page
            </div>
          ) : (
            <div className="space-y-3">
              {paidBookings.map((b) => (
                <div
                  key={b.id || b.reference}
                  className="bg-white/6 p-3 rounded-md flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {b.lodge_title || b.lodge || "Untitled lodge"}
                    </div>
                    <div className="text-sm text-gray-300">
                      {b.lodge_location || b.lodge_location}
                    </div>
                    <div className="text-sm text-gray-300">
                      Amount: ₦{Number(b.amount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Ref: {b.reference || b.payment_reference || b.order_id}
                    </div>
                    {b.refund_requested === 1 ? (
                      <div className="text-xs text-yellow-200">
                        Refund requested
                      </div>
                    ) : b.refund_requested === 2 ? (
                      <div className="text-xs text-yellow-200">
                        Refund approved
                      </div>
                    ) : b.refund_requested === 3 ? (
                      <div className="text-xs text-yellow-200">
                        Refund under consideration
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/lodge/${encodeURIComponent(
                            b.lodge_id || b.lodge || ""
                          )}`,
                          {
                            state: { lodge: b },
                          }
                        )
                      }
                      className="px-3 py-1 bg-blue-600 rounded text-white text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        // Build a lodge object for the receipt page
                        const lodgeForReceipt = {
                          id: b.order_id || b.lodge || null,
                          title: b.lodge_title || b.lodge || "Untitled lodge",
                          location: b.lodge_location || b.lodge_location || "",
                          amount: b.amount || b.price || null,
                          created_at: b.created_at || null,
                          startDate: b.startDate,
                          endDate: b.endDate,
                          nights: b.nights || null,

                          raw: b.lodge_raw || b.raw || {},
                          description: b.description || null,
                          room: b.room || null,
                        };

                        // provider/payment payload — attempt to pass paystack-shaped payload
                        const paystackdata = { data: b };
                        const provider = b.provider || b.channel || "paystack";

                        navigate("/payment-success", {
                          state: {
                            lodge: lodgeForReceipt,
                            profile: display,
                            provider,
                            paystackdata,
                          },
                        });
                      }}
                      className="px-3 py-1 bg-green-600 rounded text-white text-sm"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => requestRefund(b)}
                      className=" rounded px-1 bg-yellow-500 text-white md:text-sm text-xs"
                    >
                      Request Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <motion.div
        className="max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-white"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow">
              User Profile
            </h1>
            {loadingProfile && (
              <div
                className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"
                role="status"
                aria-label="Loading profile"
              />
            )}
          </div>
          <motion.button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-200 hover:text-white transition"
            whileTap={{ scale: 0.96 }}
          >
            ⬅ Back
          </motion.button>
        </div>

        <div className="md:flex md:gap-8">
          <div className="md:w-2/5 space-y-6">
            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.ninPhoto}
                alt="NIN"
                className="w-full h-80 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.givenPhoto}
                alt="Given"
                className="w-full h-80 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
              {/* {signatureSrc && (
                <div className="flex justify-center p-3 bg-transparent">
                  <img
                    src={signatureSrc}
                    alt="Signature"
                    className="w-1/2 object-contain rounded-md border border-white/20"
                    style={{ height: "auto" }}
                  />
                </div>
              )} */}
            </motion.div>
          </div>

          <motion.div
            className="md:w-3/5 mt-8 md:mt-0 space-y-4 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Edit controls */}
            <div className="flex items-center justify-end gap-2 mb-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 text-sm border rounded bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // save
                      setSaving(true);
                      setSaveMessage(null);
                      try {
                        const payload = {
                          email: form.email,
                          nin: form.nin,
                          contact_address: form.contactAddress,
                          permanent_address: form.permanentAddress,
                          mobile: form.mobile,
                          nextOfKinName: form.nextOfKinName,
                          nextOfKinPhone: form.nextOfKinPhone,
                          nextOfKinAddress: form.nextOfKinAddress,
                          nextOfKinRelation: form.nextOfKinRelation,
                        };

                        // const url = `${window.location.protocol}//${window.location.host}/api/update_profile.php`;
                        const url =
                          "https://lodge.morelinks.com.ng/api/update_profile.php";
                        const res = await fetch(url, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const text = await res.text();
                        let json = null;
                        try {
                          json = JSON.parse(text);
                        } catch (e) {
                          throw new Error("Invalid server response: " + text);
                        }

                        if (!res.ok)
                          throw new Error(json.message || "Save failed");
                        if (json.success) {
                          setSaveMessage("Saved successfully");
                          // update local storage + state
                          const newProfile = {
                            ...(display || {}),
                            ...{
                              address: form.contactAddress,
                              permanentAddress: form.permanentAddress,
                              mobile: form.mobile,
                              nextOfKinName: form.nextOfKinName,
                              nextOfKinPhone: form.nextOfKinPhone,
                              nextOfKinAddress: form.nextOfKinAddress,
                              nextOfKinRelation: form.nextOfKinRelation,
                            },
                          };
                          try {
                            localStorage.setItem(
                              "customerProfile",
                              JSON.stringify(newProfile)
                            );
                          } catch (e) {}
                          setProfileData(newProfile);
                          setEditing(false);
                        } else {
                          throw new Error(json.message || "Save failed");
                        }
                      } catch (err) {
                        console.error(err);
                        setSaveMessage(err.message || "Save failed");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-3 py-1 text-sm bg-green-600 rounded text-white"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1 text-sm bg-blue-600 rounded text-white"
                >
                  Edit contact & NOK
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1 text-sm bg-red-600 rounded text-white ml-2"
              >
                Request account delete
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Full Name", profile?.fullName],
                ["Date of Birth", profile?.dob],
                ["Email", profile?.email],
                ["Phone", profile?.nin_phone],
                ["Mobile", profile?.mobile],
                ["NIN", "Verified"],
                // ["NIN", profile?.nin],
              ].map(([label, value], i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-gray-300 uppercase">{label}</div>
                  {/* if editing and this is editable field, show input */}
                  <div className="font-semibold">
                    {editing && label === "Mobile" ? (
                      <input
                        value={form.mobile || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, mobile: e.target.value }))
                        }
                        className="w-full p-2 rounded text-black text-sm"
                      />
                    ) : (
                      <span className=" break-words">{value}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <hr />
            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Contact Address
              </div>
              <div className="font-semibold">
                {editing ? (
                  <textarea
                    value={form.contactAddress || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contactAddress: e.target.value }))
                    }
                    className="w-full p-2 rounded text-black text-sm"
                    rows={3}
                  />
                ) : (
                  profile.address
                )}
              </div>
            </motion.div>
            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Permanent Address
              </div>
              <div className="font-semibold">
                {editing ? (
                  <textarea
                    value={form.permanentAddress || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        permanentAddress: e.target.value,
                      }))
                    }
                    className="w-full p-2 rounded text-black text-sm"
                    rows={3}
                  />
                ) : (
                  profile.permanentAddress
                )}
              </div>
            </motion.div>

            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Verified Address
              </div>
              <div className="font-semibold">{profile.verifiedAddress}</div>
            </motion.div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Full Name", profile?.nextOfKinName],
                ["Phone", profile?.nextOfKinPhone],
                ["Address", profile?.nextOfKinAddress],
                ["Relation", profile?.nextOkinRelation],
              ].map(([label, value], i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-gray-300 uppercase">{label}</div>
                  <div className="font-semibold">
                    {editing ? (
                      // map label to form field
                      label === "Full Name" ? (
                        <input
                          value={form.nextOfKinName || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              nextOfKinName: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded text-black text-sm"
                        />
                      ) : label === "Phone" ? (
                        <input
                          value={form.nextOfKinPhone || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              nextOfKinPhone: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded text-black text-sm"
                        />
                      ) : label === "Address" ? (
                        <input
                          value={form.nextOfKinAddress || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              nextOfKinAddress: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded text-black text-sm"
                        />
                      ) : (
                        <input
                          value={form.nextOfKinRelation || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              nextOfKinRelation: e.target.value,
                            }))
                          }
                          className="w-full p-2 rounded text-black text-sm"
                        />
                      )
                    ) : (
                      value
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {saveMessage && (
              <div className="mt-3 text-sm text-yellow-200">{saveMessage}</div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <RequestAccountDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        defaultValues={{
          fullname: profile.fullName,
          email: profile.email,
          phone: profile.nin_phone,
          mobile: profile.mobile,
        }}
        onSubmit={handleAccountDeleteSubmit}
      />
      <div className="max-w-5xl mt-8">
        <h2 className="text-2xl text-white font-bold mb-3">
          Your listed Lodges
        </h2>
        <LodgeList
          userUid={user?.uid}
          nin={savedData?.nin}
          onDelete={handleDeleteLodge}
          refreshKey={lodgesRefreshKey}
        />
      </div>
    </motion.div>
  );
}
