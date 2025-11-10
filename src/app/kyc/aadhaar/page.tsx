"use client";
import { apiPost } from "@/app/lib/api";
import { useState } from "react";

export default function AadhaarKyc() {
  const [aadhaar, setAadhaar] = useState("");

  const requestOtp = async () => {
    await apiPost("/kyc/aadhaar/request-otp", { aadhaar });
    alert("OTP sent to Aadhaar-linked mobile");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Aadhaar Verification</h2>
      <input
        value={aadhaar}
        onChange={(e) => setAadhaar(e.target.value)}
        placeholder="Enter Aadhaar Number"
        className="border p-2 w-full mb-4"
      />
      <button onClick={requestOtp} className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
        Request OTP
      </button>
    </div>
  );
}
