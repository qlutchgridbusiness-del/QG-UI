"use client";
import { useState, useEffect } from "react";

export default function BookingForm({ serviceId }: { serviceId: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Assume user info is saved as { id: "uuid", name: "John" }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      setError("⚠️ Please fill in all details.");
      return;
    }
    if (!userId) {
      setError("⚠️ User not logged in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // ✅ now included
          serviceId,
          userName: form.name,
          userPhone: form.phone,
          date: form.date,
          time: form.time,
          status: "pending",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessData({
          ...form,
          bookingId: data.id || Math.floor(Math.random() * 100000),
        });
        setForm({ name: "", phone: "", date: "", time: "" });
      } else {
        setError(`❌ ${data.message || "Failed to place booking."}`);
      }
    } catch (err) {
      console.error(err);
      setError("❌ Something went wrong while creating booking.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md bg-white p-6 rounded-xl shadow-md text-center space-y-3">
        <h3 className="text-2xl font-semibold text-green-700">
          ✅ Booking Confirmed!
        </h3>
        <p className="text-gray-700">
          <strong>Date:</strong> {successData.date}
        </p>
        <p className="text-gray-700">
          <strong>Time:</strong> {successData.time}
        </p>
        <p className="text-gray-500 text-sm">
          Booking ID: <span className="font-mono">{successData.bookingId}</span>
        </p>
        <button
          onClick={() => setSuccessData(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 bg-white p-6 rounded-xl shadow-md"
    >
      <h3 className="text-xl font-semibold text-gray-700">Book Service</h3>

      <input
        placeholder="Your Name"
        className="border p-2 rounded w-full focus:outline-blue-500"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Phone Number"
        className="border p-2 rounded w-full focus:outline-blue-500"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <div className="flex gap-3">
        <input
          type="date"
          className="border p-2 rounded w-1/2 focus:outline-blue-500"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          type="time"
          className="border p-2 rounded w-1/2 focus:outline-blue-500"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-70 transition"
        disabled={loading}
      >
        {loading ? "Booking..." : "Book Now"}
      </button>

      {error && <p className="text-red-600 text-center text-sm">{error}</p>}
    </form>
  );
}
