"use client";

import { CheckCircle } from "lucide-react";

export default function PaymentVerified({
  title = "Payment Verified",
  subtitle = "Your payment was successfully verified by QlutchGrid",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Tick */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl" />
        <CheckCircle
          size={96}
          className="relative text-green-500 animate-scaleIn"
        />
      </div>

      {/* Text */}
      <h2 className="mt-6 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {title}
      </h2>

      <p className="mt-2 text-gray-600 text-center max-w-sm">
        {subtitle}
      </p>

      {/* Brand */}
      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        <img
          src="/qlutchgrid-icon.svg"
          alt="QlutchGrid"
          className="w-5 h-5"
        />
        Secured by QlutchGrid
      </div>
    </div>
  );
}
