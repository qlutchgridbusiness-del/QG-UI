"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/app/lib/api";

type Business = {
  id: string;
  name: string;
  address?: string;
};

type Service = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  durationMinutes?: number;
};

export default function BusinessProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await apiGet(`/services?businessId=${id}`);
      if (data?.length) {
        setServices(data);
        setBusiness(data[0].business);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading business…</div>;
  }

  if (!business) {
    return <div className="text-center py-20 text-gray-500">Business not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">{business.name}</h1>
          {business.address && (
            <p className="text-gray-500 mt-1">{business.address}</p>
          )}
        </div>

        {/* ✅ PUBLIC SOCIAL */}
        <button
          onClick={() => router.push(`/business/${id}/social`)}
          className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm"
        >
          View Business Feed →
        </button>
      </div>

      {/* SERVICES */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Services</h2>

        <div className="space-y-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-sm text-gray-500">
                  {s.durationMinutes ? `${s.durationMinutes} mins` : "—"}
                </p>
              </div>

              <div className="text-right">
                <div className="font-bold text-indigo-600">
                  {s.pricingType === "FIXED" && `₹${s.price}`}
                  {s.pricingType === "RANGE" && `₹${s.minPrice} – ₹${s.maxPrice}`}
                  {s.pricingType === "QUOTE" && "Quotation"}
                </div>

                <button
                  onClick={() => router.push(`/user-dashboard/bookings/${s.id}`)}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                >
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
