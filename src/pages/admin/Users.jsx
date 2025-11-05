import React, { useEffect, useState } from "react";

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("adminToken");
  const headers = Object.assign({}, opts.headers || {});
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch(path, Object.assign({}, opts, { headers }));
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("https://lodge.morelinks.com.ng/api/admin/users.php")
      .then((r) => r.text())
      .then((text) => {
        const json = text ? JSON.parse(text) : {};
        if (!json.success) throw new Error(json.message || "Failed");
        if (mounted) setUsers(json.data || []);
      })
      .catch((err) => setError(err.message || "Error"))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-3">Users</h3>
      <div className="w-[100%] mt-10 border border-gray-300 rounded-lg shadow-md h-64 overflow-auto">
        <table className="w-full border-collapse text-sm bg-white">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left min-w-40">Name</th>
            <th className="px-4 py-2 text-left min-w-20">Email</th>
            <th className="px-4 py-2 text-left min-w-20">Phone</th>
            <th className="px-4 py-2 text-left min-w-20">Mobile</th>
            <th className="px-4 py-2 text-left min-w-52">NIN Address</th>
            <th className="px-4 py-2 text-left min-w-52">Current Adress</th>
            <th className="px-4 py-2 text-left ">Gender</th>
            <th className="px-4 py-2 text-left min-w-20">Origin LGA</th>
            <th className="px-4 py-2 text-left min-w-20">Orinig State</th>
            <th className="px-4 py-2 text-left min-w-40">Next-of-Kin Name</th>
            <th className="px-4 py-2 text-left min-w-20">Next-of-Kin Phone</th>
            <th className="px-4 py-2 text-left min-w-40">
              Next-of-Kin Address
            </th>

            <th className="px-4 py-2 text-left">Date Created</th>
          </tr>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-2">{u?.id}</td>
              <td className="px-4 py-2">{`${u?.firstName} ${
                u?.middleName || ""
              }  ${u?.lastName}`}</td>
              <td className="px-4 py-2">{u?.userLoginMail}</td>
              <td className="px-4 py-2">{u?.phone}</td>
              <td className="px-4 py-2">{u?.mobile}</td>
              <td className="px-4 py-2 ">{u?.nin_address}</td>
              <td className="px-4 py-2">{u?.address}</td>
              <td className="px-4 py-2">{u?.gender}</td>
              <td className="px-4 py-2">{u?.lga}</td>
              <td className="px-4 py-2">{u?.state}</td>
              <td className="px-4 py-2">{u?.nextOfKinName}</td>
              <td className="px-4 py-2">{u?.nextOfKinPhone}</td>
              <td className="px-4 py-2">{u?.nextOfKinAddress}</td>
              <td className="px-4 py-2">{u?.created_at}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}
