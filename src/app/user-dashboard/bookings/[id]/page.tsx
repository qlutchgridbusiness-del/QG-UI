"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/app/lib/api";

type Service = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  durationMinutes?: number;
  business: {
    id: string;
    name: string;
    address?: string;
  };
};

export default function BookServicePage() {
  const { id } = useParams(); // serviceId
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet(`/services/${id}`)
      .then(setService)
      .catch(() => alert("Service not found"));
  }, [id]);

  async function confirmBooking() {
    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await apiPost(
        "/bookings",
        {
          businessId: service!.business.id,
          serviceId: service!.id,
          scheduledAt: `${date}T${time}:00`,
        },
        token || undefined
      );

      router.push("/user-dashboard/orders");
    } catch (err) {
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (!service) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading service…
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">{service.name}</h1>
        <h1 className="text-gray-500">
        {service.business.name}
        </h1>
      </div>

      {/* PRICING */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="text-lg font-semibold text-indigo-600">
          {service.pricingType === "FIXED" && `₹${service.price}`}
          {service.pricingType === "RANGE" &&
            `₹${service.minPrice} – ₹${service.maxPrice}`}
          {service.pricingType === "QUOTE" && "Quotation"}
        </div>

        {service.durationMinutes && (
          <p className="text-sm text-gray-500 mt-1">
            Duration: {service.durationMinutes} mins
          </p>
        )}
      </div>

      {/* DATE & TIME */}
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Select Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>
      </div>

      {/* CONFIRM */}
      <button
        onClick={confirmBooking}
        disabled={loading}
        className="
          w-full mt-6 py-3 rounded-xl
          bg-indigo-600 text-white font-semibold
          hover:bg-indigo-700
          disabled:bg-gray-400
        "
      >
        {loading ? "Booking…" : "Confirm Booking"}
      </button>
    </div>
  );
}
