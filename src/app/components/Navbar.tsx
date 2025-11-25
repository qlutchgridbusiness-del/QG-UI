"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import styles from "./Navbar.module.css";

interface NavbarProps {
  userRole: "user" | "business";
  setUserRole: React.Dispatch<React.SetStateAction<"user" | "business">>;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, setUserRole }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("businessId");
    setUserRole("user");
    setDropdownOpen(false);
    router.push("/");
  };

  const handleGetStarted = () => {
    router.push("/auth/login");
  };

  const handleBookingsReceived = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user || !user.id) {
        alert("No logged-in user found");
        return;
      }

      const res = await axios.get("http://3.230.169.3:5001/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allBookings = res.data;
      const businessBookings = allBookings.filter(
        (b: any) => b.business?.owner?.id === user.id
      );

      console.log("Bookings for this business:", businessBookings);
      localStorage.setItem("bookings", JSON.stringify(businessBookings));

      router.push("/business-dashboard/service-requests");
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      alert("Failed to fetch bookings, Please try again");
    } finally {
      setDropdownOpen(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        QlutchGrid
      </Link>

      <div className={styles.profileContainer}>
        {currentPath === "/" ? (
          <div className={styles.loginContainer}>
            <span>Get Started</span>
            <button
              className={styles.smallLoginButton}
              onClick={handleGetStarted}
            >
              ➝
            </button>
          </div>
        ) : (
          <>
            <span
              className={styles.profileIcon}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle />
            </span>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className={styles.dropdownMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {userRole === "user" && (
                    <>
                      <Link
                        href="/user-dashboard"
                        onClick={() => setDropdownOpen(false)}
                      >
                        User Dashboard
                      </Link>
                      <Link
                        href="/user-dashboard/bookings"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </>
                  )}

                  {userRole === "business" && (
                    <>
                      <Link
                        href="/business-dashboard"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Business Dashboard
                      </Link>
                      <button
                        onClick={handleBookingsReceived}
                        className="block text-left w-full px-4 py-2 hover:bg-gray-100"
                      >
                        Bookings Received
                      </button>
                    </>
                  )}

                  <Link href="/" onClick={handleLogout}>
                    Logout
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
