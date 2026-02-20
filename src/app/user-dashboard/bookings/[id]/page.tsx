"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/app/lib/api";
import { playNotificationSound } from "@/utils/sound";

type Service = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  durationMinutes?: number;
  brands?: string[];
  carTypes?: string[];
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
  vehicleBrand?: string | null;
  vehicleType?: string | null;
  requestNotes?: string | null;
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

const BRANDS = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata Motors",
  "Mahindra",
  "Kia",
  "Toyota",
  "Honda",
  "MG Motor",
  "Renault",
  "Nissan",
  "Volkswagen",
  "Skoda",
  "BYD",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volvo",
  "Jaguar",
  "Land Rover",
  "Lexus",
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "Rolls-Royce",
  "Bentley",
  "Mini",
  "Force Motors",
  "Isuzu",
  "others",
];

const CAR_TYPES = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Compact SUV",
  "Pickup Truck",
  "Van",
  "Minivan",
  "Electric Hatchback",
  "Electric Sedan",
  "Electric SUV",
  "Hybrid Vehicle",
  "CNG Vehicle",
];

export default function BookServicePage() {
  const { id } = useParams(); // serviceId
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const load = async () => {
      // First try booking details (when coming from Orders)
      if (token && typeof id === "string" && id.includes("-")) {
        try {
          const b = await apiGet(`/bookings/${id}`, token);
          setBooking(b);
          setService({
            id: b.service.id,
            name: b.service.name,
            pricingType: "QUOTE",
            business: {
              id: b.business.id,
              name: b.business.name,
              address: b.business.address,
            },
          } as Service);
          return;
        } catch {
          // fall through to service lookup
        }
      }

      // Otherwise treat as service booking page
      apiGet(`/services/${id}`)
        .then(setService)
        .catch(() => alert("Service not found"));
    };

    load();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !booking?.id) return;

    const refresh = async () => {
      try {
        const updated = await apiGet(`/bookings/${booking.id}`, token);
        if (prevStatusRef.current && prevStatusRef.current !== updated.status) {
          playNotificationSound();
        }
        prevStatusRef.current = updated.status;
        setBooking(updated);
      } catch {
        // ignore
      }
    };

    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [booking?.id]);

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
    if (
      service &&
      (service.pricingType === "RANGE" || service.pricingType === "QUOTE")
    ) {
      if (!vehicleBrand) {
        alert("Please select a vehicle brand");
        return;
      }
      if (!vehicleType) {
        alert("Please select a vehicle type");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorage.setItem(
          "redirectAfterLogin",
          `/user-dashboard/bookings/${id}`
        );
        router.push("/auth/login");
        return;
      }

      await apiPost(
        "/bookings",
        {
          businessId: service!.business.id,
          serviceId: service!.id,
          scheduledAt: `${date}T${time}:00`,
          vehicleBrand: vehicleBrand || undefined,
          vehicleType: vehicleType || undefined,
          requestNotes: requestNotes || undefined,
        },
        token
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
                `₹${service.minPrice ?? 0} – ₹${service.maxPrice ?? 0}`}
              {service.pricingType === "QUOTE" && "Quotation"}
            </div>

            {service.durationMinutes && (
              <p className="text-sm text-gray-500 mt-1">
                Duration: {service.durationMinutes} mins
              </p>
            )}
          </div>

          {(service.pricingType === "RANGE" ||
            service.pricingType === "QUOTE") && (
            <div className="bg-white rounded-xl shadow p-4 space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium">
                  Vehicle brand
                </label>
                <select
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg bg-white"
                >
                  <option value="">Select brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Vehicle type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg bg-white"
                >
                  <option value="">Select type</option>
                  {CAR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Additional details (optional)
                </label>
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Tell the business about your vehicle or specific requirements"
                  className="w-full mt-1 p-3 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          )}

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
            {(booking.vehicleBrand || booking.vehicleType) && (
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                {booking.vehicleBrand && (
                  <div>Brand: {booking.vehicleBrand}</div>
                )}
                {booking.vehicleType && (
                  <div>Type: {booking.vehicleType}</div>
                )}
              </div>
            )}
            {booking.requestNotes && (
              <div className="text-sm text-gray-600 mt-2">
                Notes: {booking.requestNotes}
              </div>
            )}
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

          {booking.status === "PAYMENT_COMPLETED" && (
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token) return;
                await apiPost(`/bookings/${booking.id}/pickup-request`, {}, token);
                alert("Pickup request sent to the business.");
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Confirm Pickup (Notify Business)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
