"use client";

import { useEffect, useState } from "react";

export default function BusinessOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("bookings") || "[]"));
  }, []);

  const updateStatus = (id: number, status: "ACCEPTED" | "REJECTED") => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );

    setOrders(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">No orders yet</p>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{o.serviceName}</h3>
                <p className="text-gray-500">Customer: {o.user}</p>
                <p className="text-sm text-gray-400">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">₹ {o.price}</p>
                <p
                  className={`font-medium ${
                    o.status === "PENDING"
                      ? "text-yellow-600"
                      : o.status === "ACCEPTED"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {o.status}
                </p>
              </div>
            </div>

            {o.status === "PENDING" && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => updateStatus(o.id, "ACCEPTED")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(o.id, "REJECTED")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
