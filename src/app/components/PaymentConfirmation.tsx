// components/PaymentConfirmation.tsx
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import axios from "axios";
import styles from "./PaymentConfirmation.module.css";
import kachingSound from "../../../public/kaching.mp3";

const PaymentConfirmation: React.FC = () => {
  const router = useRouter();
  const hasSavedBooking = useRef(false);

  useEffect(() => {
    // Play kaching sound
    const audio = new Audio(kachingSound);
    audio.play().catch(console.error);

    const saveBooking = async () => {
      if (hasSavedBooking.current) return;
      hasSavedBooking.current = true;

      const user_email = localStorage.getItem("userEmail");
      const business_email = localStorage.getItem("bookingBusinessEmail");
      const service_name = localStorage.getItem("bookingServiceName");
      const price = localStorage.getItem("bookingPrice");

      if (!user_email || !business_email || !service_name || !price) {
        console.error("❌ Missing booking data");
        return;
      }

      try {
        await axios.post("/api/save-booking", {
          user_email,
          business_email,
          service_name,
          price,
          payment_status: "paid",
        });
        console.log("✅ Booking saved successfully");
      } catch (error) {
        console.error("❌ Failed to save booking:", error);
      }
    };

    saveBooking();

    // Redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/my-bookings");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <motion.div
      className={styles.confirmationContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className={styles.checkmarkCircle}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        ✔
      </motion.div>
      <h2>Payment Successful!</h2>
      <p>Redirecting to My Bookings...</p>
    </motion.div>
  );
};

export default PaymentConfirmation;
