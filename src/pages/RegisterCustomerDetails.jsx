import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterCustomerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [navigate]);

  const [form, setForm] = useState({
    dob: provided.dob || "",
    address: provided.address || "",
    addressLga: provided.addressLga || "",
    addressState: provided.addressState || "",
    permanentAddress: provided.permanentAddress || "",
    mobile: provided.mobile || "",
    imageFile: null,
    imageData: provided.imageData || null, // data URL for safe transfer
    nextOfKinName: provided.nextOfKinName || "",
    nextOfKinPhone: provided.nextOfKinPhone || "",
    nextOfKinRelation: provided.nextOfKinRelation || "",
    nextOfKinAddress: provided.nextOfKinAddress || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const f = files[0];
      setForm((prev) => ({ ...prev, [name]: f, imageFile: f }));
      const fr = new FileReader();
      fr.onload = () => setForm((prev) => ({ ...prev, imageData: fr.result }));
      fr.readAsDataURL(f);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConsentChange = (e) => {
    setConsentChecked(Boolean(e.target.checked));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
        from: location.state?.from || null,
      };
      navigate("/registeruser/details", { state: payloadState });
    } catch (err) {
      console.error("Failed to proceed to verification:", err);
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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
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
            {form.imageData ? (
              <img
                src={form.imageData}
                alt="preview"
                className="mt-3 w-32 h-32 object-cover rounded"
              />
            ) : null}
          </div>

          <div className="col-span-2 flex flex-col">
            <h4 className="text-xl font-bold">Next of Kin Details</h4>
            <p className=" italic text-white/70">
              For security purpose your next-of-kin should not be the same
              person traveling/lodging with you. You can always update this
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
              {submitting ? "Proceeding..." : "Continue to NIN Verification"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
