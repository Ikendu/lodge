import React from "react";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    // restore preference
    try {
      const v = localStorage.getItem("adminSidebarOpen");
      if (v !== null) setOpen(v === "1");
    } catch (e) {}
  }, []);

  const toggle = () => {
    setOpen((s) => {
      try {
        localStorage.setItem("adminSidebarOpen", s ? "0" : "1");
      } catch (e) {}
      return !s;
    });
  };
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
      <aside
        className={`bg-white border-r p-4 transition-all duration-200 ease-in-out ${
          open ? "w-64" : "w-16"
        }`}
        aria-hidden={!open}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${open ? "" : "hidden"}`}>
              Admin
            </h3>
            <button
              onClick={toggle}
              className="ml-2 p-1 rounded hover:bg-gray-100"
              aria-label={open ? "Close sidebar" : "Open sidebar"}
            >
              {open ? "←" : "→"}
            </button>
          </div>
        </div>
        <nav className="space-y-2">
          <Link
            to="/admin"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Dashboard</span>
            <span className={`${open ? "hidden" : "inline"}`}>D</span>
          </Link>
          <Link
            to="/admin/users"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Users</span>
            <span className={`${open ? "hidden" : "inline"}`}>U</span>
          </Link>
          <Link
            to="/admin/lodges"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Lodges</span>
            <span className={`${open ? "hidden" : "inline"}`}>L</span>
          </Link>
          <Link
            to="/admin/payments"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Payments</span>
            <span className={`${open ? "hidden" : "inline"}`}>P</span>
          </Link>
          <Link
            to="/admin/refunds"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>
              Refund Requests
            </span>
            <span className={`${open ? "hidden" : "inline"}`}>R</span>
          </Link>
          <Link
            to="/admin/account-deletions"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>
              Account Delete Requests
            </span>
            <span className={`${open ? "hidden" : "inline"}`}>A</span>
          </Link>
          <Link
            to="/admin/contacts"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Contacts</span>
            <span className={`${open ? "hidden" : "inline"}`}>C</span>
          </Link>
          <Link
            to="/admin/complaints"
            className="block py-2 px-3 rounded hover:bg-gray-50"
          >
            <span className={`${open ? "inline" : "hidden"}`}>Complaints</span>
            <span className={`${open ? "hidden" : "inline"}`}>Co</span>
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

      {/* When sidebar is collapsed, show a small open button fixed */}
      {!open && (
        <button
          onClick={toggle}
          aria-label="Open admin sidebar"
          className="fixed left-2 top-4 z-40 p-2 bg-white rounded shadow"
        >
          ☰
        </button>
      )}

      <main className="flex-1 p-6 w-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
