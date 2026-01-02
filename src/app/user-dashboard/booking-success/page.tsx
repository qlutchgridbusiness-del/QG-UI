"use client";
import { useRouter } from "next/navigation";

export default function BookingSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-green-600 mb-3">
        Booking Confirmed 🎉
      </h2>
      <p className="text-gray-600 mb-6">
        Your service request has been sent to the business.
      </p>

      <button
        onClick={() => router.push("/user-dashboard")}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl"
      >
        Book Another Service
      </button>
    </div>
  );
}
