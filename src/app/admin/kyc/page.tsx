"use client";

import { useEffect, useState } from "react";

type KycBusiness = {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  pancard?: string;
  aadhaarCard?: string;
  gst?: string;
  pancardImage?: string;
  aadhaarImage?: string;
};

export default function AdminKycPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<KycBusiness[]>([]);

  useEffect(() => {
    // 🔴 Replace later with API call
    setTimeout(() => {
      setList([
        {
          id: "1",
          businessName: "Ravi Car Care",
          ownerName: "Ravi Kumar",
          phone: "9876543210",
          status: "PENDING",
          pancard: "ABCDE1234F",
          aadhaarCard: "XXXX XXXX 1234",
          gst: "29ABCDE1234F1Z5",
          pancardImage: "/dummy/pan.png",
          aadhaarImage: "/dummy/aadhaar.png",
        },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setList((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status } : b
      )
    );

    // 🔴 TODO: call backend
    console.log("KYC update", id, status);
  }

  if (loading) {
    return <div className="text-gray-500">Loading KYC requests...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">KYC Requests</h1>

      {list.length === 0 && (
        <div className="text-gray-500">No pending requests 🎉</div>
      )}

      <div className="space-y-4">
        {list.map((b) => (
          <div
            key={b.id}
            className="bg-white border rounded-xl p-4 shadow-sm"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold text-lg">
                  {b.businessName}
                </div>
                <div className="text-sm text-gray-500">
                  Owner: {b.ownerName} • {b.phone}
                </div>
              </div>

              <StatusBadge status={b.status} />
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <Detail label="PAN" value={b.pancard} />
              <Detail label="Aadhaar" value={b.aadhaarCard} />
              <Detail label="GST" value={b.gst || "—"} />
            </div>

            {/* DOCUMENTS */}
            <div className="flex gap-4 mt-4">
              {b.pancardImage && (
                <DocPreview
                  label="PAN"
                  src={b.pancardImage}
                />
              )}
              {b.aadhaarImage && (
                <DocPreview
                  label="Aadhaar"
                  src={b.aadhaarImage}
                />
              )}
            </div>

            {/* ACTIONS */}
            {b.status === "PENDING" && (
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => updateStatus(b.id, "APPROVED")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(b.id, "REJECTED")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatusBadge({ status }: { status: string }) {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${map[status]}`}
    >
      {status}
    </span>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function DocPreview({ label, src }: { label: string; src: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <img
        src={src}
        alt={label}
        className="w-32 h-20 object-cover border rounded-lg"
      />
    </div>
  );
}
