"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState<"user" | "business" | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as
      | "user"
      | "business"
      | null;
    if (storedRole) setRole(storedRole);
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text"
        >
          QlutchGrid
        </Link>

        {/* If homepage → Show Get Started Button */}
        {pathname === "/" ? (
          <button
            onClick={() => router.push("/auth/login")}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow hover:opacity-90 transition"
          >
            Get Started
          </button>
        ) : (
          <div className="relative">
            {/* Profile Icon */}
            <FaUserCircle
              className="text-3xl text-gray-700 cursor-pointer hover:text-indigo-600 transition"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {/* Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 bg-white text-gray-800 w-52 rounded-xl shadow-xl border border-gray-100 p-2 z-50"
                >
                  {/* User Role Menus */}
                  {role === "user" && (
                    <>
                      <Link
                        href="/user-dashboard"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        User Dashboard
                      </Link>
                      <Link
                        href="/user-dashboard/bookings"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </>
                  )}

                  {role === "business" && (
                    <>
                      <Link
                        href="/business-dashboard"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Business Dashboard
                      </Link>

                      <Link
                        href="/business-dashboard/service-requests"
                        className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Bookings Received
                      </Link>
                    </>
                  )}

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-200"></div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-sm text-red-600"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}
