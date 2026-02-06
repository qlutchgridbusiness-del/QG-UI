"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          These terms govern your use of QlutchGrid as a business partner. By
          accepting, you confirm that all information provided is accurate and
          you agree to comply with platform policies and local regulations.
        </p>

        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300">
          <p>
            1. You confirm you are authorized to operate the business and submit
            documentation for verification.
          </p>
          <p>
            2. You agree to provide accurate service pricing, availability, and
            customer communications.
          </p>
          <p>
            3. QlutchGrid may suspend or deactivate accounts that violate
            policies, submit false information, or fail verification.
          </p>
          <p>
            4. Payments for plans are non-refundable unless stated otherwise.
          </p>
          <p>
            5. You consent to digital signature acceptance and electronic
            record-keeping for onboarding.
          </p>
        </div>
      </div>
    </div>
  );
}
