import { useEffect } from "react";
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

  // Accept profile overrides from location.state.profile if available
  const profileFromState = location.state?.profile || {};
  // Where the user came from before starting registration (used for Return)
  const origin = location.state?.from || null;

  useEffect(() => {
    if (!loading && !user) {
      // send user to login and preserve current location so they can come back
      navigate("/login", { state: { from: location } });
    }
  }, [loading, user, navigate, location]);

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

  // Build a profile object combining auth user and optional state-provided fields
  const profile = {
    givenPhoto: user.photoURL || profileFromState.givenPhoto || ownerImg2,
    ninPhoto: profileFromState.ninPhoto || ownerImg,
    fullName: user.displayName || profileFromState.fullName || "Not provided",
    dob: profileFromState.dob || "Not provided",
    address: profileFromState.address || "Not provided",
    lgaResidence: profileFromState.lgaResidence || "Not provided",
    stateResidence: profileFromState.stateResidence || "Not provided",
    lgaOrigin: profileFromState.lgaOrigin || "Not provided",
    stateOrigin: profileFromState.stateOrigin || "Not provided",
    nextOfKin: profileFromState.nextOfKin || {
      name: "Not provided",
      relation: "-",
      phone: "-",
    },
    otherDetails: profileFromState.otherDetails || "-",
  };

  // If a profile was passed in navigation state prefer it; else try localStorage
  const persisted = (() => {
    try {
      const raw = localStorage.getItem("customerProfile");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const finalProfile = {
    givenPhoto: profileFromState.givenPhoto || user.photoURL || ownerImg2,
    ninPhoto: profileFromState.ninPhoto || ownerImg,
    fullName:
      profileFromState.fullName ||
      user.displayName ||
      (persisted && persisted.firstName + " " + (persisted.lastName || "")) ||
      "Not provided",
    dob: profileFromState.dob || persisted?.dob || "Not provided",
    address: profileFromState.address || persisted?.address || "Not provided",
    lgaResidence:
      profileFromState.lgaResidence || persisted?.lga || "Not provided",
    stateResidence:
      profileFromState.stateResidence || persisted?.state || "Not provided",
    lgaOrigin: profileFromState.lgaOrigin || "Not provided",
    stateOrigin: profileFromState.stateOrigin || "Not provided",
    nextOfKin: profileFromState.nextOfKin || {
      name: "Not provided",
      relation: "-",
      phone: "-",
    },
    otherDetails: profileFromState.otherDetails || "-",
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
                <div className="text-xs text-gray-500">Other details</div>
                <div className="text-sm text-gray-700">
                  {profile.otherDetails}
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
                onClick={() => {
                  if (origin) {
                    // origin may be a location descriptor
                    try {
                      if (origin.pathname)
                        navigate(origin.pathname, { state: origin.state });
                      else navigate(-1);
                    } catch (e) {
                      navigate(-1);
                    }
                  } else {
                    navigate(-1);
                  }
                }}
                className="border border-gray-300 px-4 py-2 rounded-md"
                whileHover={btnHover}
              >
                Return to previous page
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
