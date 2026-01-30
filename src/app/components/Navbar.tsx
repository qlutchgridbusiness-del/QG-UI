"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const {
    user,
    role,
    businesses,
    activeBusinessId,
    switchToUser,
    switchToBusiness,
    logout,
  } = useAuth();

  const isLoggedIn = !!user;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          QlutchGrid
        </Link>

        {/* RIGHT SIDE */}
        {!isLoggedIn ? (
          <button
            onClick={() => router.push("/auth/login")}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
          >
            Get Started
          </button>
        ) : (
          <div className="relative">
            <FaUserCircle
              onClick={() => setOpen((v) => !v)}
              className="text-3xl text-gray-700 cursor-pointer hover:text-indigo-600 transition"
            />

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border p-2"
                >
                  {/* USER SECTION */}
                  <div className="px-4 py-2 text-xs text-gray-400 uppercase">
                    User
                  </div>

                  <NavItem
                    label="User Dashboard"
                    onClick={() => {
                      setOpen(false);
                      router.push("/user-dashboard");
                    }}
                  />

                  <NavItem
                    label="My Profile"
                    onClick={() => {
                      setOpen(false);
                      router.push("/user-dashboard/profile");
                    }}
                  />

                  <NavItem
                    label="Orders"
                    onClick={() => {
                      setOpen(false);
                      router.push("/user-dashboard/orders");
                    }}
                  />

                  {role === "BUSINESS" && (
                    <ActionItem
                      label="Switch to User Mode"
                      onClick={() => {
                        setOpen(false);
                        switchToUser();
                        router.push("/user-dashboard");
                      }}
                    />
                  )}

                  {/* BUSINESS SECTION */}
                  {businesses?.length > 0 && (
                    <>
                      <Divider />

                      <div className="px-4 py-2 text-xs text-gray-400 uppercase">
                        Businesses
                      </div>

                      {businesses.map((b) => (
                        <NavItem
                          key={b.id}
                          label={b.name}
                          active={b.id === activeBusinessId}
                          onClick={() => {
                            setOpen(false);
                            switchToBusiness(b.id);
                            router.push("/business-dashboard");
                          }}
                        />
                      ))}
                    </>
                  )}

                  <Divider />

                  <ActionItem
                    label="Logout"
                    danger
                    onClick={() => {
                      setOpen(false);
                      logout();
                      router.push("/");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ----------------- UI HELPERS ----------------- */

function NavItem({
  label,
  onClick,
  active = false,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition
        ${
          active
            ? "bg-indigo-50 text-indigo-700 font-medium"
            : "hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}

function ActionItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : "text-indigo-600 hover:bg-indigo-50"
        }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="my-2 border-t border-gray-200" />;
}
