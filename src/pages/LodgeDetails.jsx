// LodgeDetails.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export default function LodgeDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const lodge = location.state?.lodge;

  // Simulate user registration status (you’ll later replace this with real auth logic)
  const userRegistered = false;

  if (!lodge)
    return <p className="text-center mt-10 text-gray-600">Lodge not found</p>;

  const handleBookNow = () => {
    if (userRegistered) {
      navigate(`/booking/${lodge.id}`, { state: { lodge } });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <img
          src={lodge.image}
          alt={lodge.title}
          className="w-full h-64 object-cover"
        />
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
