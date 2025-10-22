import React from "react";

export default function DashboardStatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
      <div className="bg-blue-50 p-3 rounded">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}
