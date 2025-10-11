import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import ownerImg from "../assets/logos/owner.png";
import ownerImg2 from "../assets/logos/ownerh.png";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:underline"
          >
            Back
          </button>
        </div>

        <div className="md:flex md:gap-6">
          {/* Left column: images */}
          <div className="md:w-2/5 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">NIN</div>
              <img
                src={profile.ninPhoto}
                alt="NIN"
                className="w-full h-48 object-cover rounded-md border"
              />
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Uploaded (Given)</div>
              <img
                src={profile.givenPhoto}
                alt="Given"
                className="w-full h-48 object-cover rounded-md border"
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
              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Edit Profile
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border border-gray-300 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
