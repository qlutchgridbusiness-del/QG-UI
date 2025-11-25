// components/BookingPage.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "./BookingPage.module.css";

interface Service {
  name: string;
  price: number;
  available: boolean;
}

const BookingPage: React.FC = () => {
  const router = useRouter();
  const { businessEmail } = router.query;
  const [services, setServices] = useState<Service[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

    const fetchServices = async () => {
    try {
      const res = await axios.get(
        `http://3.230.169.3:5001/get-business-services?email=${businessEmail}`
      );
      const sortedServices: Service[] = res.data.services.sort((a: Service, b: Service) =>
        a.available === b.available ? 0 : a.available ? -1 : 1
      );
      setServices(sortedServices);
    } catch (err) {
      console.error("Error fetching services:", err);
      setErrorMessage("❌ No services found for this business.");
    }
  };

  useEffect(() => {
    if (businessEmail) fetchServices();
  }, [businessEmail, fetchServices()]);

  const handleBooking = (serviceName: string, price: number) => {
    if (!businessEmail) return;

    localStorage.setItem("bookingBusinessEmail", businessEmail as string);
    localStorage.setItem("bookingServiceName", serviceName);
    localStorage.setItem("bookingPrice", price.toString());

    console.log("📌 Booking Data Saved to localStorage:", {
      businessEmail,
      serviceName,
      price,
      user_email: localStorage.getItem("userEmail"),
    });

    router.push(`/payment/${businessEmail}/${serviceName}/${price}`);
  };

  return (
    <div className={styles.container}>
      <h2>Services for {businessEmail}</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <ul className={styles.serviceList}>
        {services.map((service, index) => (
          <li
            key={index}
            className={`${styles.serviceItem} ${!service.available ? styles.disabled : ""}`}
          >
            {service.name} - ₹{service.price}
            {service.available && (
              <button className={styles.bookNow} onClick={() => handleBooking(service.name, service.price)}>
                Book Now
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingPage;
