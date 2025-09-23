import { useState } from "react";
import { Star } from "lucide-react";

import bed1 from "../assets/images/bed1.jpg";
import bed2 from "../assets/images/bed2.jpg";
import bed3 from "../assets/images/bed3.jpg";
import bed4 from "../assets/images/bed4.jpg";
import bed5 from "../assets/images/bed5.jpg";
import bed6 from "../assets/images/bed6.jpg";

import { b } from "framer-motion/client";

const roomsData = [
  {
    id: 1,
    title: "Cozy Lodge in Enugu",
    location: "Nsukka, Enugu State",
    price: 8000,
    rating: 4.8,
    image: bed1, // sample placeholder
  },
  {
    id: 2,
    title: "Modern Apartment with Balcony",
    location: "Abuja, Nigeria",
    price: 10000,
    rating: 4.6,
    image: bed2, // sample placeholder
  },
  {
    id: 3,
    title: "Affordable Student Lodge",
    location: "Lagos, Nigeria",
    price: 4000,
    rating: 4.3,
    image: bed3, // sample placeholder
  },
  {
    id: 4,
    title: "Luxury Suite with Sea View",
    location: "Calabar, Nigeria",
    price: 10000,
    rating: 4.9,
    image: bed4, // sample placeholder
  },
  {
    id: 5,
    title: "Quiet Countryside Lodge",
    location: "Ibadan, Nigeria",
    price: 6000,
    rating: 4.5,
    image: bed5, // sample placeholder
  },
  {
    id: 6,
    title: "Downtown Apartment",
    location: "Port Harcourt, Nigeria",
    price: 9000,
    rating: 4.4,
    image: bed6, // sample placeholder
  },
];

export default function Apartments() {
  const [rooms] = useState(roomsData);

  return (
    <div className="p-4 md:p-10">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Explore Available Lodges & Apartments
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl shadow-md hover:shadow-xl transition duration-300 bg-white overflow-hidden cursor-pointer"
          >
            <img
              src={room.image}
              alt={room.title}
              className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
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
          </div>
        ))}
      </div>
    </div>
  );
}
