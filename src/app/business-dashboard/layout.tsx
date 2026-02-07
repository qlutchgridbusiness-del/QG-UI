"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/app/lib/api";
import { playNotificationSound } from "@/utils/sound";

export default function BusinessDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [pendingCount, setPendingCount] = useState(0);
  const prevMapRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      try {
        const data = await apiGet("/business-bookings", token);
        const prev = prevMapRef.current;
        const nextMap: Record<string, string> = {};
        let changed = false;
        let pending = 0;
        data.forEach((b: any) => {
          nextMap[b.id] = b.status;
          if (prev[b.id] && prev[b.id] !== b.status) {
            changed = true;
          }
          if (b.status === "REQUESTED") pending += 1;
        });
        prevMapRef.current = nextMap;
        setPendingCount(pending);
        if (changed) playNotificationSound();
      } catch {
        // ignore
      }
    };

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
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
        {children}
      </main>
    </div>
  );
}
