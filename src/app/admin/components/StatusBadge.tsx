import { BookingStatus } from "@/app/business-dashboard/bookings/page";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    BUSINESS_ACCEPTED: "bg-blue-100 text-blue-800",
    BUSINESS_REJECTED: "bg-red-100 text-red-800",
    SERVICE_STARTED: "bg-purple-100 text-purple-800",
    SERVICE_COMPLETED: "bg-indigo-100 text-indigo-800",
    PAYMENT_PENDING: "bg-orange-100 text-orange-800",
    PAYMENT_COMPLETED: "bg-green-100 text-green-800",
    VEHICLE_DELIVERED: "bg-green-200 text-green-900",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${map[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
