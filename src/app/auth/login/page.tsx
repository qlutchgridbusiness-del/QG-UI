"use client";

import { useState } from "react";
import { apiPost } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
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

      // 🆕 New user → go to register with tempToken
      if (res.isNewUser) {
        login(res);

        router.push(
          res.user.role === "BUSINESS"
            ? "/business-dashboard"
            : "/user-dashboard"
        );

        return;
      }

      // Existing user
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      router.push(
        res.user.role === "BUSINESS" ? "/business-dashboard" : "/user-dashboard"
      );
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     UI
  -------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center">
          {step === "PHONE" ? "Login / Register" : "Verify OTP"}
        </h2>

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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
          </>
        )}

        {/* OTP STEP */}
        {step === "OTP" && (
          <>
            <input
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 border rounded-lg tracking-widest text-center text-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full text-sm text-indigo-600 hover:underline disabled:text-gray-400"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>

            <button
              onClick={() => {
                setStep("PHONE");
                setOtp("");
                setError(null);
              }}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Change phone number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
