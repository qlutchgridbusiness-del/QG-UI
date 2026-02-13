"use client";

import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 space-y-6 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Manage businesses, users, and approvals.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/businesses"
            className="rounded-xl border border-gray-200 dark:border-slate-800 p-4 hover:border-indigo-400"
          >
            <div className="font-semibold text-gray-900 dark:text-slate-100">
              Businesses
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Approve businesses and review signatures
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-xl border border-gray-200 dark:border-slate-800 p-4 hover:border-indigo-400"
          >
            <div className="font-semibold text-gray-900 dark:text-slate-100">
              Users
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              View and manage user accounts
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
