"use client";
import { useMemo, useState } from "react";
import { apiPost } from "@/app/lib/api";

const PLANS = [
  { id: "STARTER", name: "Starter Plan", price: 0 },
  { id: "STANDARD", name: "Standard Plan", price: 15000 },
  { id: "GROWTH", name: "Growth Plan", price: 100000 },
  { id: "ELITE", name: "Premier Partner Plan", price: 5999 },
];

type BusinessPlanSelectionProps = {
  businessId?: string | null;
  onActivated?: () => void;
};

export default function PlansPage({
  businessId: businessIdProp,
  onActivated,
}: BusinessPlanSelectionProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const businessId = useMemo(() => {
    if (businessIdProp) return businessIdProp;
    if (typeof window === "undefined") return null;
    return localStorage.getItem("businessId");
  }, [businessIdProp]);

  async function selectPlan(planId: string) {
    if (!businessId) {
      setError("Business not found. Please complete registration first.");
      return;
    }

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("tempToken")
        : undefined;

    setError(null);
    setLoadingPlan(planId);

    try {
      // Free plan: skip order creation and just activate
      if (plan.price === 0) {
        await apiPost(
          "/payments/plan/verify",
          { businessId, planId, free: true },
          token ?? undefined
        );
        if (onActivated) onActivated();
        else window.location.href = "/business-dashboard";
        return;
      }

      const res = await apiPost(
        "/payments/plan/create-order",
        { businessId, planId },
        token ?? undefined
      );

      const rzp = new (window as any).Razorpay({
        key: res.key,
        order_id: res.orderId,
        amount: res.amount,
        handler: async (response: any) => {
          await apiPost(
            "/payments/plan/verify",
            {
              businessId,
              planId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            token ?? undefined
          );
          if (onActivated) onActivated();
          else window.location.href = "/business-dashboard";
        },
      });

      rzp.open();
    } catch (e: any) {
      setError(e?.message || "Payment failed. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6 sm:grid-cols-2">
      {error && (
        <div className="sm:col-span-2 bg-red-50 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {PLANS.map((p) => (
        <div
          key={p.id}
          className="border border-gray-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {p.name}
          </h3>
          <p className="text-2xl my-3 text-gray-900 dark:text-slate-100">
            ₹{p.price}
          </p>
          <button
            onClick={() => selectPlan(p.id)}
            disabled={loadingPlan === p.id}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-60"
          >
            {loadingPlan === p.id
              ? "Processing..."
              : p.price === 0
              ? "Activate"
              : "Pay & Activate"}
          </button>
        </div>
      ))}
    </div>
  );
}
