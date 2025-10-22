import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-6 gap-6">
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Admin</h3>
          <nav className="space-y-2 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive ? "block text-blue-600" : "block text-gray-700"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? "block text-blue-600" : "block text-gray-700"
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/listings"
              className={({ isActive }) =>
                isActive ? "block text-blue-600" : "block text-gray-700"
              }
            >
              Listings
            </NavLink>
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                isActive ? "block text-blue-600" : "block text-gray-700"
              }
            >
              Bookings
            </NavLink>
          </nav>
        </aside>

        <main className="md:col-span-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
