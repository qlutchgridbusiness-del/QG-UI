import BookingStatus from "./BookingStatus";
import { Booking } from "@/app/business-dashboard/bookings/page";

export default function BookingCard({
  booking,
  onAccept,
  onReject,
  onComplete,
}: {
  booking: Booking;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold">{booking.user.name}</div>
        <BookingStatus status={booking.status} />
      </div>

      <div className="text-sm text-gray-600">
        📞 {booking.user.phone}
      </div>

      <div className="text-sm">
        🛠 {booking.service.name}
      </div>

      {booking.priceSnapshot && (
        <div className="font-semibold text-indigo-600">
          ₹{booking.priceSnapshot}
        </div>
      )}

      {booking.scheduledAt && (
        <div className="text-xs text-gray-500">
          ⏰ {new Date(booking.scheduledAt).toLocaleString()}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-3 pt-2">
        {booking.status === "REQUESTED" && (
          <>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Reject
            </button>
          </>
        )}

        {booking.status === "ACCEPTED" && (
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}
