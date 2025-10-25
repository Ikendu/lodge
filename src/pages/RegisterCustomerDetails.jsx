import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified?.data || {};
  const provided = location.state?.provided || {};
  const from = location.state?.from;
  const [imageFile, setImageFile] = useState(null);

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
    country: "",
    mobile: "",
    imageFile: null,
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((p) => ({ ...p, [name]: files[0] }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  // Compress image file down to maxSizeBytes (approximately) using canvas
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

    let [w, h] = [img.naturalWidth, img.naturalHeight];
    // start by scaling proportionally based on size ratio
    const ratio = Math.sqrt(maxSizeBytes / file.size);
    if (ratio < 1) {
      w = Math.max(200, Math.floor(w * ratio));
      h = Math.max(200, Math.floor(h * ratio));
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const toBlob = (quality) =>
      new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));

    let quality = 0.92;
    let blob = await toBlob(quality);

    // reduce quality iteratively
    while (blob && blob.size > maxSizeBytes && quality > 0.45) {
      quality -= 0.1;
      blob = await toBlob(quality);
    }

    // if still too large, downscale and try again
    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && attempts < 6) {
      attempts += 1;
      w = Math.max(200, Math.floor(w * 0.85));
      h = Math.max(200, Math.floor(h * 0.85));
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      quality = Math.max(0.5, quality - 0.1);
      blob = await toBlob(quality);
    }

    if (!blob) return file;

    // return a File so it can be appended with a filename
    return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
      type: "image/jpeg",
    });
  };

  console.log("Verified data:", verified);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      // include verified fields
      payload.append("userUid", userLogin?.uid || "");
      payload.append("userLoginMail", userLogin?.email || "");
      payload.append("firstName", verified.first_name || "");
      payload.append("middleName", verified.middle_name || "");
      payload.append("lastName", verified.last_name || "");
      payload.append("nin", verified.id);
      payload.append("dob", dob);

      // include phone: prefer verified, then provided, then form
      payload.append("phone", verified.phone_number);
      payload.append("mobile", form.mobile);
      // include verified-only fields
      payload.append("birth_country", verified.birth_country || "");
      payload.append("birth_lga", verified.birth_lga || "");
      payload.append("birth_state", verified.birth_state || "");
      payload.append("gender", verified.gender || "");
      payload.append("verified_image", verified.image);
      payload.append("verified_signature", verified.signature);
      payload.append("nin_email", verified.email);

      // include details from step 2
      payload.append("address", form.address);
      payload.append("addressLga", form.addressLga);
      payload.append("addressState", form.addressState);
      payload.append("permanentAddress", form.permanentAddress);
      payload.append("email", form.email);
      payload.append("mobile", form.mobile);
      payload.append("lga", form.lga);
      payload.append("state", form.state);
      payload.append("country", form.country);
      payload.append("nextOfKinName", form.nextOfKinName);
      payload.append("nextOfKinPhone", form.nextOfKinPhone);
      payload.append("nextOfKinAddress", form.nextOfKinAddress);
      // If the user uploaded an image, compress it if >1MB before appending
      if (form.imageFile) {
        let fileToSend = form.imageFile;
        try {
          if (fileToSend.size > 1024 * 1024) {
            fileToSend = await compressImageFile(fileToSend, 1024 * 1024);
          }
        } catch (err) {
          console.warn("Image compression failed, sending original file", err);
        }
        payload.append("image", fileToSend, fileToSend.name || "image.jpg");
        setImageFile(fileToSend);
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

      const profile = {
        userUid: userLogin?.uid || "",
        userLoginMail: userLogin?.email || "",
        firstName: verified.first_name || "",
        middleName: verified.middle_name || "",
        lastName: verified.last_name || "",
        nin: verified.id,
        nin_address: verified.address || "",
        birth_country: verified.birth_country || "",
        birth_state: verified.birth_state || "",
        birth_lga: verified.birth_lga || "",
        nin_email: verified.email || "",
        nin_image: verified.image || "",
        nin_phone: verified.phone_number || "",
        gender: verified.gender || "",
        dob: dob,

        mobile: form.mobile,
        address: form.address,
        addressLga: form.addressLga,
        addressState: form.addressState,
        image: imageFile || "",
        permanentAddress: form.permanentAddress,
        lga: form.lga,
        state: form.state,
        country: form.country,
        nextOfKinName: form.nextOfKinName,
        nextOfKinPhone: form.nextOfKinPhone,
        nextOfKinAddress: form.nextOfKinAddress,
      };
      try {
        localStorage.setItem("customerProfile", JSON.stringify(profile));
      } catch (e) {
        console.warn("Failed to persist profile locally", e);
      }

      // Navigate to profile page and pass profile + origin
      navigate("/profile", { state: { profile, from } });
    } catch (err) {
      console.error(err);
      alert("Registration request failed");
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
          <span className="text-xl">
            {verified.first_name} {verified.middle_name} {verified.last_name}
          </span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Date of Birth</label>
            <input
              name="dob"
              value={form.dob}
              onChange={handleChange}
              type="date"
              className="p-3 rounded-xl"
              required
            />
          </div> */}

          <div className="col-span-1 md:col-span-2 flex flex-col">
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

          {/* Address LGA and Address State below Current Address */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Address LGA</label>
            <input
              name="addressLga"
              value={form.addressLga}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. Suleja"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Address State</label>
            <input
              name="addressState"
              value={form.addressState}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. Niger"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col">
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
              placeholder="Nigeria"
              required
            />
          </div>

          {/* Keep a phone field and image upload on the form as requested */}
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              WhatsApp Mobile Number
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. 08012345678"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Image</label>
            <input
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="p-2 rounded-xl"
            />
          </div>
          <div></div>

          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Fullname
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. 08012345678"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Mobile Number
            </label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="p-3 rounded-xl"
              placeholder="e.g. 08012345678"
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col">
            <label className="text-white mb-2 font-medium">
              Next of Kin Address
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

          {/* <div className="flex flex-col">
            <label className="text-white mb-2 font-medium">Passport</label>
            <input
              name="passport"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="p-2 rounded-xl"
              required
            />
          </div> */}

          <div className="col-span-1 md:col-span-2">
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
