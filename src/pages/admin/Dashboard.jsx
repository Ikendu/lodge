import React from "react";
import DashboardStatCard from "../../components/admin/DashboardStatCard";
import { Pie } from "react-chartjs-2";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStatCard title="Total Lodges" value={124} />
        <DashboardStatCard title="Verified" value={98} />
        <DashboardStatCard title="Pending" value={6} />
        <DashboardStatCard title="Bookings" value={432} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="text-sm text-gray-700">
          <li>New lodge: Cozy Room in Lagos</li>
          <li>Booking: #BK-2301 confirmed</li>
          <li>Flagged listing: Suspicious images</li>
        </ul>
      </div>
    </div>
  );
}
