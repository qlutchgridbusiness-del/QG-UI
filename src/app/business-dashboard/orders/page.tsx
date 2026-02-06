"use client";

import { useRouter } from "next/navigation";

export default function BusinessOrdersPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-slate-100">
        Orders
      </h1>
      <p className="text-gray-600 dark:text-slate-300 mb-6">
        Manage live bookings from the Bookings page.
      </p>
      <button
        onClick={() => router.push("/business-dashboard/bookings")}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
      >
        Go to Bookings
      </button>
    </div>
  );
}
