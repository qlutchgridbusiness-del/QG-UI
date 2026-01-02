"use client";

import { useEffect, useState } from "react";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const userName = "Demo User";

  useEffect(() => {
    const allBookings =
      JSON.parse(localStorage.getItem("bookings") || "[]");

    const userOrders = allBookings.filter(
      (b: any) => b.user === userName
    );

    setOrders(userOrders);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders yet</p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">
                {o.serviceName}
              </h3>
              <p className="text-gray-500">
                {o.businessName}
              </p>
              <p className="text-sm text-gray-400">
                Ordered on{" "}
                {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₹ {o.price}</p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  o.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : o.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
