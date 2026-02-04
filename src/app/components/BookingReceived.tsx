// components/BookingReceived.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./BookingReceived.module.css";
import { API_BASE } from "@/app/lib/api";

interface Booking {
  id: string;
  service_name: string;
  price: number;
  user_name: string;
  user_email: string;
  status: string;
  payment_status: string;
  date: string;
}

const BookingReceived: React.FC = () => {
  const businessEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/get-business-bookings?business_email=${businessEmail}`
      );
      const sorted = res.data.bookings
        .sort((a: Booking, b: Booking) => (a.status === "cancelled" ? 1 : -1))
        .sort((a: Booking, b: Booking) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBookings(sorted);
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Failed to load bookings.");
    }
  };

  const updateBooking = async (id: string, status: string, paymentStatus: string) => {
    try {
      await axios.post(`${API_BASE}/update-business-booking`, {
        id,
        status: status === "denied by business" && paymentStatus === "paid" ? "Refund Processed..." : status,
      });
      fetchBookings();
    } catch (err) {
      console.error(`❌ Failed to ${status} booking:`, err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Service Requests</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      {bookings.length > 0 ? (
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className={b.status === "cancelled" ? styles.cancelledRow : ""}>
                <td>
                  {b.date}
                  <div className={styles.userName}>👤 {b.user_name}</div>
                  <div className={styles.userEmail}>📧 {b.user_email}</div>
                </td>
                <td>
                  Booking for <strong>{b.service_name}</strong> priced at ₹<strong>{b.price}</strong>
                  {b.status === "active" && (
                    <div className={styles.buttonContainer}>
                      <button
                        className={styles.confirmButton}
                        onClick={() => updateBooking(b.id, "confirmed", b.payment_status)}
                      >
                        Confirm
                      </button>
                      <button
                        className={styles.denyButton}
                        onClick={() => updateBooking(b.id, "denied by business", b.payment_status)}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                  {b.status !== "active" && (
                    <span
                      className={`${styles.statusText} ${
                        b.status === "denied by business" ? styles.deniedText : styles.confirmedText
                      }`}
                    >
                      {b.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No service requests found.</p>
      )}
    </div>
  );
};
