// src/app/admin/businesses/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/app/lib/api";

type Business = {
  id: string;
  name: string;
  status: string;
  address?: string;
  city?: string;
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Businesses</h1>

      {loading ? (
        <div className="text-sm text-gray-500">Loading businesses…</div>
      ) : businesses.length === 0 ? (
        <div className="text-sm text-gray-500">No businesses found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {businesses.map((b) => (
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
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    b.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : b.status.includes("KYC")
                      ? "bg-yellow-100 text-yellow-700"
                      : b.status === "SUSPENDED" ||
                        b.status === "DEACTIVATED" ||
                        b.status.includes("REJECT")
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                  onClick={() => console.log("View business", b.id)}
                >
                  View
                </button>

                {b.status !== "ACTIVE" && (
                  <button
                    className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200"
                    onClick={() => console.log("Approve business", b.id)}
                  >
                    Approve
                  </button>
                )}

                {b.status !== "REJECTED" && (
                  <button
                    className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => console.log("Reject business", b.id)}
                  >
                    Reject
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
