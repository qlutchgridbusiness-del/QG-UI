"use client";
import { useState } from "react";
import { apiPost } from "@/app/lib/api";

export default function UserRegisterPage() {
  const [loading, setLoading] = useState(false);

  async function submit(form: FormData) {
    setLoading(true);

    await apiPost("/auth/register/user", {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
    });

    // Next: OTP verification
    window.location.href = "/verify-otp";
  }

  return (
    <form
      action={submit}
      className="min-h-screen flex items-center justify-center px-4 bg-gray-50"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold">Create Account</h2>

        <input
          name="name"
          placeholder="Full name"
          required
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="phone"
          placeholder="Mobile number"
          required
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="email"
          placeholder="Email address"
          required
          className="w-full p-3 border rounded-lg"
        />

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Continuing..." : "Continue"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          OTP verification will be done next
        </p>
      </div>
    </form>
  );
}
