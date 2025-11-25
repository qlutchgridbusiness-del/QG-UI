"use client";
import React, { useState } from "react";
import {
  auth,
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
    const formattedPhone = `${phone}`;
    const confirmation = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      window.recaptchaVerifier
    );
    setConfirmationResult(confirmation);
    alert("OTP sent!");
  };

  const verifyOtp = async () => {
    const result = await confirmationResult.confirm(otp);
    const token = await result.user.getIdToken();
    setIdToken(token);
    alert("Phone verified!");
  };

const handleLogin = async () => {
  if (!idToken) return alert("Please verify phone first");
  setLoading(true);
  try {
    const res = await axios.post("http://3.230.169.3:5001/auth/login", {
      phone,
      idToken,
    });

    console.log("checklogindata", res.data);
    // Store all data
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("businessId", res.data.business?.id);

    const role = res.data.user.role;
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", res.data.user.email);

    if (role === "business") {
      window.location.href = "/business-dashboard";
    } else {
      window.location.href = "/user-dashboard";
    }
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <div className="space-y-3">
          <input
            className="w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
            placeholder="Phone (10 digits)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={sendOtp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Send OTP
            </button>
            <div id="recaptcha-container"></div>
          </div>

          <input
            className="w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-400"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            onClick={verifyOtp}
            className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold"
          >
            Verify OTP
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white text-lg font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-600 text-sm mt-3">
            Don’t have an account?{" "}
            <a
              href="/auth/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
