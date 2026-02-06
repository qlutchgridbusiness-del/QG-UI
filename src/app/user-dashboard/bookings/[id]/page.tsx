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
  scheduledAt?: string | null;
  totalAmount?: number | null;
  beforeServiceImages?: string[] | null;
  afterServiceImages?: string[] | null;
  business: { id: string; name: string };
  service: { id: string; name: string };
};

const TIMELINE: {
  key: Booking["status"];
  label: string;
}[] = [
  { key: "REQUESTED", label: "Requested" },
  { key: "BUSINESS_ACCEPTED", label: "Accepted" },
  { key: "SERVICE_STARTED", label: "Service Started" },
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
  { key: "PAYMENT_COMPLETED", label: "Payment Completed" },
  { key: "VEHICLE_DELIVERED", label: "Vehicle Delivered" },
];

export default function BookServicePage() {
  const { id } = useParams(); // serviceId
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet(`/services/${id}`)
      .then(setService)
      .catch(() => alert("Service not found"));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // if this route is used to view booking details, attempt to load booking
    if (typeof id === "string" && id.includes("-")) {
      apiGet(`/bookings/${id}`, token).then(setBooking).catch(() => {});
    }
  }, [id]);

  async function loadRazorpay() {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") return reject();
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  async function payNow() {
    const token = localStorage.getItem("token");
    if (!booking || !token) return;

    await loadRazorpay();

    const res = await apiPost(
      "/payments/create-order",
      { bookingId: booking.id },
      token
    );

    const rzp = new (window as any).Razorpay({
      key: res.key,
      order_id: res.orderId,
      amount: res.amount,
      handler: async (response: any) => {
        await apiPost(
          "/payments/verify",
          {
            bookingId: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          },
          token
        );
        const updated = await apiGet(`/bookings/${booking.id}`, token);
        setBooking(updated);
      },
    });

    rzp.open();
  }
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

      {!booking && (
        <>
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
        </>
      )}

      {booking && (
        <div className="mt-2 space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-2">Booking Status</h2>
            <p className="text-sm text-gray-600">{booking.status}</p>
            {booking.totalAmount ? (
              <p className="text-sm text-gray-700 mt-1">
                Amount: ₹{booking.totalAmount}
              </p>
            ) : null}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-3">Status Timeline</h3>
            <div className="space-y-2">
              {TIMELINE.map((step) => {
                const active = TIMELINE.findIndex((s) => s.key === booking.status) >=
                  TIMELINE.findIndex((s) => s.key === step.key);
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        active ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        active ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {booking.beforeServiceImages?.length ? (
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-2">Before Service</h3>
              <div className="grid grid-cols-2 gap-3">
                {booking.beforeServiceImages.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Before service"
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          ) : null}

          {booking.afterServiceImages?.length ? (
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-2">After Service</h3>
              <div className="grid grid-cols-2 gap-3">
                {booking.afterServiceImages.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="After service"
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          ) : null}

          {booking.status === "PAYMENT_PENDING" && (
            <button
              onClick={payNow}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Pay Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
