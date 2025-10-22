import React from "react";

export default function ListingsTable({ data = [], onReview = () => {} }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Owner</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No listings
              </td>
            </tr>
          )}
          {data.map((l) => (
            <tr key={l.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{l.title}</td>
              <td className="p-2">{l.ownerName}</td>
              <td className="p-2">{l.location}</td>
              <td className="p-2">{l.price}</td>
              <td className="p-2">{l.status}</td>
              <td className="p-2">
                <button onClick={() => onReview(l)} className="text-blue-600">
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
