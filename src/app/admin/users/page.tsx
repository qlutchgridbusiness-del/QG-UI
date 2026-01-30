"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
};

export default function UsersPreview() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // adjust if your API shape differs
        setUsers(res.data.users || res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Recent Users</h2>
        <a href="/admin/users" className="text-sm text-blue-600">
          View all
        </a>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-gray-500">No users found</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email / Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.slice(0, 5).map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">
                  {u.name || "—"}
                </td>
                <td className="px-4 py-3">
                  {u.email || u.phone || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "BUSINESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-blue-600 text-xs mr-3 hover:underline"
                    onClick={() => console.log("View user", u.id)}
                  >
                    View
                  </button>
                  <button
                    className="text-red-600 text-xs hover:underline"
                    onClick={() => console.log("Block user", u.id)}
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
