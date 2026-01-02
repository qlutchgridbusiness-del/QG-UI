// src/app/admin/businesses/page.tsx
"use client";

// NOTE: API will come later
// const businesses = await fetch("/admin/businesses")

const businesses = [
  {
    id: "b1",
    name: "QuickFix Plumbing",
    owner: "Anil Kumar",
    city: "Bangalore",
    status: "KYC_PENDING",
  },
  {
    id: "b2",
    name: "Spark Electricians",
    owner: "Meena",
    city: "Hyderabad",
    status: "ACTIVE",
  },
  {
    id: "b3",
    name: "Urban Cleaners",
    owner: "Rahul",
    city: "Chennai",
    status: "REJECTED",
  },
];

export default function AdminBusinessesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Businesses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow p-4 space-y-3"
          >
            <div>
              <p className="text-lg font-semibold">{b.name}</p>
              <p className="text-sm text-gray-500">
                Owner: {b.owner} · {b.city}
              </p>
            </div>

            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs ${
                  b.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : b.status === "KYC_PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {b.status.replace("_", " ")}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              {/* Actions disabled for now */}
              <button
                disabled
                className="px-3 py-1 text-sm rounded bg-gray-200 opacity-60"
              >
                View
              </button>

              <button
                disabled
                className="px-3 py-1 text-sm rounded bg-green-200 opacity-60"
              >
                Approve
              </button>

              <button
                disabled
                className="px-3 py-1 text-sm rounded bg-red-200 opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
