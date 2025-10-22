import React from "react";
import UsersTable from "../../components/admin/UsersTable";

const demo = [
  {
    id: "u1",
    name: "Aisha",
    email: "aisha@example.com",
    role: "owner",
    status: "active",
  },
  {
    id: "u2",
    name: "Tunde",
    email: "tunde@example.com",
    role: "renter",
    status: "active",
  },
];

export default function AdminUsers() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <UsersTable data={demo} onRowClick={(u) => alert(JSON.stringify(u))} />
    </div>
  );
}
