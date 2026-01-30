"use client";
import { useState } from "react";
import { apiPost } from "@/app/lib/api";

export default function BookingForm({
  serviceId,
  businessId,
}: {
  serviceId: string;
  businessId: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      setError("Please select date and time");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to book service");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const res = await apiPost(
        "/bookings",
        {
          serviceId,
          businessId,
          scheduledAt,
        },
        token
      );

      setSuccess(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center space-y-3">
        <h3 className="text-xl font-semibold text-green-600">
          Booking Requested ✅
        </h3>
        <p className="text-gray-600">
          We’ve sent your request to the business.
        </p>
        <p className="text-sm text-gray-500">
          Booking ID: <span className="font-mono">{success.id}</span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h3 className="text-lg font-semibold">Book this service</h3>

      <div className="flex gap-3">
        <input
          type="date"
          className="border p-2 rounded w-1/2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          className="border p-2 rounded w-1/2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}
    </form>
  );
}
