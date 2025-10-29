import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { motion } from "framer-motion";
import LodgeList from "../components/LodgeList";

export default function UserProfilePage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const savedData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("customerProfile"));
    } catch (e) {
      return null;
    }
  }, []);

  // Lodges are handled in the LodgeList component below

  // helper to resolve image value
  const getImageSrc = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return null;
    if (val.startsWith("data:")) return val;
    if (/^[A-Za-z0-9+/=\s]+$/.test(val) && val.length > 100)
      return `data:image/jpeg;base64,${val}`;
    const trimmed = val.trim();
    if (!trimmed.startsWith("http") && !trimmed.includes("/")) {
      const base = "https://lodge.morelinks.com.ng/api/userImage/";
      return base + encodeURIComponent(trimmed);
    }
    return val;
  };

  const display = profileData || savedData || {};

  console.log("Display data:", display);

  const ninImage =
    getImageSrc(display.verified_image) ||
    getImageSrc(display.verified_image_url);
  const uploadedImageRaw = display.image || display.uploadedImage;
  const uploadedImage = getImageSrc(uploadedImageRaw) || null;
  const signatureRaw =
    display.verified_signature ||
    display.signature ||
    display.verified_signature_url ||
    display.signature_url ||
    display.signatureImage;
  const signatureSrc = getImageSrc(signatureRaw) || null;

  if (loading) return null;

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

  const profile = {
    givenPhoto: uploadedImage,
    ninPhoto: ninImage,
    fullName: `${display?.firstName || ""} ${display?.middleName || ""} ${
      display?.lastName || ""
    }`.trim(),
    dob: display.dob || "Not provided",
    email: display.userLoginMail || "-",
    nin_phone: display.phone || "-",
    mobile: display.mobile || "-",
    nin: display.nin || display.id || "-",
    address:
      `${display.address}, ${display.addressLga}, ${display.addressState} ` ||
      "Not provided",
    verifiedAddress: display.nin_address || "Not provided",
    permanentAddress: display.permanentAddress || "Not provided",
    lgaOfOrigin: display.lga || "Not provided",
    nextOfKinName: display.nextOfKinName || "Not provided",
    nextOfKinPhone: display.nextOfKinPhone || "Not provided",
    nextOfKinAddress: display.nextOfKinAddress || "Not provided",
    nextOkinRelation: display.nextOfKinRelation || "Not provided",
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 flex justify-center items-center flex-col p-6 overflow-y-auto"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="max-w-5xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-white"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
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
        </div>

        <div className="md:flex md:gap-8">
          <div className="md:w-2/5 space-y-6">
            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.ninPhoto}
                alt="NIN"
                className="w-full h-80 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
            </motion.div>

            <motion.div
              className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/20"
              whileHover={imgHover}
            >
              <img
                src={profile.givenPhoto}
                alt="Given"
                className="w-full h-80 object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
              />
              {signatureSrc && (
                <div className="flex justify-center p-3 bg-transparent">
                  <img
                    src={signatureSrc}
                    alt="Signature"
                    className="w-1/2 object-contain rounded-md border border-white/20"
                    style={{ height: "auto" }}
                  />
                </div>
              )}
            </motion.div>
          </div>

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
                ["NIN", profile.nin],
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
            <hr />
            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Contact Address
              </div>
              <div className="font-semibold">{profile.address}</div>
            </motion.div>
            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Permanent Address
              </div>
              <div className="font-semibold">{profile.permanentAddress}</div>
            </motion.div>

            <motion.div
              className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-xs text-gray-300 uppercase">
                Verified Address
              </div>
              <div className="font-semibold">{profile.verifiedAddress}</div>
            </motion.div>
            <hr />
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Full Name", profile.nextOfKinName],
                ["Date of Birth", profile.nextOfKinPhone],
                ["Email", profile.nextOfKinAddress],
                ["Phone", profile.nextOkinRelation],
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
          </motion.div>
        </div>
      </motion.div>
      <div className="max-w-5xl mt-8">
        <h2 className="text-2xl text-white font-bold mb-3">
          Your listed Lodges
        </h2>
        <LodgeList userUid={user?.uid} nin={savedData?.nin} />
      </div>
    </motion.div>
  );
}
