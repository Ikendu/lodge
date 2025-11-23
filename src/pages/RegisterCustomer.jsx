// src/pages/RegisterCustomer.jsx
import { useEffect, useState } from "react";
import { useModalContext } from "../components/ui/ModalProvider";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  // This page now receives 'provided' (details collected on previous step)
  // via location.state.provided. It is responsible for NIN verification and
  // the final registration submit which sends the combined payload.
  const provided = location.state?.provided || {};

  const [form, setForm] = useState({
    nin: "",
    phone: provided.mobile || "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  const modal = useModalContext();
  const [fieldErrors, setFieldErrors] = useState({});

  const [verified, setVerified] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // also accept Firebase auth presence as a valid login
  const [firebaseUser, loadingAuth] = useAuthState(auth);

  // ✅ Wait for localStorage before deciding redirect
  useEffect(() => {
    // If a completed customerProfile exists, don't allow access to the verify/register flow
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) {
        // customerProfile exists — redirecting to /profile
        navigate("/profile", { replace: true });
        return;
      }
    } catch (e) {
      // ignore
    }
    // Allow access to this page if either we have a local storage flag
    // or Firebase reports a signed-in user. Otherwise redirect to login.
    const userData = localStorage.getItem("userLogin");

    // While Firebase auth is initializing, wait to avoid flicker
    if (loadingAuth) return;

    if (!userData && !firebaseUser) {
      navigate("/login");
    } else {
      // user present — allow register page
    }
    setCheckingLogin(false);
  }, [navigate, firebaseUser, loadingAuth]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // clear field error on change
  const handleChangeWithClear = (e) => {
    setFieldErrors((s) => ({ ...s, [e.target.name]: undefined }));
    handleChange(e);
  };

  const verifyNin = async () => {
    if (!form.nin) {
      setFieldErrors({ nin: "Required" });
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing NIN",
            message: "Please enter your NIN number before verification.",
          });
        }
      } catch (e) {
        console.warn("Modal alert failed:", e);
      }
      return;
    }
    // If already verified, avoid calling the endpoint again
    if (verified) {
      toast.success("NIN already verified");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("nin", form.nin);
      payload.append("phone", form.phone || "");

      const endpoints = [
        "https://lodge.morelinks.com.ng/api/verify_nin.php",
        "http://localhost/lodge/api/verify_nin.php",
      ];

      let data = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "POST", body: payload });
          const text = await res.text();
          try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object") {
              data = parsed;
              break;
            }
          } catch (err) {
            // ignore invalid json from this endpoint
          }
        } catch (err) {
          // try next
        }
      }

      if (!data) {
        toast.error("Verification failed — no response from server");
        try {
          if (modal && typeof modal.alert === "function") {
            await modal.alert({
              title: "Verification failed",
              message: "No response from verification server. Try again later.",
            });
          }
        } catch (e) {
          console.warn("Modal alert failed:", e);
        }
        return;
      }
      if (!data.success) {
        toast.error(data.message || "NIN verification failed");
        try {
          if (modal && typeof modal.alert === "function") {
            await modal.alert({
              title: "Verification failed",
              message: data.message || "NIN verification failed",
            });
          }
        } catch (e) {
          console.warn("Modal alert failed:", e);
        }
        return;
      }

      setVerified(data.data || {});
      if (data?.data && modal && typeof modal.alert === "function") {
        await modal.alert({
          title: "Verification Successful",
          message: "NIN verified successfully — you can now proceed to submit",
        });
      }
      toast.success(
        "NIN verified successfully — you can now proceed to submit"
      );
    } catch (err) {
      console.error(err);
      toast.error("Verification error");
    } finally {
      setLoading(false);
    }
  };

  // Utility: convert data URL or raw base64 (e.g. starts with '/9j') into a File
  const toFileFromData = async (input, filenamePrefix = "file") => {
    if (!input || typeof input !== "string") return null;

    // Data URL (has mime)
    if (input.startsWith("data:")) {
      try {
        const r = await fetch(input);
        const b = await r.blob();
        return new File([b], `${filenamePrefix}.jpg`, {
          type: b.type || "image/jpeg",
        });
      } catch (e) {
        console.warn("toFileFromData failed to fetch data URL", e);
        return null;
      }
    }

    // Raw base64 (jpeg often begins with '/9j') or a pure base64 string
    const trimmed = input.replace(/\s+/g, "");
    const looksLikeBase64 =
      trimmed.startsWith("/9j") || /^[A-Za-z0-9+/=]+$/.test(trimmed);
    if (looksLikeBase64) {
      try {
        // atob on the base64 payload
        const binary = atob(trimmed);
        const len = binary.length;
        const u8 = new Uint8Array(len);
        for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
        const blob = new Blob([u8], { type: "image/jpeg" });
        return new File([blob], `${filenamePrefix}.jpg`, {
          type: "image/jpeg",
        });
      } catch (e) {
        console.warn("toFileFromData failed to decode base64", e);
        return null;
      }
    }

    // Not a data URL or base64 — return null so caller can decide to append raw string
    return null;
  };

  // Final submit: combine provided + verified and send to register endpoint
  const submitRegistration = async () => {
    if (!verified) {
      setFieldErrors((s) => ({ ...s, nin: "Verify NIN first" }));
      try {
        if (modal && typeof modal.alert === "function") {
          await modal.alert({
            title: "Missing verification",
            message: "Please verify your NIN before submitting registration.",
          });
        }
      } catch (e) {
        console.warn("Modal alert failed:", e);
      }
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();

      // lightweight userLogin info
      const userLogin = JSON.parse(localStorage.getItem("userLogin") || "null");
      payload.append("userUid", userLogin?.uid || "");
      payload.append("userLoginMail", userLogin?.email || "");

      // merge verified fields
      payload.append("firstName", verified.entity?.first_name || "");
      payload.append("middleName", verified.entity?.middle_name || "");
      payload.append("lastName", verified.entity?.last_name || "");
      payload.append("nin", verified.id || form.nin || "");
      payload.append(
        "nin_address",
        `${verified.entity?.residence_address_line_1 || ""} ${
          verified.entity?.residence_town || ""
        } ${verified.entity?.residence_lga || ""} ${
          verified.entity?.residence_state || ""
        }`
      );
      payload.append("birth_country", verified.entity?.birth_country || "");
      payload.append("birth_state", verified.entity?.birth_state || "");
      payload.append("birth_lga", verified.entity?.birth_lga || "");

      payload.append("nin_email", verified.entity?.email || "");
      payload.append("religion", verified.entity?.religion || "");

      payload.append("lga", verified.entity?.origin_lga || "");
      payload.append("state", verified.entity?.origin_state || "");
      payload.append("place", verified.entity?.origin_place || "");

      payload.append("phone", verified.entity?.phone_number || "");
      payload.append("mobile", provided.mobile || "");
      payload.append("gender", verified.entity?.gender || "");
      payload.append("dob", verified.entity?.date_of_birth || "");

      // provided details
      payload.append("address", provided.address || "");
      payload.append("addressLga", provided.addressLga || "");
      payload.append("addressState", provided.addressState || "");
      payload.append("permanentAddress", provided.permanentAddress || "");
      payload.append("nextOfKinName", provided.nextOfKinName || "");
      payload.append("nextOfKinPhone", provided.nextOfKinPhone || "");
      payload.append("nextOfKinRelation", provided.nextOfKinRelation || "");
      payload.append("nextOfKinAddress", provided.nextOfKinAddress || "");

      // attach provided imageData (data URL) as file if present
      if (provided.imageData) {
        try {
          const res = await fetch(provided.imageData);
          const blob = await res.blob();
          const file = new File([blob], `given_image.jpg`, {
            type: blob.type || "image/jpeg",
          });
          payload.append("image", file, file.name);
        } catch (e) {
          console.warn("Failed to attach provided image data", e);
        }
      }

      // attach verified photo/signature: support data URLs, raw base64 (starts with '/9j'), or fall back to string
      if (verified.entity?.photo && typeof verified.entity.photo === "string") {
        const file = await toFileFromData(verified.entity.photo, "verified");
        if (file) payload.append("verified_image", file, file.name);
        else payload.append("verified_image", verified.entity.photo);
      }
      if (
        verified.entity?.signature &&
        typeof verified.entity.signature === "string"
      ) {
        const file = await toFileFromData(
          verified.entity.signature,
          "signature"
        );
        if (file) payload.append("verified_signature", file, file.name);
        else payload.append("verified_signature", verified.entity.signature);
      }

      const endpoints = [
        "https://lodge.morelinks.com.ng/api/register.php",
        "http://localhost/lodge/api/register.php",
      ];

      let data = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "POST", body: payload });
          const text = await res.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = null;
          }
          if (data) break;
        } catch (e) {
          console.warn("register request failed", e);
        }
      }

      if (!data) {
        toast.error("Registration failed — no server response");
        setSubmitting(false);
        return;
      }
      if (!data.success) {
        toast.error(data.message || "Registration failed");
        setSubmitting(false);
        return;
      }

      const profile = data.data || {};
      try {
        localStorage.setItem("customerProfile", JSON.stringify(profile));
      } catch (e) {
        /* ignore */
      }
      toast.success("Registration complete");

      // navigate back to origin if provided
      const rawReturn = location.state?.from || "/";
      if (typeof rawReturn === "string") navigate(rawReturn, { replace: true });
      else if (rawReturn && typeof rawReturn === "object") {
        const path = `${rawReturn.pathname || "/"}${rawReturn.search || ""}${
          rawReturn.hash || ""
        }`;
        navigate(path, { replace: true, state: rawReturn.state });
      } else navigate("/profile", { replace: true });
    } catch (err) {
      console.error("submitRegistration error", err);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // old handleSubmit removed — we now use verifyNin() and submitRegistration()

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
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Verify NIN
        </h2>
        <p className="text-white text-center italic pb-5">
          first verify your NIN, after wish you can submit your registration
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">NIN Number</label>
            <input
              name="nin"
              value={form.nin}
              onChange={(e) => {
                setFieldErrors((s) => ({ ...s, nin: undefined }));
                handleChange(e);
              }}
              onBlur={async (e) => {
                const v = e.target.value && String(e.target.value).trim();
                if (!v) {
                  setFieldErrors((s) => ({ ...s, nin: "Required" }));
                  try {
                    if (modal && typeof modal.alert === "function") {
                      await modal.alert({
                        title: "Missing NIN or Network failure",
                        message:
                          "Please enter your NIN number or check your Network.",
                      });
                    }
                  } catch (err) {
                    console.warn("Modal alert failed:", err);
                  }
                }
              }}
              maxLength={20}
              className={`p-3 rounded-xl w-full ${
                fieldErrors.nin ? "border-red-500 ring-1 ring-red-400" : ""
              }`}
              required
              aria-invalid={fieldErrors.nin ? "true" : "false"}
            />
            {fieldErrors.nin ? (
              <div className="text-xs text-red-500 mt-1">{fieldErrors.nin}</div>
            ) : null}
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <button
              type="button"
              onClick={verifyNin}
              disabled={loading || !!verified}
              aria-disabled={loading || !!verified}
              className={`w-full py-3 rounded-xl font-semibold text-white ${
                loading || verified ? "bg-slate-400" : "bg-blue-500"
              }`}
            >
              {loading
                ? "Verifying..."
                : verified
                ? "Verified ✓"
                : "Verify NIN first"}
            </button>

            <button
              type="button"
              onClick={submitRegistration}
              disabled={!verified || submitting}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
            {verified ? (
              <div className="text-sm text-white/90 mt-2 p-3 bg-white/10 rounded">
                Verified:{" "}
                <strong>
                  {verified.entity?.first_name} {verified.entity?.middle_name}{" "}
                  {verified.entity?.last_name}
                </strong>
              </div>
            ) : null}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
