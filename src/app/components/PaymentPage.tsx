// components/PaymentPage.tsx
import React from "react";
import { useRouter } from "next/router";
import styles from "./PaymentPage.module.css";

interface PaymentPageProps {
  businessEmail: string;
  serviceName: string;
  price: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({
  businessEmail,
  serviceName,
  price,
}) => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h2>Choose Payment Option</h2>
      <p>Service: {serviceName}</p>
      <p>Business: {businessEmail}</p>
      <p>Price: ₹{price}</p>

      <div className={styles.paymentOptions}>
        <button
          className={styles.payButton}
          onClick={() => router.push("/payment-confirmation")}
        >
          Online Pay Now
        </button>
        <button
          className={styles.payLaterButton}
          onClick={() => router.push("/booking-confirmation")}
        >
          Offline Pay Later
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;

