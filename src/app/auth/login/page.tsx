"use client";

import { Suspense, useState } from "react";
import { apiGet, apiPost } from "@/app/lib/api";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/app/lib/safeStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

function LoginPageInner() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP" | "ADMIN">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const { login } = useAuth();

  /* -------------------------
     Helpers
  -------------------------- */
  function startCooldown(seconds = 30) {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function isValidPhone(phone: string) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  /* -------------------------
     API calls
  -------------------------- */
  async function sendOtp() {
    setError(null);

    if (!isValidPhone(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/request-otp", { phone });
      setStep("OTP");
      startCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost("/auth/verify-otp", { phone, otp });

      // 🆕 New user → go to register choice
      if (res.isNewUser) {
        const tempToken = res.tempToken ?? res.token ?? "";
        if (tempToken) {
          safeSetItem("tempToken", tempToken);
        }
        safeSetItem("verifiedPhone", phone);
        safeRemoveItem("token");
        safeRemoveItem("user");

        router.push("/auth/register");

        return;
      }

      // Existing user
      safeSetItem("token", res.token);
      safeSetItem("user", JSON.stringify(res.user));
      login(res);

      if (res.user.role === "BUSINESS") {
        try {
          const businessRes = await apiGet("/business/me", res.token);
          const businesses = businessRes?.businesses || businessRes || [];
          const business = Array.isArray(businesses) ? businesses[0] : null;
          if (!business || business.status !== "ACTIVE") {
            router.push("/auth/register/business?pending=1");
            return;
          }
        } catch {
          router.push("/auth/register/business?pending=1");
          return;
        }
      }

      router.push(
        res.user.role === "BUSINESS" ? "/business-dashboard" : "/user-dashboard"
      );
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function adminLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost("/auth/admin-login", {
        email: adminEmail.trim(),
        password: adminPassword,
      });

      safeSetItem("token", res.token);
      safeSetItem("user", JSON.stringify(res.user));
      login(res);
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Admin login failed");
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
          {step === "PHONE"
            ? "Login / Register"
            : step === "OTP"
            ? "Verify OTP"
            : "Admin Login"}
        </h2>

        {registered && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
            Registration completed. Please login to access your profile.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* PHONE STEP */}
        {step === "PHONE" && (
          <>
            <input
              placeholder="Mobile number (10 digits)"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <button
              onClick={() => {
                setStep("ADMIN");
                setError(null);
              }}
              className="w-full text-sm text-gray-500 dark:text-slate-400 hover:underline"
            >
              Admin login
            </button>
          </>
        )}

        {/* OTP STEP */}
        {step === "OTP" && (
          <>
            <input
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg tracking-widest text-center text-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              onClick={sendOtp}
              disabled={cooldown > 0 || loading}
              className="w-full text-sm text-indigo-600 dark:text-indigo-300 hover:underline disabled:text-gray-400 dark:disabled:text-slate-500"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>

            <button
              onClick={() => {
                setStep("PHONE");
                setOtp("");
                setError(null);
              }}
              className="w-full text-sm text-gray-500 dark:text-slate-400 hover:underline"
            >
              Change phone number
            </button>
          </>
        )}

        {step === "ADMIN" && (
          <>
            <input
              placeholder="Admin email"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />

            <input
              placeholder="Admin password"
              type="password"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            <button
              onClick={adminLogin}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </button>

            <button
              onClick={() => {
                setStep("PHONE");
                setError(null);
              }}
              className="w-full text-sm text-gray-500 dark:text-slate-400 hover:underline"
            >
              Back to user login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
