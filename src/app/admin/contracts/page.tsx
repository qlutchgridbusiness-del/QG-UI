"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PendingContract = {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  submittedAt: string;
};

export default function PendingContractsPage() {
  const [contracts, setContracts] = useState<PendingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: replace with real API
    setTimeout(() => {
      setContracts([
        {
          id: "b1",
          businessName: "QuickFix Garage",
          ownerName: "Ramesh Kumar",
          phone: "9876543210",
          submittedAt: "2025-12-15",
        },
        {
          id: "b2",
          businessName: "AutoCare Pro",
          ownerName: "Suresh Rao",
          phone: "9123456789",
          submittedAt: "2025-12-14",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="p-6">Loading pending contracts…</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-semibold">Pending Contracts</h1>
        <span className="text-sm text-gray-500">
          {contracts.length} pending
        </span>
      </div>

      {/* List */}
      <div className="space-y-4">
        {contracts.map((c) => (
          <div key={c.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Info */}
              <div className="space-y-1">
                <div className="text-lg font-medium text-gray-900">
                  {c.businessName}
                </div>
                <div className="text-sm text-gray-600">
                  Owner: {c.ownerName}
                </div>
                <div className="text-sm text-gray-600">Phone: {c.phone}</div>
                <div className="text-xs text-gray-400">
                  Submitted on {c.submittedAt}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <button
                  onClick={() => router.push(`/admin/business/${c.id}`)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  View
                </button>

                <button
                  onClick={() => alert("Contract approved")}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => alert("Contract rejected")}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {contracts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No pending contracts 🎉
          </div>
        )}
      </div>
    </div>
  );
}
