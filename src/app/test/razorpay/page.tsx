"use client";

import { useState } from "react";
import { API_BASE } from "@/app/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayTestPage() {
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadScript() {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function pay() {
    setLoading(true);
    setStatus("");

    const ok = await loadScript();
    if (!ok) {
      alert("Razorpay failed to load");
      setLoading(false);
      return;
    }

    // 🔥 SEND RUPEES, NOT PAISE
    const orderRes = await fetch(
      `${API_BASE}/payments/create-order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, // ₹ amount
          purpose: "test_dynamic_payment",
        }),
      }
    );

    const order = await orderRes.json();

    const rzp = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "QlutchGrid",
      description: `Pay ₹${amount}`,
      order_id: order.orderId,
      handler: async (response: any) => {
        const verifyRes = await fetch(
          `${API_BASE}/payments/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          }
        );

        const verify = await verifyRes.json();
        setStatus(
          verify.success ? "✅ Payment verified" : "❌ Verification failed"
        );
        if (verify.success) {
          // ✅ 4️⃣ Redirect to success page
          window.location.href = "/payment/success";
        } else {
          alert("Payment verification failed");
        }
      },
      theme: {
        color: "#4F46E5",
      },
    });

    rzp.open();
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-xl shadow max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold text-center">Razorpay Dynamic Test</h1>

        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Enter amount in ₹"
        />

        <button
          onClick={pay}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
        >
          {loading ? "Processing..." : `Pay ₹${amount}`}
        </button>

        {status && <p className="text-center font-medium text-sm">{status}</p>}
      </div>
    </div>
  );
}
