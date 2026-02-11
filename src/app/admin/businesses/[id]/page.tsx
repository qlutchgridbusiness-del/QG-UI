 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE } from "@/app/lib/api";

type Business = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  planId?: string;
  planAmount?: number;
  planStatus?: string;
  planActivatedAt?: string;
  pancard?: string;
  gst?: string;
  aadhaarCard?: string;
  panVerified?: boolean;
  gstVerified?: boolean;
  termsSignatureName?: string;
  termsSignatureUrl?: string;
  termsAcceptedAt?: string;
  owner?: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
  };
};

export default function BusinessDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  async function fetchBusiness() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/admin/businesses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusiness(res.data);
    } catch (err) {
      console.error("Failed to load business", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(action: "activate" | "suspend") {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/admin/businesses/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBusiness();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Action failed. Check logs.");
    }
  }

  async function requestSignatureReupload() {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/admin/businesses/${id}/request-signature`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBusiness();
      alert("Signature re-upload requested.");
    } catch (err) {
      console.error("Failed to request signature re-upload", err);
      alert("Action failed. Check logs.");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!business) return <div className="p-6">Business not found</div>;

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Business Info</h2>
        <p>Name: {business.name}</p>
        <p>Phone: {business.phone || "—"}</p>
        <p>Email: {business.email || "—"}</p>
        <p>Address: {business.address || "—"}</p>
        <p>Status: {business.status}</p>
      </section>

      {/* Owner Info */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Owner</h2>
        <p>Name: {business.owner?.name || "—"}</p>
        <p>Phone: {business.owner?.phone || "—"}</p>
        <p>Email: {business.owner?.email || "—"}</p>
      </section>

      {/* KYC */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">KYC</h2>
        <p>PAN: {business.pancard || "—"}</p>
        <p>GST: {business.gst || "—"}</p>
        <p>Aadhaar: {business.aadhaarCard || "—"}</p>
        <p>PAN Verified: {business.panVerified ? "Yes" : "No"}</p>
        <p>GST Verified: {business.gstVerified ? "Yes" : "No"}</p>
      </section>

      {/* Terms & Signature */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Terms & Signature</h2>
        <p>Signature Name: {business.termsSignatureName || "—"}</p>
        <p>
          Accepted At:{" "}
          {business.termsAcceptedAt
            ? new Date(business.termsAcceptedAt).toLocaleString()
            : "—"}
        </p>
        {business.termsSignatureUrl ? (
          <div className="mt-3">
            <img
              src={business.termsSignatureUrl}
              alt="Signature"
              className="h-24 border rounded bg-white"
            />
            <div className="mt-2">
              <a
                href={business.termsSignatureUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:underline"
              >
                View signature image
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No signature uploaded.</p>
        )}
      </section>

      {/* Plan */}
      <section className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-2">Plan</h2>
        <p>Plan: {business.planId || "—"}</p>
        <p>Amount: {business.planAmount || "—"}</p>
        <p>Status: {business.planStatus || "—"}</p>
        <p>
          Activated At:{" "}
          {business.planActivatedAt
            ? new Date(business.planActivatedAt).toLocaleString()
            : "—"}
        </p>
      </section>

      {/* Final Action */}
      <section className="flex justify-end gap-3">
        <button
          onClick={requestSignatureReupload}
          className="px-4 py-2 bg-amber-600 text-white rounded"
        >
          Request Signature Re-upload
        </button>
        {business.status !== "ACTIVE" && (
          <button
            onClick={() => updateStatus("activate")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Activate Business
          </button>
        )}
        {business.status === "ACTIVE" && (
          <button
            onClick={() => updateStatus("suspend")}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Suspend Business
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded"
        >
          Back
        </button>
      </section>
    </div>
  );
}
