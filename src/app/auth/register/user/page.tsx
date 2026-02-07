"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function UserRegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  /* -------------------------
     INIT: load temp auth state
  -------------------------- */
  useEffect(() => {
    const p = localStorage.getItem("verifiedPhone");
    const t = localStorage.getItem("tempToken");

    if (!p || !t) {
      router.replace("/auth/login");
      return;
    }

    setPhone(p);
    setTempToken(t);
  }, [router]);

  /* -------------------------
     Submit registration
  -------------------------- */
  async function submitRegistration() {
    setError(null);

    if (!phone || !tempToken) {
      setError("Session expired. Please login again.");
      return;
    }

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost(
        "/auth/register",
        {
          role: "user",
          phone, // backend will cross-check with token
          name: form.name.trim(),
          email: form.email?.trim() || undefined,
        },
        tempToken // 👈 temp JWT (NOT full auth token)
      );

      // 🔐 Cleanup temp auth
      localStorage.removeItem("tempToken");
      localStorage.removeItem("verifiedPhone");

      // ✅ Save real auth
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      router.replace("/user-dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     UI
  -------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow w-full max-w-md space-y-5 border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-slate-100">
          Complete Profile
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <input
          placeholder="Full name"
          className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email (optional)"
          className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          I agree to the Terms & Conditions
        </label>
        <a
          href="/terms"
          className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
        >
          Read User Terms & Conditions
        </a>

        <button
          onClick={submitRegistration}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
