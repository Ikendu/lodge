import { use, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useModalContext } from "../components/ui/ModalProvider";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const modal = useModalContext();

  const verified =
    location.state?.verified || location.state?.verified?.data || {};
  const moredata = location?.state || {};
  const provided = location.state?.provided || {};
  const from = location.state?.from;

  const userLogin = JSON.parse(localStorage.getItem("userLogin"));
  console.log("User Login Data:", userLogin);
  console.log("Verified Data:", verified);
  console.log("Provided Data:", moredata);

  useEffect(() => {
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) {
        console.log("Customer profile exists — redirecting to /profile");
        navigate("/profile", { replace: true });
        return;
      }
    } catch (e) {
      // ignore
    }
  }, [navigate]);

  const [form, setForm] = useState({
    dob: verified?.entity.date_of_birth || "",
    address: "",
    addressLga: "",
    addressState: "",
    permanentAddress: "",
    mobile: moredata?.phone || "",
    imageFile: null,
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelation: "",
    nextOfKinAddress: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // If the user already has a customerProfile saved, redirect away from this step
  // to avoid re-registering once profile is complete.
  useState(() => {
    try {
      const cp = localStorage.getItem("customerProfile");
      if (cp) {
        navigate("/profile", { replace: true });
      }
    } catch (e) {
      // ignore
    }
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((prev) => ({ ...prev, [name]: files[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsentChange = (e) => {
    setConsentChecked(Boolean(e.target.checked));
  };

  // Compress image before upload (optional)
  const compressImageFile = async (file, maxSizeBytes = 1024 * 1024) => {
    if (!file || !window?.document) return file;
    if (file.size <= maxSizeBytes) return file;

    const readDataURL = (f) =>
      new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(f);
      });

    const dataUrl = await readDataURL(file);
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const ratio = Math.sqrt(maxSizeBytes / file.size);
    canvas.width = img.naturalWidth * ratio;
    canvas.height = img.naturalHeight * ratio;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.8)
    );
    return new File([blob], "compressed.jpg", { type: "image/jpeg" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("userUid", userLogin?.uid || "");
      payload.append("userLoginMail", userLogin?.email || "");
      payload.append("firstName", verified?.entity.first_name || "");
      payload.append("middleName", verified?.entity.middle_name || "");
      payload.append("lastName", verified?.entity.last_name || "");
      payload.append("nin", verified?.id || moredata?.nin || "");
      payload.append(
        "nin_address",
        `${verified?.entity?.residence_address_line_1 || ""} ${
          verified?.entity?.residence_town || ""
        } ${verified?.entity?.residence_lga || ""} ${
          verified?.entity?.residence_state || ""
        }`
      );
      payload.append("dob", form.dob);
      payload.append(
        "phone",
        verified?.entity.phone_number || provided.phone || ""
      );
      payload.append("mobile", form.mobile || "");
      payload.append("country", verified?.entity.birth_country || "");
      payload.append("birth_lga", verified?.entity.birth_lga || "");
      payload.append("birth_state", verified?.entity.birth_state || "");
      payload.append("gender", verified?.entity.gender || "");
      payload.append("nin_email", verified?.entity.email || "");
      payload.append("state", verified?.entity.origin_state);
      payload.append("lga", verified?.entity.origin_lga);
      payload.append("place", verified?.entity.origin_place);
      payload.append("religion", verified?.entity.religion);

      payload.append("address", form.address);
      payload.append("addressLga", form.addressLga);
      payload.append("addressState", form.addressState);
      payload.append("permanentAddress", form.permanentAddress);
      payload.append("email", form.email);
      payload.append("nextOfKinName", form.nextOfKinName);
      payload.append("nextOfKinPhone", form.nextOfKinPhone);
      payload.append("nextOfKinRelation", form.nextOfKinRelation);
      payload.append("nextOfKinAddress", form.nextOfKinAddress);

      // Upload verified_image to production first (so images live on production).
      // If upload fails, fall back to attaching the file so local register can save it.
      const baseName = verified?.id || moredata?.nin || verified?.nin_number;
      let prodVerifiedFilename = null;
      if (
        verified?.entity.photo &&
        typeof verified?.entity.photo === "string"
      ) {
        try {
          const imgStr = verified?.entity.photo;
          let base64 = null;
          let mime = "image/jpeg";

          if (imgStr.startsWith("data:")) {
            const parts = imgStr.split(",");
            mime = (parts[0].match(/:(.*?);/) || [null, mime])[1] || mime;
            base64 = parts[1] || "";
          } else if (
            imgStr.startsWith("/9j") ||
            /^[A-Za-z0-9+/=\r\n]+$/.test(imgStr)
          ) {
            base64 = imgStr.replace(/\s+/g, "");
            mime = "image/jpeg";
          }

          if (base64) {
            const bstr = atob(base64);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const vf = new File([u8arr], `${baseName}_verified.jpg`, {
              type: mime,
            });

            // try uploading to production
            try {
              const up = new FormData();
              up.append("file", vf, vf.name);
              up.append("name", `${baseName}_verified`);
              const r = await fetch(
                "https://lodge.morelinks.com.ng/api/upload_image.php",
                {
                  method: "POST",
                  body: up,
                }
              );
              const text = await r.text();
              let jr = null;
              try {
                jr = JSON.parse(text);
              } catch (e) {
                console.warn(
                  "Invalid JSON from upload_image (verified):",
                  text
                );
                jr = null;
              }
              if (jr && jr.success && jr.filename) {
                prodVerifiedFilename = jr.filename;
                payload.append("verified_image", prodVerifiedFilename);
              } else {
                // fallback to attaching file for local save
                payload.append("verified_image", vf, vf.name);
              }
            } catch (err) {
              console.warn(
                "Production verified image upload failed, will attach locally",
                err
              );
              payload.append("verified_image", vf, vf.name);
            }
          } else {
            // Not recognizable as base64/data-url; treat as filename/URL and pass through
            payload.append("verified_image", imgStr);
          }
        } catch (err) {
          console.warn("Failed to attach verified image as file", err);
        }
      }

      // Handle verified signature (may be a data URL, raw base64 that starts with '/9j',
      // or already a URL/filename). Convert base64 to File and try uploading to production.
      if (
        verified?.entity.signature &&
        typeof verified?.entity.signature === "string"
      ) {
        try {
          const sigStr = verified.signature;
          let isDataUrl = sigStr.startsWith("data:");
          let base64String = null;
          let mime = "image/jpeg";

          if (isDataUrl) {
            const parts = sigStr.split(",");
            mime = (parts[0].match(/:(.*?);/) || [null, mime])[1] || mime;
            base64String = parts[1] || "";
          } else if (
            sigStr.startsWith("/9j") ||
            /^[A-Za-z0-9+/=\r\n]+$/.test(sigStr)
          ) {
            // raw base64 (jpeg usually starts with /9j)
            base64String = sigStr.replace(/\s+/g, "");
            mime = "image/jpeg";
          }

          if (base64String) {
            // convert base64 to File
            const bstr = atob(base64String);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const sigFile = new File([u8arr], `${baseName}_signature.jpg`, {
              type: mime,
            });

            // Try uploading to production
            try {
              const upSig = new FormData();
              upSig.append("file", sigFile, sigFile.name);
              upSig.append("name", `${baseName}_signature`);
              const rSig = await fetch(
                "https://lodge.morelinks.com.ng/api/upload_image.php",
                { method: "POST", body: upSig }
              );
              const textSig = await rSig.text();
              let jrSig = null;
              try {
                jrSig = JSON.parse(textSig);
              } catch (e) {
                console.warn(
                  "Invalid JSON from upload_image (signature):",
                  textSig
                );
                jrSig = null;
              }

              if (jrSig && jrSig.success && jrSig.filename) {
                payload.append("verified_signature", jrSig.filename);
              } else {
                // fallback: append file so local register can save
                payload.append("verified_signature", sigFile, sigFile.name);
              }
            } catch (err) {
              console.warn(
                "Production signature upload failed, will attach locally",
                err
              );
              payload.append("verified_signature", sigFile, sigFile.name);
            }
          } else {
            // Not base64/data URL — treat as already a filename or URL and send as-is
            payload.append("verified_signature", sigStr);
          }
        } catch (err) {
          console.warn("Failed to process verified signature", err);
        }
      }

      // Attach given/uploaded image as {nin}_given.<ext> - upload to production first
      if (form.imageFile) {
        let fileToSend = form.imageFile;
        try {
          if (fileToSend.size > 1024 * 1024) {
            fileToSend = await compressImageFile(fileToSend);
          }
        } catch (err) {
          console.warn("Image compression failed, sending original", err);
        }

        // derive extension
        const origName = fileToSend.name || "image.jpg";
        const extMatch = origName.match(/\.([0-9a-zA-Z]+)$/);
        const ext = extMatch ? extMatch[1] : "jpg";
        const givenFile = new File([fileToSend], `${baseName}_given.${ext}`, {
          type: fileToSend.type || "image/jpeg",
        });

        let prodGivenFilename = null;
        try {
          const up = new FormData();
          up.append("file", givenFile, givenFile.name);
          up.append("name", `${baseName}_given`);
          const r = await fetch(
            "https://lodge.morelinks.com.ng/api/upload_image.php",
            {
              method: "POST",
              body: up,
            }
          );
          const text = await r.text();
          let jr = null;
          try {
            jr = JSON.parse(text);
          } catch (e) {
            console.warn("Invalid JSON from upload_image (given):", text);
            jr = null;
          }
          if (jr && jr.success && jr.filename) {
            prodGivenFilename = jr.filename;
            payload.append("image", prodGivenFilename);
          } else {
            payload.append("image", givenFile, givenFile.name);
          }
        } catch (err) {
          console.warn(
            "Production given image upload failed, will attach locally",
            err
          );
          payload.append("image", givenFile, givenFile.name);
        }
      }

      // Debug: dump FormData entries so we can confirm what is being sent
      try {
        console.group("Registration FormData");
        for (const [k, v] of payload.entries()) {
          if (
            v &&
            typeof v === "object" &&
            v.constructor &&
            v.constructor.name === "File"
          ) {
            console.log(k, "(File)", v.name, v.type, v.size);
          } else {
            console.log(k, v);
          }
        }
        console.groupEnd();
      } catch (e) {
        console.warn("Could not dump FormData:", e);
      }

      // Try production first, then fall back to localhost
      const endpoints = [
        "https://lodge.morelinks.com.ng/api/register.php",
        "http://localhost/lodge/api/register.php",
      ];

      let data = null;
      let lastError = null;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: "POST", body: payload });
          const text = await res.text();
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn(`Invalid JSON from ${url}:`, text);
            data = null;
          }
          if (data) {
            console.log(`Registration response from ${url}:`, data);
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Request to ${url} failed:`, err);
        }
      }

      if (!data) {
        console.error("Registration failed, no valid response:", lastError);
        await modal.alert({
          title: "Registration failed",
          message: "Registration request failed. Please try again later.",
        });
        setSubmitting(false);
        return;
      }

      if (!data.success) {
        await modal.alert({
          title: "Registration failed",
          message: data.message || "Registration failed",
        });
        setSubmitting(false);
        return;
      }

      // ✅ Get profile object from backend
      const profile = data.data || {};
      console.log("Registered Profile:", profile);

      // ✅ Store in localStorage
      localStorage.setItem("customerProfile", JSON.stringify(profile));

      await modal.alert({
        title: "Registration",
        message: data.message || "Registration successful!",
      });
      // Redirect back to the page the user came from (if provided). This handles
      // the flow where the user was directed to login/register from a protected page
      // (for example a lodge details page) so they return there to continue booking.
      try {
        const returnTo = from || (location.state && location.state.from) || "/";
        navigate(returnTo, { replace: true });
        return;
      } catch (e) {
        // fallback to profile
        navigate("/profile", { replace: true });
      }
    } catch (err) {
      console.error("Error during registration:", err);
      await modal.alert({
        title: "Error",
        message: "Registration request failed.",
      });
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
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Additional Details
        </h2>
        <p className="text-white text-center mb-4">
          Pending Verification:{" "}
          <span className="text-xl font-semibold">
            {verified.first_name} {verified.middle_name} {verified.last_name}
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* address section */}
          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Current Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          {/* address lga */}
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">Address LGA</label>
            <input
              name="addressLga"
              value={form.addressLga}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              placeholder="e.g. Nsukka"
              required
            />
          </div>

          {/* address state */}
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">Address State</label>
            <input
              name="addressState"
              value={form.addressState}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              placeholder="e.g. Enugu"
              required
            />
          </div>

          {/* permanent address */}
          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Permanent Address
            </label>
            <textarea
              name="permanentAddress"
              value={form.permanentAddress}
              onChange={handleChange}
              rows="2"
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              WhatsApp Mobile
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              placeholder="e.g. 08012345678"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Upload Image</label>
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="p-2 rounded-xl w-full"
              required
            />
          </div>

          <div></div>

          {/* Next of Kin */}
          <div className="col-span-2 flex flex-col">
            <h4 className="text-xl font-bold">Next of Kin Details</h4>
            <p className=" italic text-white/70">
              For security purpose your next-of-kin should not be the same
              person traveling/lodging with you. You can alwyays update this
              information later in your profile.
            </p>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Name
            </label>
            <input
              name="nextOfKinName"
              value={form.nextOfKinName}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Phone
            </label>
            <input
              name="nextOfKinPhone"
              value={form.nextOfKinPhone}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Relationship to Next of Kin
            </label>
            <input
              name="nextOfKinRelation"
              value={form.nextOfKinRelation}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Address
            </label>
            <input
              name="nextOfKinAddress"
              value={form.nextOfKinAddress}
              onChange={handleChange}
              className="p-3 rounded-xl w-full"
              required
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-start space-x-3 mt-4">
              <input
                id="consent"
                type="checkbox"
                checked={consentChecked}
                onChange={handleConsentChange}
                className="w-4 h-4 mt-1"
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
              {submitting ? "Submitting..." : "Complete Registration"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
