"use client";
import React, { useEffect, useState } from "react";

export default function BookingsReceivedPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bookings");
    if (stored) setBookings(JSON.parse(stored));
  }, []);

  const updateBookingStatus = (id: string, status: string) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status } : b
    );
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  const handleReschedule = (id: string) => {
    if (!newDate) return alert("Please select a date & time!");
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status: "rescheduled", newDate } : b
    );
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
    setRescheduleId(null);
    setNewDate("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm">
          📅 Bookings Received
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your service bookings here.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h2 className="text-gray-700 text-xl font-medium">
              No bookings yet
            </h2>
            <p className="text-gray-500 mt-2">
              When customers book your services, they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-left">
                  <th className="py-3 px-4 font-semibold text-sm">Booking ID</th>
                  <th className="py-3 px-4 font-semibold text-sm">User</th>
                  <th className="py-3 px-4 font-semibold text-sm">Service</th>
                  <th className="py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="py-3 px-4 font-semibold text-sm">Created</th>
                  <th className="py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-700">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {b.id}
                    </td>
                    <td className="py-3 px-4">{b.user?.name || "—"}</td>
                    <td className="py-3 px-4">{b.service?.name || "—"}</td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        b.status === "accepted"
                          ? "text-green-600"
                          : b.status === "pending"
                          ? "text-yellow-600"
                          : b.status === "rejected"
                          ? "text-red-600"
                          : "text-indigo-600"
                      }`}
                    >
                      {b.status?.charAt(0).toUpperCase() +
                        b.status?.slice(1) || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      {(b.status === "created" || "pending") && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(b.id, "accepted")}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(b.id, "rejected")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setRescheduleId(b.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      {(b.status !== "created" || "pending") && (
                        <span className="text-gray-500 italic text-sm">
                          {b.status === "rescheduled"
                            ? `Rescheduled to ${b.newDate}`
                            : "Action completed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
              Reschedule Booking
            </h2>
            <input
              type="datetime-local"
              className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex justify-between gap-3">
              <button
                onClick={() => handleReschedule(rescheduleId)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setRescheduleId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg w-full hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
