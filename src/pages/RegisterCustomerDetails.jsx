import { useEffect, useState } from "react";
import { useModalContext } from "../components/ui/ModalProvider";
import StateLgaSelect from "../components/StateLgaSelect";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  // also accept Firebase auth presence as a valid login
  const [firebaseUser, loadingAuth] = useAuthState(auth);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // Allow prefilled values when navigating back from verify step
  const provided = location.state?.provided || {};

  useEffect(() => {
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) {
        navigate("/profile", { replace: true });
      }
    } catch (e) {
      // ignore
    }
    const userData = localStorage.getItem("userLogin");

    // While Firebase auth is initializing, wait to avoid flicker
    if (loadingAuth) return;

    if (!userData && !firebaseUser) {
      navigate("/login");
    } else {
      // user present — allow register page
    }
    setCheckingLogin(false);
  }, [navigate, loadingAuth, firebaseUser]);

  const [form, setForm] = useState({
    address: provided.address || "",
    addressLga: provided.addressLga || "",
    addressState: provided.addressState || "",
    permanentAddress: provided.permanentAddress || "",
    mobile: provided.mobile || "",
    imageFile: null,
    imageData: provided.imageData || null, // data URL for safe transfer
    // next-of-kin fields are moved to a separate step
  });

  const [submitting, setSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const modal = useModalContext();
  const [fieldErrors, setFieldErrors] = useState({});
  // fieldErrors logged during development removed

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const f = files[0];
      setForm((prev) => ({ ...prev, [name]: f, imageFile: f }));
      const fr = new FileReader();
      fr.onload = () => setForm((prev) => ({ ...prev, imageData: fr.result }));
      fr.readAsDataURL(f);
      // clear any previous error for this field
      setFieldErrors((s) => ({
        ...s,
        [name]: undefined,
        imageData: undefined,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // clear any previous error for this field
      setFieldErrors((s) => ({ ...s, [name]: undefined }));
    }
  };

  const labelFor = (name) => {
    const map = {
      address: "your current address",
      addressLga: "your address LGA",
      addressState: "your address state",
      permanentAddress: "your permanent address",
      mobile: "your WhatsApp mobile number",
      imageFile: "a profile picture",
      imageData: "a profile picture",
      nextOfKinName: "your next of kin's name",
      nextOfKinPhone: "your next of kin's phone",
      nextOfKinRelation: "your relationship to next of kin",
      nextOfKinAddress: "your next of kin's address",
    };
    return map[name] || name;
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    const val = value && String(value).trim();
    // For file/image, check form.imageData
    if (name === "imageFile") {
      if (!form.imageData) {
        setFieldErrors((s) => ({ ...s, imageData: "Required" }));
        try {
          if (modal && typeof modal.alert === "function") {
            await modal.alert({
              title: "Missing field",
              message: `Please upload ${labelFor(name)}.`,
            });
          }
        } catch (err) {
          console.warn("Modal alert failed:", err);
        }
      }
      return;
    }

    if (!val) {
      setFieldErrors((s) => ({ ...s, [name]: "Required" }));
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing field",
            message: `Please enter ${labelFor(name)}.`,
          });
        }
      } catch (err) {
        console.warn("Modal alert failed:", err);
      }
    }
  };

  const handleConsentChange = (e) => {
    setConsentChecked(Boolean(e.target.checked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate required fields
    const required = [
      { key: "address", label: "Current address" },
      { key: "addressLga", label: "Address LGA" },
      { key: "addressState", label: "Address State" },
      { key: "permanentAddress", label: "Permanent address" },
      { key: "mobile", label: "WhatsApp mobile" },
      { key: "imageData", label: "Upload a picture of you" },
    ];

    const missing = required
      .filter((r) => !(form[r.key] && String(form[r.key]).trim()))
      .map((r) => r.label);
    if (!consentChecked) missing.unshift("Consent to Terms & Conditions");

    if (missing.length > 0) {
      const errs = {};
      required.forEach((r) => {
        if (missing.includes(r.label)) errs[r.key] = "Required";
      });
      if (!consentChecked) errs.consent = "Required";
      setFieldErrors(errs);
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing fields",
            message: `Please complete the following fields:\n\n- ${missing.join(
              "\n- "
            )}`,
          });
        }
      } catch (e) {
        console.warn("Modal alert failed:", e);
      }
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      const payloadState = {
        provided: {
          address: form.address,
          addressLga: form.addressLga,
          addressState: form.addressState,
          permanentAddress: form.permanentAddress,
          mobile: form.mobile,
          imageData: form.imageData || null,
          // next-of-kin will be collected on the next page
        },
        from: location.state?.from || null,
      };
      // go to the next registration step (next-of-kin)
      navigate("/registeruser/next-of-kin", { state: payloadState });
    } catch (err) {
      console.error("Failed to proceed to verification:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Prevent render flicker while checking login
  if (checkingLogin) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-indigo-700">
        Checking login...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl w-full max-w-3xl p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white  ">
            Your Profile Details
          </h2>
          <p className="">Welcome to Morelinks</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Residential Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              className={`p-3 rounded-xl w-full ${
                fieldErrors.address ? "border-red-600 ring-1 ring-red-500" : ""
              }`}
              required
              aria-invalid={fieldErrors.address ? "true" : "false"}
              placeholder="The address of the place you currently live"
            />
            {fieldErrors.address ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.address}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <StateLgaSelect
              stateValue={form.addressState}
              lgaValue={form.addressLga}
              onChange={handleChange}
              onBlur={handleBlur}
              errorState={fieldErrors.addressState}
              errorLga={fieldErrors.addressLga}
            />
            {fieldErrors.addressState ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.addressState}
              </div>
            ) : null}
            {fieldErrors.addressLga ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.addressLga}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Permanent Address
            </label>
            <p className=" italic text-white/70">
              This can be your village address or a place owned by you or your
              parents
            </p>
            <textarea
              name="permanentAddress"
              value={form.permanentAddress}
              placeholder="Enter full address"
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              className={`p-3 rounded-xl w-full ${
                fieldErrors.permanentAddress
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
              aria-invalid={fieldErrors.permanentAddress ? "true" : "false"}
            />
            {fieldErrors.permanentAddress ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.permanentAddress}
              </div>
            ) : null}
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              WhatsApp Mobile
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.mobile ? "border-red-500 ring-1 ring-red-400" : ""
              }`}
              placeholder="e.g. 08012345678"
              required
              aria-invalid={fieldErrors.mobile ? "true" : "false"}
            />
            {fieldErrors.mobile ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.mobile}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Upload a picture of you
            </label>
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleChange}
              onBlur={handleBlur}
              className={`p-2 rounded-xl w-full ${
                fieldErrors.imageData
                  ? "border-red-500 ring-1 ring-red-400"
                  : ""
              }`}
              required
              aria-invalid={fieldErrors.imageData ? "true" : "false"}
            />
            {fieldErrors.imageData ? (
              <div className="text-xs text-red-500 mt-1">
                {fieldErrors.imageData}
              </div>
            ) : null}
            {form.imageData ? (
              <img
                src={form.imageData}
                alt="preview"
                className="mt-3 w-32 h-32 object-cover rounded"
              />
            ) : null}
          </div>

          <div className="col-span-2">
            <div className="flex items-start space-x-3 mt-4">
              <input
                id="consent"
                type="checkbox"
                checked={consentChecked}
                onChange={handleConsentChange}
                className={`w-4 h-4 mt-1 ${
                  fieldErrors.consent ? "ring-1 ring-red-400" : ""
                }`}
                aria-invalid={fieldErrors.consent ? "true" : "false"}
              />
              <label htmlFor="consent" className="text-white text-sm">
                I agree to the{" "}
                <a href="/terms" className="underline">
                  Terms &amp; Conditions
                </a>{" "}
                and consent to the processing of my personal data for the
                purposes of registration and verification.
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting || !consentChecked}
              className={`w-full py-3 mt-4 font-semibold rounded-xl text-white ${
                submitting || !consentChecked
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-400 to-purple-600"
              }`}
            >
              {submitting ? "Proceeding..." : "Continue"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
