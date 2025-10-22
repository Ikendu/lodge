import React from "react";
import ListingsTable from "../../components/admin/ListingsTable";

const demo = [
  {
    id: "l1",
    title: "Cozy Room",
    ownerName: "Aisha",
    location: "Lagos",
    price: "₦4,000",
    status: "pending",
  },
  {
    id: "l2",
    title: "Self-Contain",
    ownerName: "Tunde",
    location: "Enugu",
    price: "₦8,000",
    status: "active",
  },
];

export default function AdminListings() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Listings</h2>
      <ListingsTable data={demo} onReview={(l) => alert(JSON.stringify(l))} />
    </div>
  );
}
