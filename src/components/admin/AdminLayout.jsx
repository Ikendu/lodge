import React from "react";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    const token = localStorage.getItem("adminToken");
    localStorage.removeItem("adminToken");
    // attempt server logout if token exists
    if (token) {
      fetch("https://lodge.morelinks.com.ng/api/admin/logout.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).finally(() => {
        navigate("/admin/login");
      });
    } else {
      navigate("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold">Admin</h3>
        </div>
        <nav className="space-y-2">
          <Link
            to="/admin"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Users
          </Link>
          <Link
            to="/admin/lodges"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Lodges
          </Link>
          <Link
            to="/admin/payments"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Payments
          </Link>
          <Link
            to="/admin/refunds"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Refund Requests
          </Link>
          <Link
            to="/admin/account-deletions"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Account Delete Requests
          </Link>
          <Link
            to="/admin/complaints"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            Complaints
          </Link>
        </nav>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-3 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
