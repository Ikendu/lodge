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
  });

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

  // ✅ Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("location", form.location);
    formData.append("price", form.price);
    formData.append("type", form.type);
    formData.append("description", form.description);
    formData.append("amenities", form.amenities);
    images.forEach((img, i) => formData.append(`image${i + 1}`, img.file));

    console.log(
      "Lodge data submitted:",
      Object.fromEntries(formData.entries())
    );
    alert("Lodge added successfully!");
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
              />
            </motion.label>
          )}
        </div>

        {/* Lodge Details Form */}
        <div className="space-y-4">
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
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 mt-4 shadow-lg hover:bg-blue-700 transition"
          >
            <Upload className="inline-block mr-2 w-5 h-5" />
            Publish Lodge
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
