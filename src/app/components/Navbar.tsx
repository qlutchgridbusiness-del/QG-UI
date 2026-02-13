"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import { FiMoon, FiSun } from "react-icons/fi";
import { apiGet } from "@/app/lib/api";
import { safeGetItem } from "@/app/lib/safeStorage";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const [hasTempAuth, setHasTempAuth] = useState(false);
  const [userBadge, setUserBadge] = useState(0);
  const [businessBadge, setBusinessBadge] = useState(0);
  const prevUserRef = useRef<Record<string, string>>({});
  const prevBizRef = useRef<Record<string, string>>({});

  const {
    user,
    role,
    businesses,
    activeBusinessId,
    switchToUser,
    switchToBusiness,
    logout,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  const isLoggedIn = isAuthenticated;

  useEffect(() => {
    const temp = safeGetItem("tempToken") || safeGetItem("verifiedPhone");
    setHasTempAuth(Boolean(temp));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAuthReady) return;
    const token = safeGetItem("token");
    if (!token) return;

    const load = async () => {
      try {
        if (role === "BUSINESS") {
          const data = await apiGet("/business-bookings", token);
          let pending = 0;
          data.forEach((b: any) => {
            if (b.status === "REQUESTED") pending += 1;
          });
          setBusinessBadge(pending);
        } else {
          const data = await apiGet("/bookings/my", token);
          let active = 0;
          data.forEach((b: any) => {
            if (b.status !== "VEHICLE_DELIVERED" && b.status !== "CANCELLED") {
              active += 1;
            }
          });
          setUserBadge(active);
        }
      } catch {
        // ignore
      }
    };

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAuthReady, role]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-gray-200/80 dark:border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-indigo-700 to-sky-500 bg-clip-text text-transparent"
        >
          QlutchGrid
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-gray-900 dark:text-slate-100 flex items-center justify-center hover:shadow transition"
          >
            {resolvedTheme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {!isLoggedIn ? (
            !isAuthReady ? (
              <div className="w-32 h-10 rounded-full bg-gray-200/70 dark:bg-slate-800 animate-pulse" />
            ) : hasTempAuth ? (
              <button
                onClick={() => router.push("/auth/register")}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold"
              >
                Continue Registration
              </button>
            ) : (
              <button
                onClick={() => router.push("/auth/login")}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold"
              >
                Get Started
              </button>
            )
          ) : (
            <div className="relative">
              <div className="relative">
                <FaUserCircle
                  onClick={() => setOpen((v) => !v)}
                  className="text-3xl text-gray-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 transition"
                />
                {(userBadge > 0 || businessBadge > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
                    {role === "BUSINESS" ? businessBadge : userBadge}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-2"
                  >
                  <NavItem
                    label="Dashboard"
                    onClick={() => {
                      setOpen(false);
                      router.push("/user-dashboard");
                    }}
                  />

                  <NavItem
                    label="Profile"
                    onClick={() => {
                      setOpen(false);
                      router.push("/user-dashboard/profile");
                    }}
                  />

                  <NavItem
                    label={`Orders${userBadge > 0 ? ` (${userBadge})` : ""}`}
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
            ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-slate-800 dark:text-slate-200"
            : "text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
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
            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        }`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="my-2 border-t border-gray-200 dark:border-slate-700" />;
}
