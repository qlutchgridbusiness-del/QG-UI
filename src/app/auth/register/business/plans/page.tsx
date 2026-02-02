"use client";
import { apiPost } from "@/app/lib/api";

const PLANS = [
  { id: "STARTER", name: "Starter Plan", price: 0 },
  { id: "STANDARD", name: "Standard Plan", price: 15000 },
  { id: "GROWTH", name: "Growth Plan", price: 100000 },
  { id: "ELITE", name: "Premier Partner Plan", price: 5999 },
];

export default function PlansPage() {
  async function selectPlan(planId: string) {
    const res = await apiPost("/payments/razorpay/order", { planId });

    if (res.free) {
      await apiPost("/payments/razorpay/verify", {});
      window.location.href = "/business-dashboard";
      return;
    }

    const rzp = new (window as any).Razorpay({
      key: res.key,
      order_id: res.orderId,
      amount: res.amount,
      handler: async (response: any) => {
        await apiPost("/payments/razorpay/verify", response);
        window.location.href = "/business-dashboard";
      },
    });

    rzp.open();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6 sm:grid-cols-2">
      {PLANS.map((p) => (
        <div key={p.id} className="border rounded-xl p-6">
          <h3 className="text-xl font-bold">{p.name}</h3>
          <p className="text-2xl my-3">₹{p.price}</p>
          <button
            onClick={() => selectPlan(p.id)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          >
            {p.price === 0 ? "Activate" : "Pay & Activate"}
          </button>
        </div>
      ))}
    </div>
  );
}
