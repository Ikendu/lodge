import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, Upload } from "lucide-react";

export default function AddNewLodge() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "",
    description: "",
    amenities: "",
    capacity: "",
    bathroomType: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Auth + Profile validation
  useEffect(() => {
    const user = localStorage.getItem("userLogin");
    const profile = localStorage.getItem("customerProfile");

    // if (!user) {
    //   navigate("/login");
    //   return;
    // }

    if (!profile) {
      navigate("/registeruser");
      return;
    }
  }, [navigate]);

  // ✅ Handle image uploads and preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      alert("You can only upload up to 3 images.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // small handler for number inputs to ensure numeric value
  const handleNumberChange = (e) => {
    const v = e.target.value;
    if (v === "") return setForm({ ...form, [e.target.name]: "" });
    const n = parseInt(v, 10);
    if (!isNaN(n)) setForm({ ...form, [e.target.name]: n });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // prevent double-submit
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    // gather user info from localStorage if available
    let userLogin = null;
    let customerProfile = null;
    try {
      userLogin = JSON.parse(localStorage.getItem("userLogin") || "null");
    } catch (err) {
      console.warn("Could not parse userLogin from localStorage", err);
    }
    try {
      customerProfile = JSON.parse(
        localStorage.getItem("customerProfile") || "null"
      );
    } catch (err) {
      console.warn("Could not parse customerProfile from localStorage", err);
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("location", form.location);
    formData.append("price", form.price);
    formData.append("type", form.type);
    formData.append("description", form.description);
    formData.append("amenities", form.amenities);
    formData.append("capacity", form.capacity || "");
    formData.append("bathroomType", form.bathroomType || "");

    // include user identifiers if available
    if (userLogin && userLogin.uid) formData.append("userUid", userLogin.uid);
    if (userLogin && userLogin.email)
      formData.append("userLoginMail", userLogin.email);
    if (customerProfile && customerProfile.nin)
      formData.append("nin", customerProfile.nin);

    images.forEach((img, i) => formData.append(`image${i + 1}`, img.file));

    // Debug dump of FormData entries (works in modern browsers)
    try {
      console.group("AddNewLodge FormData");
      for (const pair of formData.entries()) {
        // For File entries print filename
        if (pair[1] instanceof File)
          console.log(pair[0], pair[1].name, pair[1].type, pair[1].size);
        else console.log(pair[0], pair[1]);
      }
      console.groupEnd();
    } catch (err) {
      console.log("Could not enumerate FormData", err);
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        "https://lodge.morelinks.com.ng/api/add_lodge.php",
        {
          method: "POST",
          mode: "cors",
          body: formData,
        }
      );

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON response from server: " + text);
      }

      if (!json || !json.success) {
        const message = (json && json.message) || "Unknown server error";
        alert("Failed to create lodge: " + message);
        console.error("add_lodge failed", json);
      } else {
        alert("Lodge created successfully.");
        // Navigate to homepage or lodge page; adjust as needed
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error submitting lodge:", err);
      alert("Network or server error: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Image preview grid with "+" button logic
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-6"
      >
        Add a New Lodge
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl"
      >
        {/* Images Upload Section */}
        <label className="block text-gray-700 font-semibold mb-2">
          Lodge Images (Max 3)
        </label>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {images.map((img, index) => (
            <motion.div
              key={index}
              className="relative rounded-xl overflow-hidden border border-gray-300 shadow-sm"
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={img.preview}
                alt={`Lodge ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white text-red-500 text-sm rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition"
              >
                ✕
              </button>
            </motion.div>
          ))}

          {images.length < 3 && (
            <motion.label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col justify-center items-center border-2 border-dashed border-gray-400 rounded-xl h-32 hover:border-blue-500 transition"
              whileHover={{ scale: 1.05 }}
            >
              <PlusCircle className="text-gray-400 w-8 h-8 mb-2" />
              <span className="text-gray-500 text-sm">Add Image</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
                required
              />
            </motion.label>
          )}
        </div>

        {/* Lodge Details Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-10"
        >
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Lodge Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Cozy Apartment in Nsukka"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nsukka, Enugu"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Price (₦ per night)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 15000"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                How many people can stay here?
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleNumberChange}
                min={1}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. 4"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Kind of bathrooms available to guests?
              </label>
              <select
                name="bathroomType"
                value={form.bathroomType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select bathroom type</option>
                <option value="Private and attached">
                  Private and attached
                </option>
                <option value="Dedicated but separate">
                  Dedicated but separate
                </option>
                <option value="Shared">Shared</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Lodge Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Type</option>
              <option value="Single Room">Single Room</option>
              <option value="Shared Apartment">Shared Apartment</option>
              <option value="Entire Lodge">Entire Lodge</option>
              <option value="Guest House">Guest House</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Amenities
            </label>
            <input
              type="text"
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="WiFi, Air Conditioning, Parking..."
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 h-28"
              placeholder="Describe your lodge, its comfort, location, and unique features..."
            ></textarea>
          </div>

          <motion.button
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className={
              "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl py-3 mt-4 shadow-2xl transition-all " +
              (submitting
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-2xl")
            }
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Publishing...
              </>
            ) : (
              <>
                <Upload className="inline-block mr-2 w-5 h-5" />
                Publish Lodge
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}
