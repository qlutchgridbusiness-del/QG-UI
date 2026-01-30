"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

type Booking = {
  id: string;
  status: "REQUESTED" | "CONFIRMED" | "CANCELLED";
  scheduledAt?: string;
  createdAt: string;
  business: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    price?: number;
  };
};

export default function UserOrdersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    apiGet("/bookings/my", token)
      .then(setBookings)
      .catch(() => alert("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading your bookings…
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No bookings yet
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-white">My Orders</h1>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{b.service.name}</h3>
              <p className="text-sm text-gray-500">
                {b.business.name}
              </p>

              {b.scheduledAt && (
                <p className="text-sm text-gray-600 mt-1">
                  📅 {new Date(b.scheduledAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="text-right">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  b.status === "REQUESTED"
                    ? "bg-yellow-100 text-yellow-700"
                    : b.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
