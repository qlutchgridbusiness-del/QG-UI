// components/UserDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./UserDashboard.module.css";
import { API_BASE } from "@/app/lib/api";

interface Business {
  email: string;
}

const UserDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-businesses`);
      setBusinesses(res.data.businesses);
    } catch (err) {
      console.error(err);
      setErrorMessage("❌ Failed to load businesses.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Available Businesses</h2>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <ul className={styles.businessList}>
        {businesses.map((b) => (
          <li
            key={b.email}
            className={styles.businessItem}
            onClick={() => router.push(`/booking/${b.email}`)}
          >
            {b.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
