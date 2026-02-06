// src/app/privacy-policy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 sm:p-8 space-y-6 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">
        Effective Date: July 20, 2025
      </p>

      <p>
        QlutchGrid, operated by RideLink Innovations Private Limited (“we”, “us”, or “our”),
        is committed to protecting your privacy.
      </p>

      <h2 className="font-semibold text-xl">1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Personal Data: Name, email, mobile number, user type</li>
        <li>Booking Information</li>
        <li>Device and Usage Data</li>
        <li>Communication Data (WhatsApp, support)</li>
      </ul>

      <h2 className="font-semibold text-xl">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Account management</li>
        <li>Booking & payments</li>
        <li>Notifications & reminders</li>
        <li>Legal compliance</li>
      </ul>

      <h2 className="font-semibold text-xl">9. Contact Us</h2>
      <p>
        RideLink Innovations Private Limited<br />
        INNOV8 Millenia, RMZ Millenia Business Park<br />
        Chennai, Tamil Nadu – 600096<br />
        Email: business@qlutchgrid.com
      </p>
      </div>
    </div>
  );
}
