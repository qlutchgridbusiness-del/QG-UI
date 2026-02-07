"use client";
import { useMemo, useState } from "react";
import { apiPost } from "@/app/lib/api";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter Plan (Pay-as-you-grow)",
    price: 0,
    priceLabel: "20% Flat on Revenue",
    details: [
      "Quick entry plan – simple percentage model",
      "Ideal for small or new businesses",
    ],
  },
  {
    id: "STANDARD",
    name: "Standard Plan (Flat Monthly)",
    price: 15000,
    priceLabel: "₹15,000 per Month",
    details: [
      "Fixed payment model – predictable costs",
      "Ideal for steady-volume partners",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth+ Plan (Performance-based)",
    price: 100000,
    priceLabel: "₹1,00,000 + 5% of Annual Revenue",
    details: [
      "Revenue reward: cross ₹20 L & get ₹50,000 off next year",
      "Ideal for growing partners with large revenue",
    ],
  },
  {
    id: "ELITE",
    name: "Premium Partner Plan (Elite Tier)",
    price: 200000,
    priceLabel: "₹2,00,000 + 1.5% of Annual Revenue",
    details: [
      "Exclusive premium support & priority listing and more",
      "For established businesses above ₹40 L annual revenue",
    ],
  },
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setSuccessMessage(
          "Your registration has been successfully completed. Your profile is under review and we will get back to you within 24–48 hours."
        );
        if (onActivated) setTimeout(() => onActivated(), 2500);
        else setTimeout(() => (window.location.href = "/business-dashboard"), 2500);
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
          setSuccessMessage(
            "Your registration has been successfully completed. Your profile is under review and we will get back to you within 24–48 hours."
          );
          if (onActivated) setTimeout(() => onActivated(), 2500);
          else setTimeout(() => (window.location.href = "/business-dashboard"), 2500);
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
      {successMessage && (
        <div className="sm:col-span-2 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">
          {successMessage}
        </div>
      )}
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
          <p className="text-lg mt-2 text-gray-900 dark:text-slate-100">
            {p.priceLabel}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            One-time onboarding fee: ₹1,499 (waived for Early Access)
          </p>
          <ul className="mt-4 text-sm text-gray-700 dark:text-slate-300 space-y-2">
            {p.details.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
          <button
            onClick={() => selectPlan(p.id)}
            disabled={loadingPlan === p.id}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-60 mt-5"
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
