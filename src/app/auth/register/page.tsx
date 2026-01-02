"use client";

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Join QlutchGrid
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Choose how you want to continue
        </p>

        <div className="space-y-4">
          <a
            href="/auth/register/user"
            className="block border rounded-xl p-4 hover:border-indigo-500 transition"
          >
            <div className="text-lg font-semibold">👤 I’m a Customer</div>
            <p className="text-sm text-gray-500">
              Book services & track orders
            </p>
          </a>

          <a
            href="/auth/register/business"
            className="block border rounded-xl p-4 hover:border-indigo-500 transition"
          >
            <div className="text-lg font-semibold">🏢 I’m a Business</div>
            <p className="text-sm text-gray-500">
              List services & receive bookings
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
