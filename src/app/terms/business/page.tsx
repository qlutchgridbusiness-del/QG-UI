"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

export default function BusinessTermsPage() {
  const [signatureName, setSignatureName] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [signedDate, setSignedDate] = useState<string>("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("business:register");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.name) setBusinessName(data.name);
      }
      const sig = localStorage.getItem("business:signatureName");
      if (sig) setSignatureName(sig);
      const sigUrl = localStorage.getItem("business:signatureUrl");
      if (sigUrl) setSignatureUrl(sigUrl);
      const date = localStorage.getItem("business:signatureDate");
      if (date) setSignedDate(date);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const businessId = localStorage.getItem("businessId");
    if (!token || !businessId) return;
    apiGet(`/business/${businessId}`, token)
      .then((res: any) => {
        if (res?.name) setBusinessName(res.name);
        if (res?.termsSignatureName) setSignatureName(res.termsSignatureName);
        if (res?.termsSignatureUrl) setSignatureUrl(res.termsSignatureUrl);
        if (res?.termsAcceptedAt) {
          setSignedDate(new Date(res.termsAcceptedAt).toLocaleDateString());
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          QlutchGrid Partner Agreement
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Effective Date: {signedDate || "To be filled on acceptance by the Partner"}
        </p>

        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300 leading-6">
          <p>
            This Partner Agreement (“Agreement”) is entered into by and between
            RideLink Innovations Private Limited (operating under the brand
            name “QlutchGrid”) and the undersigned service provider (“Partner”).
          </p>
          <p>
            QlutchGrid operates a technology platform that connects vehicle
            owners with verified third‑party providers of automotive services.
            The Partner desires to be listed on the Platform to offer its
            services and agrees to the terms below.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            1. Definitions
          </h2>
          <p>
            “Applicable Law”, “Confidential Information”, “Intellectual
            Property Rights”, “Platform Data” and “Service Level Agreement (SLA)”
            are defined as per the Agreement provided during onboarding.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            2. Scope & Onboarding
          </h2>
          <p>
            QlutchGrid grants Partner a limited, non‑exclusive, revocable right
            to use the Partner Dashboard for listing, managing, and providing
            services. Partner must provide required documents for verification.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            3. Partner Obligations
          </h2>
          <p>
            Partner warrants lawful operations, accurate information, and
            compliance with all applicable laws. Partner must deliver services
            professionally and honor confirmed bookings.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            4. QlutchGrid Obligations
          </h2>
          <p>
            QlutchGrid provides the Partner Dashboard, markets the platform,
            facilitates payment collection, and provides technical support.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            5. Commercial Terms
          </h2>
          <p>
            Fees and commissions are per the selected plan (Annexure A). Payments
            are settled in T+7 business days from completion, net of applicable
            fees and taxes.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            6. IP & Data Protection
          </h2>
          <p>
            QlutchGrid retains all IP. Partner grants QlutchGrid a license to
            use Partner branding for platform marketing. Platform Data remains
            owned by QlutchGrid and must be protected by Partner.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            7. Confidentiality & Non‑Solicitation
          </h2>
          <p>
            Both parties must protect confidential information. Partner shall
            not bypass the platform to solicit QlutchGrid users directly.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            8. Term & Termination
          </h2>
          <p>
            Initial term is one year with automatic renewals. Termination rights
            apply as per the Agreement, including for cause or convenience.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            9. Liability & Governing Law
          </h2>
          <p>
            Liability is limited to commissions paid in the preceding six
            months. The Agreement is governed by the laws of India with
            jurisdiction in Chennai, Tamil Nadu.
          </p>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Annexure A – Commercial Terms
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Starter Plan (Pay‑as‑you‑grow): 20% flat on revenue — ideal for
              small/new businesses.
            </li>
            <li>
              Standard Plan (Flat Monthly): ₹15,000 per month — predictable
              costs for steady volume.
            </li>
            <li>
              Growth+ Plan (Performance‑based): ₹1,00,000 + 5% annual revenue —
              rewards growth above ₹20L.
            </li>
            <li>
              Premium Partner Plan (Elite Tier): ₹2,00,000 + 1.5% annual revenue
              — priority listing & premium support.
            </li>
          </ul>

          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Annexure B – SLA (Summary)
          </h2>
          <p>
            Partner must acknowledge bookings within 30 minutes, maintain 95%
            on‑time service, keep ratings ≥4.0, limit cancellations to 5%, and
            follow hygiene and safety norms.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p className="font-semibold text-gray-900 dark:text-slate-100">
              Signatures
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  For QlutchGrid (RideLink Innovations Pvt. Ltd.)
                </div>
                <div className="mt-2 text-gray-800 dark:text-slate-200">
                  Name: __________________
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Designation: __________________
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Signature: __________________
                </div>
              </div>
              <div className="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  For Partner
                </div>
                <div className="mt-2 text-gray-800 dark:text-slate-200">
                  Business Name: {businessName || "__________________"}
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Authorized Signatory: {signatureName || "__________________"}
                </div>
                <div className="text-gray-800 dark:text-slate-200">
                  Signature: {signatureName || "__________________"}
                </div>
                {signatureUrl && (
                  <div className="mt-2">
                    <img
                      src={signatureUrl}
                      alt="Digital signature"
                      className="h-16 object-contain border border-gray-200 dark:border-slate-700 rounded bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
