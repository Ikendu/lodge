import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state?.from || null;

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const savedData = JSON.parse(localStorage.getItem("customerProfile"));

  useEffect(() => {
    if (!loading && !user) navigate("/login", { state: { from: location } });
  }, [loading, user, navigate, location]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const params = new URLSearchParams();
      if (user?.uid) params.append("uid", user.uid);
      if (user?.email) params.append("email", user.email);
      if (user?.phoneNumber)
        params.append("phone", user.phoneNumber.replace(/^\+/, ""));

      if (!params.toString()) {
        setLoadingProfile(false);
        return;
      }
    };

    if (!loading && user) fetchProfile();
    if (!loading && !user) setLoadingProfile(false);
  }, [loading, user]);

  if (loading || !user) return null;

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

  const display = profileData || savedData || {};

  const getImageSrc = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return null;
    if (val.startsWith("data:")) return val;
    if (/^[A-Za-z0-9+/=\s]+$/.test(val) && val.length > 100)
      return `data:image/jpeg;base64,${val}` || val;
    // If the value looks like a filename (no slashes, contains a dot ext),
    // prefix it with the public userImage URL so it resolves.
    const trimmed = val.trim();
    if (!trimmed.startsWith("http") && !trimmed.includes("/")) {
      const base = "https://lodge.morelinks.com.ng/userImage/";
      return base + encodeURIComponent(trimmed);
    }
    return val;
  };

  const ninImage =
    getImageSrc(display.verified_image) ||
    getImageSrc(display.verified_image_url) ||
    getImageSrc(display.nin_image);

  const uploadedImageRaw =
    display.image ||
    display.image_url ||
    display.uploaded_image ||
    display.givenPhoto ||
    user.photoURL ||
    display.uploadedImage;
  const uploadedImage = getImageSrc(uploadedImageRaw) || null;

  const profile = {
    givenPhoto: uploadedImage,
    ninPhoto: ninImage,
    fullName: `${display?.firstName} ${display?.middleName} ${display?.lastName}`,
    dob: display.dob || "Not provided",
    email: display.userLoginMail || "-",
    nin_phone: display.phone || "-",
    mobile: display.mobile || "-",
    nin: display.nin || display.id || "-",
    birthCountry: display.birth_country || "-",
    birthLga: display.birth_lga || "-",
    birthState: display.birth_state || "-",
    gender: display.gender || "-",
    address: display.address || "Not provided",
    addressLga: display.addressLga || display.address_lga || "Not provided",
    addressState:
      display.addressState || display.address_state || "Not provided",
    lgaResidence: display.lgaResidence || display.lga || "Not provided",
    stateResidence: display.stateResidence || display.state || "Not provided",
    lgaOrigin: display.birth_lga || "Not provided",
    stateOrigin: display.birth_state || "Not provided",
    nextOfKin: display.nextOfKin ||
      display.next_of_kin || {
        name: "Not provided",
        relation: "-",
        phone: "-",
      },
    otherDetails: display.otherDetails || "-",
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 flex justify-center items-center p-6 overflow-y-auto"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-white"
        variants={cardVariants}
      >
        <motion.div
          className="flex items-center justify-between mb-8 border-b border-white/20 pb-4"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow">
            User Profile
          </h1>
          <motion.button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-200 hover:text-white transition"
            whileTap={{ scale: 0.96 }}
          >
            ⬅ Back
          </motion.button>
        </motion.div>

        <div className="md:flex md:gap-8">
          {/* Left column: images */}
          <div className="md:w-2/5 space-y-6">
            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.ninPhoto}
                alt="NIN"
                className="w-full h-60 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3 text-sm">
                <span className="text-white/90 font-medium">
                  Verified Image
                </span>
              </div>
            </motion.div>

            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.givenPhoto}
                alt="Given"
                className="w-full h-60 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3 text-sm">
                <span className="text-white/90 font-medium">Given Image</span>
              </div>
            </motion.div>
          </div>

          {/* Right column: details */}
          <motion.div
            className="md:w-3/5 mt-8 md:mt-0 space-y-4 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Full Name", profile.fullName],
                ["Date of Birth", profile.dob],
                ["Email", profile.email],
                ["Phone", profile.nin_phone],
                ["Mobile", profile.mobile],
                ["Gender", profile.gender],
                ["NIN", profile.nin],
                ["Contact Address", profile.address],
                ["LGA of Residence", display.addressLga],
                ["State of Residence", display.addressState],
                ["Registered Address", display.nin_address],
                ["LGA of Origin", display.lga],
                ["State of Origin", display.state],
                ["Country", profile.birthCountry],
              ].map(([label, value], i) => (
                <motion.div
                  key={i}
                  className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-gray-300 uppercase">{label}</div>
                  <div className="font-semibold">{value}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/20 pt-4">
              <h2 className="text-lg font-semibold mb-3">Next of Kin</h2>
              <div className="grid grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <div className="text-xs text-gray-300 uppercase">Name</div>
                  <div className="font-semibold">{display.nextOfKinName}</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <div className="text-xs text-gray-300 uppercase">
                    Relation
                  </div>
                  <div className="font-semibold">
                    {display.nextOfKinRelation}
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <div className="text-xs text-gray-300 uppercase">Phone</div>
                  <div className="font-semibold">{display.nextOfKinPhone}</div>
                </motion.div>
              </div>
              <div className="mt-2">
                <div className="text-xs text-gray-300 uppercase">
                  Registered Address
                </div>
                <div className="font-semibold">{display.nextOfKinAddress}</div>
              </div>
            </div>

            {/* Buttons */}
            <motion.div
              className="mt-8 flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => navigate("/profile/edit")}
                className="px-6 py-2 rounded-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                whileHover={btnHover}
              >
                Edit Profile
              </motion.button>
              <motion.button
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-md font-semibold border border-white/30 hover:bg-white/10 transition-all"
                whileHover={btnHover}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
