"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "@/app/lib/api";
import { playNotificationSound } from "@/utils/sound";
import { useAuth } from "@/app/context/AuthContext";

export default function BusinessDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const prevMapRef = useRef<Record<string, string>>({});
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();
  const { isAuthReady, role } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      try {
        const businessRes = await apiGet("/business/me", token);
        const businesses = businessRes?.businesses || businessRes || [];
        const business = Array.isArray(businesses) ? businesses[0] : null;
        if (!business || business.status !== "ACTIVE") {
          router.replace("/auth/register/business?pending=1");
          return;
        }
        const data = await apiGet("/business-bookings", token);
        const prev = prevMapRef.current;
        const nextMap: Record<string, string> = {};
        let changed = false;
        let changedBooking: any = null;
        let pending = 0;
        data.forEach((b: any) => {
          nextMap[b.id] = b.status;
          if (prev[b.id] && prev[b.id] !== b.status) {
            changed = true;
            if (!changedBooking) changedBooking = b;
          }
          if (b.status === "REQUESTED") pending += 1;
        });
        prevMapRef.current = nextMap;
        setPendingCount(pending);
        if (changed) {
          playNotificationSound();
          setToast("Booking status updated.");
          setTimeout(() => setToast(null), 4000);
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const status = changedBooking?.status;
            const statusMap: Record<string, { title: string; body: string }> = {
              REQUESTED: {
                title: "New Booking Request",
                body: "You received a new booking request.",
              },
              BUSINESS_ACCEPTED: {
                title: "Booking Accepted",
                body: "You accepted a booking.",
              },
              BUSINESS_REJECTED: {
                title: "Booking Rejected",
                body: "You rejected a booking.",
              },
              SERVICE_STARTED: {
                title: "Service Started",
                body: "Service has started for a booking.",
              },
              PAYMENT_PENDING: {
                title: "Payment Pending",
                body: "Service completed. Awaiting payment.",
              },
              PAYMENT_COMPLETED: {
                title: "Payment Completed",
                body: "Payment received for a booking.",
              },
              VEHICLE_DELIVERED: {
                title: "Vehicle Delivered",
                body: "Booking marked delivered.",
              },
              CANCELLED: {
                title: "Booking Cancelled",
                body: "User cancelled a booking.",
              },
            };
            const fallback = {
              title: "Booking Update",
              body: "A booking status was updated.",
            };
            const meta = status ? statusMap[status] || fallback : fallback;
            const title = meta.title;
            const body = meta.body;
            const url = "/business-dashboard/bookings";
            if ("serviceWorker" in navigator && window.isSecureContext) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, {
                  body,
                  icon: "/icon-192.png",
                  data: { url },
                });
              });
            } else {
              const n = new Notification(title, {
                body,
                icon: "/icon-192.png",
                data: { url },
              });
              n.onclick = () => {
                window.location.href = url;
              };
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setCheckingStatus(false);
      }
    };

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow">
          {toast}
        </div>
      )}
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-900 dark:text-slate-100">
            Business Dashboard
          </h1>

          <nav className="flex gap-6 text-sm text-gray-700 dark:text-slate-300">
            <Link href="/business-dashboard" className="hover:text-indigo-600">
              Overview
            </Link>
            <Link
              href="/business-dashboard/bookings"
              className="hover:text-indigo-600 relative"
            >
              Bookings
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {checkingStatus ? (
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Checking business status...
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
