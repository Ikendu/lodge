import { useState } from "react";
import { Star } from "lucide-react";

const roomsData = [
  {
    id: 1,
    title: "Cozy Lodge in Enugu",
    location: "Nsukka, Enugu State",
    price: 8000,
    rating: 4.8,
    image:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fbedroom&psig=AOvVaw21ONzpWF2y6fMOfh_83mY2&ust=1758689817385000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPiGy6CM7o8DFQAAAAAdAAAAABAE", // sample placeholder
  },
  {
    id: 2,
    title: "Modern Apartment with Balcony",
    location: "Abuja, Nigeria",
    price: 10000,
    rating: 4.6,
    image: "https://source.unsplash.com/600x400/?apartment,livingroom",
  },
  {
    id: 3,
    title: "Affordable Student Lodge",
    location: "Lagos, Nigeria",
    price: 4000,
    rating: 4.3,
    image: "https://source.unsplash.com/600x400/?student,hostel",
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
