"use client";

export default function TechStackPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              QlutchGrid Tech Stack
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              High-level overview of the current UI + backend platform stack and
              what each component is used for.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 print:hidden"
          >
            Download as PDF
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Frontend (QG-UI)
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>Next.js 15 (React 18, App Router) — web app framework and routing.</li>
            <li>TypeScript — static typing for safer front‑end development.</li>
            <li>Tailwind CSS v4 — utility‑first styling system.</li>
            <li>Ant Design — ready‑made UI components for forms and tables.</li>
            <li>Axios — API client for calling backend services.</li>
            <li>Framer Motion — animations and UI transitions.</li>
            <li>@react-google-maps/api — maps and location‑based UI.</li>
            <li>Firebase SDK — client‑side messaging and integrations.</li>
            <li>Capacitor (Android) — wraps the web app as a mobile application.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Backend (QG-BackEnd)
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>NestJS 10 (Node.js) — main API framework and service layer.</li>
            <li>TypeScript — typed backend development.</li>
            <li>TypeORM — database ORM and migrations.</li>
            <li>PostgreSQL — primary relational database.</li>
            <li>JWT Auth (passport‑jwt) — authentication and authorization.</li>
            <li>Swagger/OpenAPI — API documentation and testing.</li>
            <li>AWS S3 SDK — file uploads and storage integration.</li>
            <li>Razorpay — plan and booking payments.</li>
            <li>Web Push — browser notifications.</li>
            <li>Firebase Admin SDK — server‑side integrations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Infrastructure & Ops
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>PM2 — Node process manager for uptime and restarts.</li>
            <li>Nginx — reverse proxy and SSL termination.</li>
            <li>Docker (optional) — containerized deployment support.</li>
            <li>Amazon EC2 — current production hosting.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Third-Party Integrations
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-slate-300 space-y-2">
            <li>Surepass KYC APIs — PAN/GST verification during onboarding.</li>
            <li>MSG91 (DLT/SMS) — OTP and transaction messages.</li>
            <li>Razorpay — payment gateway for plans and bookings.</li>
            <li>Web Push (VAPID) — browser push notifications.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
