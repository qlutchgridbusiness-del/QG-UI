"use client";
import React, { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "@/app/firebase/firebaseConfig";
import axios from "axios";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [idToken, setIdToken] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }

    const formatted = phone.startsWith("+91") ? phone : `+91${phone}`;

    const confirmation = await signInWithPhoneNumber(
      auth,
      formatted,
      window.recaptchaVerifier
    );

    setConfirmationResult(confirmation);
    alert("OTP sent!");
  };

  const verifyOtp = async () => {
    const result = await confirmationResult.confirm(otp);
    const token = await result.user.getIdToken();
    setIdToken(token);
    alert("Verification successful!");
  };

  const handleLogin = async () => {
    if (!idToken) return alert("Please verify phone first");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", { phone, idToken });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("businessId", res.data.business?.id);
      localStorage.setItem("userRole", res.data.user.role);

      window.location.href =
        res.data.user.role === "business"
          ? "/business-dashboard"
          : "/user-dashboard";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center px-4">
      <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>

        <div className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70
                       border border-white/30 focus:ring-2 focus:ring-blue-300"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={sendOtp}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            Send OTP
          </button>

          <input
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={verifyOtp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Verify OTP
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white text-lg font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-white/80 text-sm mt-3">
            Don't have an account?{" "}
            <a href="auth/register" className="text-white underline">
              Register
            </a>
          </p>
        </div>

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
