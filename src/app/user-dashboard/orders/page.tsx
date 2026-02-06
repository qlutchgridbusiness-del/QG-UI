"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

type Booking = {
  id: string;
  status:
    | "REQUESTED"
    | "BUSINESS_ACCEPTED"
    | "BUSINESS_REJECTED"
    | "SERVICE_STARTED"
    | "PAYMENT_PENDING"
    | "PAYMENT_COMPLETED"
    | "VEHICLE_DELIVERED"
    | "CANCELLED";
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
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-slate-100">
        My Orders
      </h1>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer"
            onClick={() => (window.location.href = `/user-dashboard/bookings/${b.id}`)}
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
                    : b.status === "BUSINESS_ACCEPTED"
                    ? "bg-blue-100 text-blue-700"
                    : b.status === "SERVICE_STARTED"
                    ? "bg-indigo-100 text-indigo-700"
                    : b.status === "PAYMENT_PENDING"
                    ? "bg-orange-100 text-orange-700"
                    : b.status === "PAYMENT_COMPLETED"
                    ? "bg-emerald-100 text-emerald-700"
                    : b.status === "VEHICLE_DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : b.status === "BUSINESS_REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {b.status}
              </span>
              <div className="mt-2">
                <button
                  className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/user-dashboard/bookings/${b.id}`;
                  }}
                >
                  View Booking
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
