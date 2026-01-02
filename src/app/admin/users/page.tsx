"use client";

export default function UsersPreview() {
  const users = [
    { id: "1", name: "Ravi Kumar", email: "ravi@gmail.com", role: "USER" },
    {
      id: "2",
      name: "Anita Sharma",
      email: "anita@gmail.com",
      role: "BUSINESS",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Recent Users</h2>
        <a href="/admin/users" className="text-sm text-blue-600">
          View all
        </a>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled
                  className="text-blue-600 text-xs mr-3 opacity-50"
                >
                  View
                </button>
                <button disabled className="text-red-600 text-xs opacity-50">
                  Block
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
