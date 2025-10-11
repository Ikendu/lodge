// LodgeDetails.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";

export default function LodgeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const lodge = location.state?.lodge;

  // Use Firebase auth state to determine whether the user is signed in
  const [user] = useAuthState(auth);
  const userRegistered = !!user;

  if (!lodge)
    return <p className="text-center mt-10 text-gray-600">Lodge not found</p>;

  const handleBookNow = () => {
    if (userRegistered) {
      navigate(`/booking/${lodge.id}`, { state: { lodge } });
    } else {
      navigate("/login", { state: { from: location.pathname } });
    }
  };

  // Ensure lodge.images is an array of 3 URLs; fallback to empty strings if missing
  const images = lodge.images || ["", "", ""];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Image Gallery Section */}
        <div className="w-full">
          <img
            src={images[0]}
            alt={lodge.title}
            className="w-full h-72 object-cover"
          />
          <div className="flex flex-wrap">
            <img
              src={images[1]}
              alt={`${lodge.title} view 2`}
              className="w-1/2 h-48 object-cover"
            />
            <img
              src={images[2]}
              alt={`${lodge.title} view 3`}
              className="w-1/2 h-48 object-cover"
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {lodge.title}
          </h2>
          <p className="text-gray-500 mb-4">{lodge.location}</p>

          <div className="flex justify-between items-center mb-4">
            <span className="text-blue-600 font-semibold text-xl">
              ₦{lodge.price.toLocaleString()}/night
            </span>
            <div className="flex items-center text-yellow-500">
              <Star size={18} className="fill-yellow-500" />
              <span className="ml-1 text-sm font-medium">{lodge.rating}</span>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{lodge.description}</p>

          <button
            onClick={handleBookNow}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full shadow-md transition-all"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
