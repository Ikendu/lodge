import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified?.data || {};
  const provided = location.state?.provided || {};
  const from = location.state?.from;

  const userLogin = JSON.parse(localStorage.getItem("userLogin"));
  console.log("User Login Data:", userLogin);

  const [form, setForm] = useState({
    email: "",
    dob: verified.date_of_birth || "",
    address: "",
    addressLga: "",
    addressState: "",
    permanentAddress: "",
    lga: "",
    state: "",
    country: "Nigeria",
    mobile: "",
    imageFile: null,
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelation: "",
    nextOfKinAddress: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((prev) => ({ ...prev, [name]: files[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
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
      payload.append("firstName", verified.first_name || "");
      payload.append("middleName", verified.middle_name || "");
      payload.append("lastName", verified.last_name || "");
      payload.append("nin", verified.id || "");
      payload.append(
        "nin_address",
        `${verified.address?.street || ""} ${verified.address?.town || ""} ${
          verified.address?.lga || ""
        } ${verified.address?.state || ""}`
      );
      payload.append("dob", form.dob);
      payload.append("phone", verified.phone_number || provided.phone || "");
      payload.append("mobile", form.mobile || "");
      payload.append("birth_country", verified.birth_country || "");
      payload.append("birth_lga", verified.birth_lga || "");
      payload.append("birth_state", verified.birth_state || "");
      payload.append("gender", verified.gender || "");
      payload.append("verified_signature", verified.signature || "");
      payload.append("nin_email", verified.email || "");
      payload.append("address", form.address);
      payload.append("addressLga", form.addressLga);
      payload.append("addressState", form.addressState);
      payload.append("permanentAddress", form.permanentAddress);
      payload.append("email", form.email);
      payload.append("lga", form.lga);
      payload.append("state", form.state);
      payload.append("country", form.country);
      payload.append("nextOfKinName", form.nextOfKinName);
      payload.append("nextOfKinPhone", form.nextOfKinPhone);
      payload.append("nextOfKinRelation", form.nextOfKinRelation);
      payload.append("nextOfKinAddress", form.nextOfKinAddress);

      // Attach verified_image as a file named {nin}_verified.jpg when possible
      const baseName =
        verified.id || verified.nin || verified?.nin_number || Date.now();
      if (
        verified.image &&
        typeof verified.image === "string" &&
        verified.image.startsWith("data:")
      ) {
        try {
          const dataUrl = verified.image;
          const arr = dataUrl.split(",");
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const vf = new File([u8arr], `${baseName}_verified.jpg`, {
            type: mime,
          });
          payload.append("verified_image", vf, vf.name);
        } catch (err) {
          console.warn("Failed to attach verified image as file", err);
        }
      }

      // Attach given/uploaded image as {nin}_given.<ext>
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
        payload.append("image", givenFile, givenFile.name);
      }

      const res = await fetch("http://localhost/lodge/register.php", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      console.log("Registration response:", data);

      if (!data.success) {
        alert(data.message || "Registration failed");
        setSubmitting(false);
        return;
      }

      // ✅ Get profile object from backend
      const profile = data.data || {};
      console.log("Registered Profile:", profile);

      // ✅ Store in localStorage
      localStorage.setItem("customerProfile", JSON.stringify(profile));

      alert(data.message || "Registration successful!");
      // navigate("/profile", { state: { profile, from } });
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Registration request failed.");
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
              className="p-3 rounded-xl"
              required
            />
          </div>

          {/* address lga */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Address LGA</label>
            <input
              name="addressLga"
              value={form.addressLga}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. Nsukka"
              required
            />
          </div>

          {/* address state */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Address State</label>
            <input
              name="addressState"
              value={form.addressState}
              onChange={handleChange}
              className="p-3 rounded-xl"
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
              className="p-3 rounded-xl"
              required
            />
          </div>

          {/* other fields */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">LGA of Origin</label>
            <input
              name="lga"
              value={form.lga}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              State of Origin
            </label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              WhatsApp Mobile
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="p-3 rounded-xl"
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
              className="p-2 rounded-xl"
              required
            />
          </div>

          <div></div>

          {/* Next of Kin */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Name
            </label>
            <input
              name="nextOfKinName"
              value={form.nextOfKinName}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Phone
            </label>
            <input
              name="nextOfKinPhone"
              value={form.nextOfKinPhone}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Relationship to Next of Kin
            </label>
            <input
              name="nextOfKinRelation"
              value={form.nextOfKinRelation}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Address
            </label>
            <input
              name="nextOfKinAddress"
              value={form.nextOfKinAddress}
              onChange={handleChange}
              className="p-3 rounded-xl"
              required
            />
          </div>

          <div className="col-span-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white font-semibold rounded-xl"
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
