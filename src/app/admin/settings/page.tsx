"use client";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 space-y-4 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Admin Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          This section is reserved for admin configuration. If you want specific
          settings here (roles, alerts, platform controls), tell me and I’ll add
          them.
        </p>
      </div>
    </div>
  );
}
