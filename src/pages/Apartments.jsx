import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import bed1 from "../assets/images/bed1.jpg";
import bed2 from "../assets/images/bed2.jpg";
import bed3 from "../assets/images/bed3.jpg";
import bed4 from "../assets/images/bed4.jpg";
import bed5 from "../assets/images/bed5.jpg";
import bed6 from "../assets/images/bed6.jpg";

const roomsData = [
  {
    id: 1,
    title: "Cozy Lodge in Enugu",
    location: "Nsukka, Enugu State",
    price: 8000,
    rating: 4.8,
    description:
      "A cozy lodge located in the heart of Enugu with all amenities.",
    image: bed1,
  },
  {
    id: 2,
    title: "Modern Apartment with Balcony",
    location: "Abuja, Nigeria",
    price: 10000,
    rating: 4.6,
    description: "Modern apartment with a beautiful balcony view in Abuja.",
    image: bed2,
  },
  {
    id: 3,
    title: "Affordable Student Lodge",
    location: "Lagos, Nigeria",
    price: 4000,
    rating: 4.3,
    description: "Perfect for students, affordable and close to campus.",
    image: bed3,
  },
  {
    id: 4,
    title: "Luxury Suite with Sea View",
    location: "Calabar, Nigeria",
    price: 10000,
    rating: 4.9,
    description: "Enjoy a luxury suite with breathtaking sea view in Calabar.",
    image: bed4,
  },
  {
    id: 5,
    title: "Quiet Countryside Lodge",
    location: "Ibadan, Nigeria",
    price: 6000,
    rating: 4.5,
    description: "Peaceful lodge located in the quiet countryside of Ibadan.",
    image: bed5,
  },
  {
    id: 6,
    title: "Downtown Apartment",
    location: "Port Harcourt, Nigeria",
    price: 9000,
    rating: 4.4,
    description:
      "Stay in the center of Port Harcourt with easy access to shops.",
    image: bed6,
  },
];

export default function Apartments() {
  const [rooms] = useState(roomsData);
  const navigate = useNavigate();

  const handleRoomClick = (room) => {
    navigate(`/room/${room.id}`, { state: room });
  };

  return (
    <div className="p-4 md:p-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800">
        Explore Available Lodges & Apartments
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl shadow-md hover:shadow-xl transition duration-300 bg-white overflow-hidden cursor-pointer"
            onClick={() => handleRoomClick(room)}
          >
            <img
              src={room.image}
              alt={room.title}
              className="h-56 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{room.title}</h3>
              <p className="text-gray-500 text-sm">{room.location}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-blue-600">
                  ₦{room.price.toLocaleString()}/night
                </span>
                <div className="flex items-center text-yellow-500">
                  <Star size={16} className="fill-yellow-500" />
                  <span className="ml-1 text-sm">{room.rating}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
