import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import ownerImg from "../assets/logos/owner.png";
import ownerImg2 from "../assets/logos/ownerh.png";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  // origin (where the user came from) may still be provided
  const origin = location.state?.from || null;

  // Profile is always loaded from the backend API. No localStorage or navigation-state fallbacks.
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      // send user to login and preserve current location so they can come back
      navigate("/login", { state: { from: location } });
    }
  }, [loading, user, navigate, location]);

  // fetch profile from backend using authenticated identifiers
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
      console.log("Params", params);

      try {
        const res = await fetch(
          `http://localhost/lodge/get_profile.php?${params.toString()}`
        );
        const j = await res.json();
        const p = j?.profile || j?.data || (j?.success ? j : null);
        if (p) setProfileData(p);
      } catch (e) {
        console.warn("Failed to fetch profile", e);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!loading && user) fetchProfile();
    if (!loading && !user) setLoadingProfile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (loading || !user) return null; // redirect in progress

  const pageVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.995 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.45 } },
  };

  const imgHover = { scale: 1.03 };
  const btnHover = { scale: 1.02 };

  // display is strictly from fetched profile data (backend)
  const display = profileData || {};
  console.log("Displaying profile:", display);

  const getImageSrc = (val) => {
    if (!val) return null;
    if (typeof val !== "string") return null;
    if (val.startsWith("data:")) return val;
    // if looks like base64 (long string) add prefix
    if (/^[A-Za-z0-9+/=\s]+$/.test(val) && val.length > 100)
      return `data:image/jpeg;base64,${val}`;
    return val; // assume it's a URL
  };

  const ninImage =
    getImageSrc(display.verified_image) ||
    getImageSrc(display.ninPhoto) ||
    getImageSrc(display.nin_image) ||
    ownerImg;

  const uploadedImage =
    getImageSrc(display.image) ||
    getImageSrc(display.uploaded_image) ||
    getImageSrc(display.givenPhoto) ||
    user.photoURL ||
    ownerImg2;

  const profile = {
    givenPhoto: uploadedImage,
    ninPhoto: ninImage,
    fullName:
      display.firstName ||
      display.first_name ||
      user.displayName ||
      "Not provided",
    dob: display.dob || display.date_of_birth || "Not provided",
    email: display.email || "-",
    phone: display.phone || display.phone_number || display.mobile || "-",
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
    lgaOrigin: display.lgaOrigin || "Not provided",
    stateOrigin: display.stateOrigin || "Not provided",
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
      className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="max-w-4xl w-full bg-white rounded-lg shadow p-6"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            User Profile
          </motion.h1>
          <motion.button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:underline"
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
        </div>

        <div className="md:flex md:gap-6">
          {/* Left column: images */}
          <div className="md:w-2/5 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">NIN</div>
              <motion.img
                src={profile.ninPhoto}
                alt="NIN"
                className="w-full h-48 object-cover rounded-md border"
                whileHover={imgHover}
                transition={{ type: "spring", stiffness: 220 }}
              />
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Uploaded (Given)</div>
              <motion.img
                src={profile.givenPhoto}
                alt="Given"
                className="w-full h-48 object-cover rounded-md border"
                whileHover={imgHover}
                transition={{ type: "spring", stiffness: 220 }}
              />
            </div>
          </div>

          {/* Right column: details */}
          <div className="md:w-3/5 mt-6 md:mt-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Full name</div>
                <div className="font-medium">{profile.fullName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date of Birth</div>
                <div className="font-medium">{profile.dob}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{profile.email}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium">{profile.phone}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">NIN</div>
                <div className="font-medium">{profile.nin}</div>
              </div>

              <div className="col-span-2">
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-medium">{profile.address}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">LGA of Residence</div>
                <div className="font-medium">{profile.lgaResidence}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">State of Residence</div>
                <div className="font-medium">{profile.stateResidence}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">LGA of Origin</div>
                <div className="font-medium">{profile.lgaOrigin}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">State of Origin</div>
                <div className="font-medium">{profile.stateOrigin}</div>
              </div>

              <div className="col-span-2 mt-2 border-t pt-3">
                <div className="text-sm font-semibold mb-2">Next of Kin</div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="font-medium">{profile.nextOfKin.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Relation</div>
                    <div className="font-medium">
                      {profile.nextOfKin.relation}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="font-medium">{profile.nextOfKin.phone}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Birth Country</div>
                    <div className="font-medium">{profile.birthCountry}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Birth LGA</div>
                    <div className="font-medium">{profile.birthLga}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Birth State</div>
                    <div className="font-medium">{profile.birthState}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium">{profile.gender}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">Other details</div>
                  <div className="text-sm text-gray-700">
                    {profile.otherDetails}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <motion.button
                onClick={() => navigate("/profile/edit")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                whileHover={btnHover}
              >
                Edit Profile
              </motion.button>
              <motion.button
                onClick={() => navigate(-1)}
                className="border border-gray-300 px-4 py-2 rounded-md"
                whileHover={btnHover}
              >
                Close
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
