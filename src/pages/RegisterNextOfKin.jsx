import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useModalContext } from "../components/ui/ModalProvider";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import StateLgaSelect from "../components/StateLgaSelect";

export default function RegisterNextOfKin() {
  const navigate = useNavigate();
  const location = useLocation();
  const modal = useModalContext();
  const [firebaseUser, loadingAuth] = useAuthState(auth);

  // payload from previous step
  const provided = (location.state && location.state.provided) || {};
  const from = (location.state && location.state.from) || null;

  const [form, setForm] = useState({
    // copy previous fields so we can include them in final payload
    dob: provided.dob || "",
    address: provided.address || "",
    addressLga: provided.addressLga || "",
    addressState: provided.addressState || "",
    permanentAddress: provided.permanentAddress || "",
    mobile: provided.mobile || "",
    imageData: provided.imageData || null,
    nextOfKinName: provided.nextOfKinName || "",
    nextOfKinPhone: provided.nextOfKinPhone || "",
    nextOfKinRelation: provided.nextOfKinRelation || "",
    nextOfKinAddress: provided.nextOfKinAddress || "",
  });

  useEffect(() => {
    if (loadingAuth) return;
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) navigate("/profile", { replace: true });
    } catch (e) {}
  }, [loadingAuth, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const f = files[0];
      const fr = new FileReader();
      fr.onload = () => setForm((p) => ({ ...p, [name]: fr.result }));
      fr.readAsDataURL(f);
    } else setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((s) => ({ ...s, [name]: undefined }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const val = value && String(value).trim();
    if (!val) {
      setFieldErrors((s) => ({ ...s, [name]: "Required" }));
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing field",
            message: `Please enter ${name}.`,
          });
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleBack = () => navigate(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      { key: "nextOfKinName", label: "Next of kin name" },
      { key: "nextOfKinPhone", label: "Next of kin phone" },
      { key: "nextOfKinRelation", label: "Next of kin relationship" },
      { key: "nextOfKinAddress", label: "Next of kin address" },
    ];
    const missing = required
      .filter((r) => !(form[r.key] && String(form[r.key]).trim()))
      .map((r) => r.label);
    if (missing.length > 0) {
      const errs = {};
      required.forEach((r) => {
        if (missing.includes(r.label)) errs[r.key] = "Required";
      });
      setFieldErrors(errs);
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing fields",
            message: `Please complete: \n- ${missing.join("\n- ")}`,
          });
        }
      } catch (err) {
        console.warn(err);
      }
      return;
    }

    setSubmitting(true);
    try {
      // Build the final payload exactly like previous flow expected
      const payloadState = {
        provided: {
          dob: form.dob,
          address: form.address,
          addressLga: form.addressLga,
          addressState: form.addressState,
          permanentAddress: form.permanentAddress,
          mobile: form.mobile,
          imageData: form.imageData || null,
          nextOfKinName: form.nextOfKinName,
          nextOfKinPhone: form.nextOfKinPhone,
          nextOfKinRelation: form.nextOfKinRelation,
          nextOfKinAddress: form.nextOfKinAddress,
        },
        from: from || null,
      };
      navigate("/registeruser/details", { state: payloadState });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl w-full max-w-3xl p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Next of Kin Details
          </h2>
          <p className="text-white/80">
            Provide details of a close contact for security and verification.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Name
            </label>
            <input
              name="nextOfKinName"
              placeholder="Full name"
              value={form.nextOfKinName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.nextOfKinName
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
            />
            {fieldErrors.nextOfKinName ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.nextOfKinName}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Phone
            </label>
            <input
              name="nextOfKinPhone"
              placeholder="Eg: 08012345678"
              value={form.nextOfKinPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.nextOfKinPhone
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
            />
            {fieldErrors.nextOfKinPhone ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.nextOfKinPhone}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Relationship to Next of Kin
            </label>
            <select
              name="nextOfKinRelation"
              value={form.nextOfKinRelation}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.nextOfKinRelation
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
            >
              <option value="">Select relationship</option>
              <option>Father</option>
              <option>Mother</option>
              <option>Husband</option>
              <option>Wife</option>
              <option>Brother</option>
              <option>Sister</option>
              <option>Son</option>
              <option>Daughter</option>
              <option>Uncle</option>
              <option>Aunt</option>
              <option>Cousin</option>
              <option>Friend</option>
              <option>Other</option>
            </select>
            {fieldErrors.nextOfKinRelation ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.nextOfKinRelation}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Address
            </label>
            <input
              name="nextOfKinAddress"
              placeholder="Full Contact Address"
              value={form.nextOfKinAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.nextOfKinAddress
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
            />
            {fieldErrors.nextOfKinAddress ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.nextOfKinAddress}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handleBack}
              className="py-2 px-4 rounded-lg text-white font-semibold bg-gray-500 hover:opacity-90"
            >
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className={`py-2 px-4 rounded-lg text-white font-semibold ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-purple-600"
              }`}
            >
              {submitting ? "Submitting..." : "Continue to Verification"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
