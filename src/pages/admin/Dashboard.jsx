import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [weekly, setWeekly] = useState({ labels: [], counts: [] });
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/metrics.php")
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        if (mounted) setMetrics(json.data || {});
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    setChartLoading(true);
    // fetch last 8 weeks by default
    apiFetch(
      "https://lodge.morelinks.com.ng/api/admin/metrics_lodges_weekly.php?weeks=8"
    )
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        if (mounted) setWeekly(json.data || { labels: [], counts: [] });
      })
      .catch((err) => {
        console.error("weekly metrics error", err);
      })
      .finally(() => mounted && setChartLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const data = {
    labels: weekly.labels || [],
    datasets: [
      {
        label: "Lodges added",
        data: weekly.counts || [],
        backgroundColor: "rgba(37, 99, 235, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Lodges added per week" },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-semibold">{metrics.users || 0}</div>
          <a className="text-blue-600 text-sm" href="/admin/users">
            View users
          </a>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Lodges</div>
          <div className="text-2xl font-semibold">{metrics.lodges || 0}</div>
          <a className="text-blue-600 text-sm" href="/admin/lodges">
            View lodges
          </a>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Payments</div>
          <div className="text-2xl font-semibold">{metrics.payments || 0}</div>
          <a className="text-blue-600 text-sm" href="/admin/payments">
            View payments
          </a>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Pending Refunds</div>
          <div className="text-2xl font-semibold">
            {metrics.pending_refunds || 0}
          </div>
          <a className="text-blue-600 text-sm" href="/admin/refunds">
            View refunds
          </a>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Account Deletions</div>
          <div className="text-2xl font-semibold">
            {metrics.account_deletions || 0}
          </div>
          <a className="text-blue-600 text-sm" href="/admin/account-deletions">
            View requests
          </a>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Complaints</div>
          <div className="text-2xl font-semibold">
            {metrics.complaints || 0}
          </div>
          <a className="text-blue-600 text-sm" href="/admin/complaints">
            View complaints
          </a>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Lodges added per week</h3>
        {chartLoading ? (
          <div>Loading chart...</div>
        ) : (
          <Bar options={options} data={data} />
        )}
      </div>
    </div>
  );
}
