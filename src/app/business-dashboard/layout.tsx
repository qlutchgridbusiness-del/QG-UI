"use client";

import { ReactNode } from "react";
import Link from "next/link";

export default function BusinessDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg">Business Dashboard</h1>

          <nav className="flex gap-6 text-sm">
            <Link href="/business-dashboard" className="hover:text-indigo-600">
              Overview
            </Link>
            <Link
              href="/business-dashboard/bookings"
              className="hover:text-indigo-600"
            >
              Bookings
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
