import React from "react";

export default function UsersTable({ data = [], onRowClick = () => {} }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No users
              </td>
            </tr>
          )}
          {data.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">
                <button onClick={() => onRowClick(u)} className="text-blue-600">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
