"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";
import { apiGet } from "@/app/lib/api";

/* ================= TYPES ================= */

type Service = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  durationMinutes?: number;
  business: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
  };
};

/* ================= HELPERS ================= */

function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* ================= PAGE ================= */

export default function UserDashboard() {
  const router = useRouter();

  /* ---------- STATE ---------- */
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [pricingType, setPricingType] = useState<
    "" | "FIXED" | "RANGE" | "QUOTE"
  >("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    apiGet("/services")
      .then((res) => setServices(res || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search")?.trim() || "";
    if (!search) return;
    setQuery(search);
  }, [router]);

  /* ================= LOCATION ================= */

  function enableLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }

  /* ================= FILTER ================= */

  const filtered = services.filter((s) => {
    const textMatch =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.business.name.toLowerCase().includes(query.toLowerCase());

    const pricingMatch = !pricingType || s.pricingType === pricingType;

    let basePrice = 0;
    if (s.pricingType === "FIXED") basePrice = s.price ?? 0;
    if (s.pricingType === "RANGE") basePrice = s.minPrice ?? 0;

    const isQuoteLike = s.pricingType === "QUOTE" || s.pricingType === "RANGE";
    const minMatch = !minPrice || isQuoteLike || basePrice >= +minPrice;
    const maxMatch = !maxPrice || isQuoteLike || basePrice <= +maxPrice;

    let radiusMatch = true;
    if (
      radiusKm &&
      userLocation &&
      s.business.latitude &&
      s.business.longitude
    ) {
      radiusMatch =
        distanceInKm(
          userLocation.lat,
          userLocation.lng,
          s.business.latitude,
          s.business.longitude
        ) <= radiusKm;
    }

    return textMatch && pricingMatch && minMatch && maxMatch && radiusMatch;
  });

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* ================= TOP BAR ================= */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services or businesses"
              className="
                w-full pl-10 pr-4 py-3 rounded-xl
                bg-white text-gray-900 placeholder-gray-400
                border shadow-sm focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="p-3 bg-white rounded-xl border shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* ================= SOCIAL CTA ================= */}
        <button
          onClick={() => router.push("/user-dashboard/social")}
          className="w-full mb-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow"
        >
          Explore QG Socials
        </button>

        {/* ================= LIST ================= */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            Loading services…
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    localStorage.setItem(
                      "redirectAfterLogin",
                      `/user-dashboard/bookings/${s.id}`
                    );
                    router.push("/auth/login");
                    return;
                  }
                  router.push(`/user-dashboard/bookings/${s.id}`);
                }}
                className="
    relative
    cursor-pointer
    rounded-2xl
    p-[1px]
    bg-gradient-to-br
    from-sky-400/40
    via-indigo-400/30
    to-orange-300/40
    hover:from-sky-400/70
    hover:to-orange-400/70
    transition
    hover:-translate-y-0.5
  "
              >
                <div
                  className="
      rounded-2xl
      bg-white/70
      backdrop-blur-xl
      p-5
      shadow-sm
      hover:shadow-xl
      transition
      border border-white/40
    "
                >
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.business.name}</p>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {s.durationMinutes ? `${s.durationMinutes} mins` : "—"}
                    </span>

                    <span className="font-bold text-indigo-600">
                      {s.pricingType === "FIXED" && `₹${s.price}`}
                      {s.pricingType === "RANGE" && "Quotation"}
                      {s.pricingType === "QUOTE" && "Quotation"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-16">
                No services found
              </p>
            )}
          </div>
        )}
      </div>

      {/* ================= FILTER SHEET ================= */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>

              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value as any)}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">All pricing types</option>
              <option value="FIXED">Fixed</option>
              <option value="RANGE">Range</option>
              <option value="QUOTE">Quotation</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border rounded-xl px-4 py-3"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border rounded-xl px-4 py-3"
              />
            </div>

            <select
              value={radiusKm ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return setRadiusKm(null);
                if (!userLocation) enableLocation();
                setRadiusKm(+v);
              }}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setPricingType("");
                  setMinPrice("");
                  setMaxPrice("");
                  setRadiusKm(null);
                }}
                className="flex-1 border rounded-xl py-3"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-indigo-600 text-white rounded-xl py-3"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
