// src/app/admin/businesses/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/app/lib/api";
import { useRouter } from "next/navigation";

type Business = {
  id: string;
  name: string;
  status: string;
  address?: string;
  city?: string;
  termsSignatureUrl?: string | null;
  termsAcceptedAt?: string | null;
  owner?: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
  };
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/admin/businesses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Adjust based on API response shape
        setBusinesses(res.data.businesses || res.data);
      } catch (err) {
        console.error("Failed to fetch businesses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  async function updateStatus(id: string, action: "activate" | "suspend") {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/admin/businesses/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: action === "activate" ? "ACTIVE" : "SUSPENDED",
              }
            : b
        )
      );
    } catch (err) {
      console.error("Failed to update business", err);
      alert("Action failed. Check logs.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Businesses</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPendingOnly((v) => !v)}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              showPendingOnly
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {showPendingOnly ? "Showing Pending Only" : "Show Pending Only"}
          </button>
          <span className="text-sm text-gray-500">
            {businesses.length} total
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading businesses…</div>
      ) : businesses.length === 0 ? (
        <div className="text-sm text-gray-500">No businesses found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {businesses
            .filter((b) => (showPendingOnly ? b.status !== "ACTIVE" : true))
            .map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow p-4 space-y-3"
            >
              {/* Business Info */}
              <div>
                <p className="text-lg font-semibold">{b.name}</p>
                <p className="text-sm text-gray-500">
                  Owner: {b.owner?.name || "—"} · {b.address || b.city || "—"}
                </p>
                <p className="text-xs text-gray-400">
                  {b.owner?.phone || "—"} • {b.owner?.email || "—"}
                </p>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    b.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : b.status === "CONTRACT_PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : b.status.includes("KYC")
                      ? "bg-yellow-100 text-yellow-700"
                      : b.status === "SUSPENDED" ||
                        b.status === "DEACTIVATED" ||
                        b.status.includes("REJECT")
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b.status === "CONTRACT_PENDING"
                    ? "Application Pending"
                    : b.status.replaceAll("_", " ")}
                </span>
                {(!b.termsSignatureUrl || !b.termsAcceptedAt) && (
                  <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Signature Pending
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                  onClick={() => router.push(`/admin/businesses/${b.id}`)}
                >
                  View
                </button>

                {b.status !== "ACTIVE" && (
                  <button
                    className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200"
                    onClick={() => updateStatus(b.id, "activate")}
                  >
                    Approve
                  </button>
                )}

                {b.status === "ACTIVE" && (
                  <button
                    className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => updateStatus(b.id, "suspend")}
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
