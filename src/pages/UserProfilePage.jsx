import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signInWithCredential, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import ownerImg from "../assets/logos/owner.png";
import ownerImg2 from "../assets/logos/ownerh.png";
import { lodges } from "../lodgedata";
import { motion } from "framer-motion";

export default function UserProfilePage() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Accept profile overrides from location.state.profile if available
  const profileFromState = location.state?.profile || {};

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
  const [deleting, setDeleting] = useState(false);

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
                onClick={() => navigate(-1)}
                className="border border-gray-300 px-4 py-2 rounded-md"
                whileHover={btnHover}
              >
                Close
              </motion.button>
              <motion.button
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Are you sure you want to permanently delete your account and all associated data? This action cannot be undone."
                  );
                  if (!confirmed) return;

                  try {
                    setDeleting(true);

                    // Ensure we have a fresh ID token by re-authenticating if possible
                    // For password users, attempt a reauth prompt. For social users, we rely on current token.
                    let idToken = null;
                    // try to get token directly
                    idToken = await user.getIdToken(/* forceRefresh */ true);

                    // Call the deletion endpoint. Configure endpoint via Vite env var VITE_DELETE_ENDPOINT
                    const endpoint = import.meta.env.VITE_DELETE_ENDPOINT || "/.netlify/functions/deleteUserData";
                    const resp = await fetch(endpoint, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ idToken, uid: user.uid, mode: "hard" }),
                    });
                    const data = await resp.json();
                    if (!resp.ok) throw new Error(data?.error || JSON.stringify(data));

                    // On success, navigate to a goodbye/landing page
                    alert("Your account has been deleted. We're sorry to see you go.");
                    navigate("/", { replace: true });
                  } catch (err) {
                    console.error("Delete account failed", err);
                    alert("Could not delete account: " + err.message);
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="ml-auto bg-red-600 text-white px-4 py-2 rounded-md"
                whileHover={btnHover}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* User Lodges & Bookings */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {(() => {
              // show lodges where ownerId === user.uid if available
              const myListings = lodges.filter((l) => l.ownerId === user.uid);
              if (!myListings.length) {
                return (
                  <div className="col-span-2 p-6 bg-gray-50 rounded-md text-gray-700">
                    <div className="font-medium mb-2">No listings yet</div>
                    <div className="mb-3 text-sm">
                      You haven't listed any lodges. Click below to add your
                      first listing and start earning.
                    </div>
                    <button
                      onClick={() => navigate("/registerowner")}
                      className="inline-block bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      List a Lodge
                    </button>
                  </div>
                );
              }

              return myListings.map((l) => (
                <motion.div
                  key={l.id}
                  className="bg-white rounded-md shadow p-3 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    navigate(`/lodge/${l.id}`, { state: { lodge: l } })
                  }
                >
                  <img
                    src={l.images?.[0]}
                    alt={l.title}
                    className="h-32 w-full object-cover rounded-md mb-2"
                  />
                  <div className="font-medium">{l.title}</div>
                  <div className="text-sm text-gray-500">{l.location}</div>
                  <div className="text-sm font-semibold text-blue-600 mt-2">
                    ₦{l.price.toLocaleString()}
                  </div>
                </motion.div>
              ));
            })()}
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">My Bookings</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {(() => {
              // profileFromState.bookings is expected to be an array of lodge ids
              const bookedIds = profileFromState.bookings || [];
              const myBookings = lodges.filter((l) => bookedIds.includes(l.id));
              if (!myBookings.length) {
                return (
                  <div className="col-span-2 p-6 bg-gray-50 rounded-md text-gray-700">
                    <div className="font-medium mb-2">No bookings found</div>
                    <div className="mb-3 text-sm">
                      You don't have any active bookings yet. Browse lodges and
                      make a booking to see it listed here.
                    </div>
                    <button
                      onClick={() => navigate("/apartments")}
                      className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-md"
                    >
                      Browse Lodges
                    </button>
                  </div>
                );
              }

              return myBookings.map((l) => (
                <motion.div
                  key={l.id}
                  className="bg-white rounded-md shadow p-3 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    navigate(`/lodge/${l.id}`, { state: { lodge: l } })
                  }
                >
                  <img
                    src={l.images?.[0]}
                    alt={l.title}
                    className="h-32 w-full object-cover rounded-md mb-2"
                  />
                  <div className="font-medium">{l.title}</div>
                  <div className="text-sm text-gray-500">{l.location}</div>
                  <div className="text-sm font-semibold text-blue-600 mt-2">
                    ₦{l.price.toLocaleString()}
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
