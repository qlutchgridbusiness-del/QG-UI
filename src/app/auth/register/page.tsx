"use client";

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow p-6 space-y-6 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-slate-100">
          Join QlutchGrid
        </h1>

        <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
          Choose how you want to continue
        </p>

        <div className="space-y-4">
          <a
            href="/auth/register/user"
            className="block border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition bg-white/90 dark:bg-slate-900"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">👤 I’m a Customer</div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Book services & track orders
            </p>
          </a>

          <a
            href="/auth/register/business"
            className="block border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-500 transition bg-white/90 dark:bg-slate-900"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">🏢 I’m a Business</div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              List services & receive bookings
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
