"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/app/lib/api";
import { playNotificationSound } from "@/utils/sound";

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [hasUpdates, setHasUpdates] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );
  const prevMapRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      try {
        const data = await apiGet("/bookings/my", token);
        const prev = prevMapRef.current;
        const nextMap: Record<string, string> = {};
        let changed = false;
        let pending = 0;

        let changedBooking: any = null;
        data.forEach((b: any) => {
          nextMap[b.id] = b.status;
          if (prev[b.id] && prev[b.id] !== b.status) changed = true;
          if (!changedBooking && prev[b.id] && prev[b.id] !== b.status) {
            changedBooking = b;
          }
          if (b.status === "PAYMENT_PENDING") pending += 1;
        });

        prevMapRef.current = nextMap;
        setPendingPayments(pending);

        if (changed) {
          setHasUpdates(true);
          playNotificationSound();
          setToast("You have new booking updates.");
          setTimeout(() => setToast(null), 4000);
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            const status = changedBooking?.status;
            const statusMap: Record<string, { title: string; body: string }> = {
              REQUESTED: {
                title: "Booking Requested",
                body: "Your booking request has been created.",
              },
              BUSINESS_ACCEPTED: {
                title: "Booking Accepted",
                body: "Business accepted your booking.",
              },
              BUSINESS_REJECTED: {
                title: "Booking Rejected",
                body: "Business rejected your booking.",
              },
              SERVICE_STARTED: {
                title: "Service Started",
                body: "Your service has started.",
              },
              PAYMENT_PENDING: {
                title: "Payment Pending",
                body: "Service completed. Please complete payment.",
              },
              PAYMENT_COMPLETED: {
                title: "Payment Completed",
                body: "Payment received. You can pick up your vehicle.",
              },
              VEHICLE_DELIVERED: {
                title: "Vehicle Delivered",
                body: "Your vehicle was marked delivered. Thank you!",
              },
              CANCELLED: {
                title: "Booking Cancelled",
                body: "Your booking was cancelled.",
              },
            };
            const fallback = {
              title: "Booking Update",
              body: "Your booking status was updated.",
            };
            const meta = status ? statusMap[status] || fallback : fallback;
            const title = meta.title;
            const body = meta.body;
            const url = changedBooking
              ? `/user-dashboard/bookings/${changedBooking.id}`
              : "/user-dashboard/orders";
            if ("serviceWorker" in navigator) {
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
      }
    };

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  async function requestPermission() {
    if (typeof window === "undefined") return;
    const res = await Notification.requestPermission();
    setPermission(res);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow">
          {toast}
        </div>
      )}
      {(hasUpdates || pendingPayments > 0 || permission !== "granted") && (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between text-sm">
            <div className="text-gray-800 dark:text-slate-200">
              {hasUpdates && (
                <span>New booking updates available.</span>
              )}
              {pendingPayments > 0 && (
                <span className="ml-3 text-orange-600">
                  {pendingPayments} payment{pendingPayments > 1 ? "s" : ""} pending.
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {hasUpdates && (
                <button
                  onClick={() => {
                    setHasUpdates(false);
                    router.push("/user-dashboard/orders");
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white"
                >
                  View Updates
                </button>
              )}
              {permission !== "granted" && (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-white"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}
