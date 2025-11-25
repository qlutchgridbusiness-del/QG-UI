"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  id: string;
  scheduledAt: string;
  price: string;
  status: string;
  paymentStatus: string;
  service: { name: string };
  business: { name: string };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://3.230.169.3:5001/bookings");
        console.log("check--bookings", res);
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p className="p-4">Loading your bookings...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Bookings</h1>
      {bookings?.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookings?.map((b) => (
            <div
              key={b.id}
              className="p-4 border rounded-lg shadow bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{b.service.name}</h2>
                <p className="text-gray-600">Business: {b.business.name}</p>
                <p className="text-gray-500 text-sm">
                  Scheduled: {new Date(b.scheduledAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{b.price}</p>
                <p
                  className={`text-sm ${
                    b.paymentStatus === "pending"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {b.paymentStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
