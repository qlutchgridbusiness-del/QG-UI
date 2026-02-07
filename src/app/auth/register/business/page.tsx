"use client";
import React, { useEffect, useState, useRef } from "react";
import { apiPost, apiGet, apiPut } from "@/app/lib/api"; // your file earlier
import { UploadCard } from "@/app/business-dashboard/components/UploadCard";
import BusinessPlanSelection from "./plans/page";

type ServiceRow = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTATION";
  price?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isQuotation?: boolean;
  durationMinutes?: number;
  available?: boolean;
};

type BusinessPayload = {
  name: string;
  phone: string;
  email?: string;
  category?: string[];
  address?: string;
  latitude?: string;
  longitude?: string;
  pancard?: string;
  aadhaarCard?: string;
  gst?: string;
  openingHours?: object; // shape { mon: {open:true, from:"09:00", to:"18:00"}, ...}
  logoKey?: string | null;
  coverKey?: string | null;

  // UI-only previews
  pancardPreview?: string;
  aadhaarCardPreview?: string;
  logoKeyPreview?: string;
  coverKeyPreview?: string;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const CATEGORIES = [
  "Garage / Mechanic",
  "Painting",
  "Full service",
  "Accident repair",
  "Detailing",
];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* ---------- Main Page ---------- */
export default function BusinessRegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [payload, setPayload] = useState<BusinessPayload>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("business:register")
          : null;

      return raw
        ? JSON.parse(raw)
        : {
            name: "",
            phone: "",
            email: "",
            category: [],
            address: "",
            latitude: "",
            longitude: "",
            pancard: "",
            aadhaarCard: "",
            gst: "",
            openingHours: {},
            logoKey: null,
            coverKey: null,
          };
    } catch {
      return {} as BusinessPayload;
    }
  });

  const [services, setServices] = useState<ServiceRow[]>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("business:services")
          : null;
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: uid("s_"),
              name: "",
              price: null,
              minPrice: null,
              maxPrice: null,
              durationMinutes: 30,
              available: true,
            },
          ];
    } catch (e) {
      return [
        {
          id: uid("s_"),
          name: "",
          price: null,
          minPrice: null,
          maxPrice: null,
          durationMinutes: 30,
          available: true,
        },
      ];
    }
  });

  const [hydrated, setHydrated] = useState(false);
  const [kycStatus, setKycStatus] = useState<{
    panVerified: boolean;
    gstVerified: boolean;
    status?: string;
  } | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [termsSubmitting, setTermsSubmitting] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [termsSubmitted, setTermsSubmitted] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    // save draft locally
    localStorage.setItem("business:register", JSON.stringify(payload));
  }, [payload]);

  useEffect(() => {
    localStorage.setItem("business:services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tempToken = localStorage.getItem("tempToken");
    if (!token && !tempToken) {
      // save intent
      localStorage.setItem("redirectAfterLogin", "/auth/register/business");
      window.location.href = "/auth/login";
    }
  }, []);

  useEffect(() => {
    if (addressQuery.length < 3) {
      setAddressResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            addressQuery
          )}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setAddressResults(data);
      } catch (err) {
        if (!(err instanceof DOMException)) {
          console.error(err);
        }
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [addressQuery]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const existing = localStorage.getItem("businessId");
    if (existing) {
      setSavedBusinessId(existing);
    }
  }, []);

  useEffect(() => {
    if (payload.address) {
      setAddressQuery(payload.address);
    }
  }, [payload.address]);

  useEffect(() => {
    if (step === 2 && savedBusinessId) {
      fetchKycStatus(savedBusinessId);
    }
  }, [step, savedBusinessId]);

  useEffect(() => {
    if (step === 6 && savedBusinessId) {
      fetchKycStatus(savedBusinessId);
      loadTermsStatus(savedBusinessId);
      if (!signatureName.trim() && payload?.name?.trim()) {
        setSignatureName(payload.name.trim());
      }
    }
  }, [step, savedBusinessId]);

  if (!hydrated) return null;

  function getAuthToken() {
    return localStorage.getItem("token") || localStorage.getItem("tempToken");
  }

  function isValidPan(pan: string) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  function isValidGst(gst: string) {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      gst
    );
  }

  async function ensureBusinessId() {
    if (savedBusinessId) return savedBusinessId;

    const authToken = getAuthToken();
    if (!authToken) {
      window.location.href = "/auth/login";
      return null;
    }

    if (!payload.name?.trim()) {
      setKycError("Business name is required before verification");
      return null;
    }

    const res = await apiPost("/business", payload, authToken);
    const id = res.id;
    setSavedBusinessId(id);
    localStorage.setItem("businessId", id);
    return id;
  }

  async function fetchKycStatus(businessId: string) {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      const res = await apiGet(`/business/${businessId}/kyc/status`, authToken);
      setKycStatus({
        panVerified: Boolean(res.panVerified),
        gstVerified: Boolean(res.gstVerified),
        status: res.status,
      });
    } catch {
      setKycStatus(null);
    }
  }

  async function verifyPan() {
    setKycError(null);
    if (!payload.pancard?.trim()) {
      setKycError("Please enter PAN number first");
      return;
    }
    if (!isValidPan(payload.pancard.trim())) {
      setKycError("PAN format looks invalid. Example: ABCDE1234F");
      return;
    }

    setKycLoading(true);
    try {
      const businessId = await ensureBusinessId();
      if (!businessId) return;
      const authToken = getAuthToken();
      await apiPost(
        `/business/${businessId}/kyc/pan`,
        { pan: payload.pancard.trim() },
        authToken ?? undefined
      );
      await fetchKycStatus(businessId);
    } catch (e: any) {
      setKycError(e?.message || "PAN verification failed");
    } finally {
      setKycLoading(false);
    }
  }

  async function verifyGst() {
    setKycError(null);
    if (!payload.gst?.trim()) {
      setKycError("Please enter GST ID first");
      return;
    }
    if (!isValidGst(payload.gst.trim().toUpperCase())) {
      setKycError("GST format looks invalid. Example: 22AAAAA0000A1Z5");
      return;
    }

    setKycLoading(true);
    try {
      const businessId = await ensureBusinessId();
      if (!businessId) return;
      const authToken = getAuthToken();
      await apiPost(
        `/business/${businessId}/kyc/gst`,
        { gst: payload.gst.trim() },
        authToken ?? undefined
      );
      await fetchKycStatus(businessId);
    } catch (e: any) {
      setKycError(e?.message || "GST verification failed");
    } finally {
      setKycLoading(false);
    }
  }

  async function loadTermsStatus(businessId: string) {
    const authToken = getAuthToken();
    if (!authToken) return;
    try {
      const res = await apiGet(`/business/${businessId}`, authToken);
      if (res?.termsAcceptedAt && res?.termsSignatureName) {
        setTermsAccepted(true);
        setSignatureName(res.termsSignatureName);
        setTermsSubmitted(true);
      }
    } catch {
      // ignore
    }
  }

  async function submitTerms() {
    setTermsError(null);
    if (!termsAccepted) {
      setTermsError("Please accept the terms and conditions");
      return;
    }
    if (!signatureName.trim()) {
      setTermsError("Please enter your full name as signature");
      return;
    }

    setTermsSubmitting(true);
    try {
      const businessId = await ensureBusinessId();
      if (!businessId) return;
      const authToken = getAuthToken();
      await apiPost(
        `/business/${businessId}/terms`,
        { signatureName: signatureName.trim() },
        authToken ?? undefined
      );
      localStorage.setItem("business:signatureName", signatureName.trim());
      localStorage.setItem(
        "business:signatureDate",
        new Date().toLocaleDateString()
      );
      setTermsSubmitted(true);
    } catch (e: any) {
      setTermsError(e?.message || "Failed to submit terms");
    } finally {
      setTermsSubmitting(false);
    }
  }

  /* ---------- Step handlers ---------- */
  function updatePayload(partial: Partial<BusinessPayload>) {
    setPayload((p) => ({ ...p, ...partial }));
  }

  function next() {
    if (step === 2 && !kycStatus?.panVerified) {
      setStepError("Please verify PAN before continuing.");
      return;
    }

    setStepError(null);
    setStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Services helpers ---------- */
  function addService() {
    setServices((s) => [
      ...s,
      {
        id: uid("s_"),
        name: "",
        price: null,
        minPrice: null,
        maxPrice: null,
        durationMinutes: 30,
        available: true,
      },
    ]);
  }
  function updateService(id: string, patch: Partial<ServiceRow>) {
    setServices((list) =>
      list.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }
  function removeService(id: string) {
    setServices((list) => list.filter((r) => r.id !== id));
  }
  function maskPan(pan: string) {
    if (pan.length < 5) return pan;
    return pan.slice(0, 2) + "XXXXX" + pan.slice(-2);
  }

  function maskAadhaar(aadhaar: string) {
    const digits = aadhaar.replace(/\s+/g, "");
    if (digits.length < 4) return aadhaar;
    return "XXXX XXXX " + digits.slice(-4);
  }

  function handleSelectAddress(result: any) {
    updatePayload({
      address: result.display_name,
      latitude: result.lat,
      longitude: result.lon,
    });

    setAddressQuery(result.display_name);
    setAddressResults([]);
  }

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();

          updatePayload({
            address: data.display_name || "Current location",
            latitude: String(lat),
            longitude: String(lon),
          });

          setAddressQuery(data.display_name || "");
          setAddressResults([]);
        } catch {
          updatePayload({
            address: "Current location",
            latitude: String(lat),
            longitude: String(lon),
          });
        }
      },
      () => alert("Unable to fetch location")
    );
  }

  async function handleFileUpload(
    file: File,
    field: "logoKey" | "coverKey" | "pancard" | "aadhaarCard"
  ) {
    if (!file) return;

    // Generate local preview
    const previewUrl = URL.createObjectURL(file);

    // Save preview + store the file's name (you will replace this with S3)
    setPayload((prev) => ({
      ...prev,
      [field]: file.name, // TEMP VALUE
      [`${field}Preview`]: previewUrl, // Shows on UI
    }));

    console.log(`TEMP uploaded for ${field}:`, previewUrl);
  }

  async function submitAll() {
    const hasValidService = services.some((s) => s.name?.trim());
    if (!hasValidService) {
      alert("Please add at least one service");
      return;
    }

    setSubmitting(true);
    try {
      const authToken =
        localStorage.getItem("token") || localStorage.getItem("tempToken");
      if (!authToken) {
        alert("Session expired. Please login again.");
        window.location.href = "/auth/login";
        return;
      }

      let businessId = savedBusinessId;

      if (!businessId) {
        const res = await apiPost("/business", payload, authToken);
        businessId = res.id;
        setSavedBusinessId(businessId);
        localStorage.setItem("businessId", businessId);
      } else {
        await apiPut(`/business/${businessId}`, payload, authToken);
      }

      await apiPost(
        `/business/${businessId}/services`,
        {
          services: services.map((s) => ({
            name: s.name,
            pricingType: s.pricingType,
            price: s.price,
            minPrice: s.minPrice,
            maxPrice: s.maxPrice,
            durationMinutes: s.durationMinutes,
            available: s.available,
          })),
        },
        authToken
      );

      // 👇 MOVE TO PLAN SELECTION
      setStep(6);
    } catch (e) {
      alert("Failed to submit business");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- UI per step ---------- */
  return (
    <div
      className="
    min-h-screen bg-white dark:bg-slate-950
    px-4 py-6
    lg:bg-gradient-to-br lg:from-gray-50 lg:to-gray-100 dark:lg:from-slate-950 dark:lg:to-slate-900
    sm:px-6 lg:px-4 lg:py-12
  "
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800">
        <div className="grid grid-cols-12">
          {/* left visual panel */}
          <div className="col-span-12 lg:col-span-4 hidden lg:block bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white p-8 bg-white/95 backdrop-blur rounded-xl">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Business Onboarding</h2>
              <p className="text-sm opacity-90">
                Welcome! We'll guide you through 5 quick steps to register your
                garage services and start receiving bookings.
              </p>

              <div className="bg-white/10 p-4 rounded-xl">
                <ol className="space-y-3">
                  {[
                    "Basics",
                    "KYC",
                    "Hours",
                    "Media",
                    "Services",
                    "Plan & Payment",
                  ].map((label, i) => {
                    const idx = i + 1;
                    const active = step === idx;
                    return (
                      <li
                        key={label}
                        className={`flex items-start gap-3 ${
                          active ? "text-white" : "text-white/90"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            active
                              ? "bg-white/20 ring-2 ring-white"
                              : "bg-white/5"
                          }`}
                        >
                          {idx}
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{label}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div>
                <div className="text-xs opacity-90">Progress</div>
                <div className="w-full bg-white/20 h-2 rounded mt-2">
                  <div
                    className="h-2 bg-white rounded"
                    style={{ width: `${(step / 6) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-xs opacity-80">
                <div>
                  <strong>Tip:</strong> You can save progress anytime — we
                  autosave to your browser.
                </div>
              </div>
            </div>
          </div>

          {/* right content panel */}
          <div className="col-span-12 lg:col-span-8 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Step {step} / 6</h3>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {submitting ? "Saving..." : "Draft saved locally"}
                </div>
              </div>

              {/* Step content */}
              {step === 1 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Business basics</h4>

                  {/* Mobile: 1 col | Desktop: 2 col */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={payload.name || ""}
                      onChange={(e) => updatePayload({ name: e.target.value })}
                      placeholder="Business name"
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg
          text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400
          focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                    />

                    <input
                      value={payload.phone || ""}
                      onChange={(e) => updatePayload({ phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg
          text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400
          focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                    />

                    <input
                      value={payload.email || ""}
                      onChange={(e) => updatePayload({ email: e.target.value })}
                      placeholder="Email"
                      className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg
          text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400
          focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                    />

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium mb-2 block">
                        Select services offered
                      </label>

                      <div className="flex flex-wrap gap-3">
                        {CATEGORIES.map((cat) => {
                          const selected = payload.category?.includes(cat);

                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                const current = payload.category || [];
                                const updated = selected
                                  ? current.filter((c) => c !== cat)
                                  : [...current, cat];

                                updatePayload({ category: updated });
                              }}
                              className={`
            px-4 py-2 rounded-full border text-sm transition
            ${
              selected
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 dark:text-slate-300 border-gray-300 hover:border-indigo-400"
            }
          `}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                        You can select multiple categories
                      </p>
                    </div>

                    {/* Address always full width */}
                    <div className="relative">
                      <input
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        placeholder="Search area, street, landmark…"
                        className="w-full p-3 pl-10 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />

                      {addressResults.length > 0 && (
                        <ul className="absolute z-20 bg-white border border-gray-300 dark:border-slate-700 rounded-lg mt-1 w-full shadow max-h-60 overflow-auto">
                          {addressResults.map((r, i) => (
                            <li
                              key={i}
                              onClick={() => handleSelectAddress(r)}
                              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            >
                              {r.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-2"
                    >
                      📍 Use my current location
                    </button>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">KYC Verification</h4>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm mb-1 block">PAN Number</label>
                      <input
                        value={payload.pancard || ""}
                        onChange={(e) =>
                          updatePayload({
                            pancard: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ABCDE1234F"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                      {payload.pancard && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          Stored as: {maskPan(payload.pancard)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm mb-1 block">
                        GST ID (optional)
                      </label>
                      <input
                        value={payload.gst || ""}
                        onChange={(e) =>
                          updatePayload({ gst: e.target.value.toUpperCase() })
                        }
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        Optional — recommended for GST‑registered businesses.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm mb-1 block">
                        Aadhaar Number
                      </label>
                      <input
                        value={payload.aadhaarCard || ""}
                        onChange={(e) =>
                          updatePayload({ aadhaarCard: e.target.value })
                        }
                        placeholder="XXXX XXXX 1234"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                      {payload.aadhaarCard && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          Stored as: {maskAadhaar(payload.aadhaarCard)}
                        </p>
                      )}
                    </div>
                  </div>

                  {kycError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {kycError}
                    </div>
                  )}

                  {/* Verification status */}
                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-4 bg-gray-50 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">PAN Verification</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {payload.pancard
                            ? `Entered: ${maskPan(payload.pancard)}`
                            : "Not entered"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          kycStatus?.panVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {kycStatus?.panVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={verifyPan}
                      disabled={
                        !payload.pancard || kycLoading || kycStatus?.panVerified
                      }
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
                    >
                      {kycLoading
                        ? "Verifying..."
                        : kycStatus?.panVerified
                        ? "PAN Verified"
                        : "Verify PAN"}
                    </button>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          GST Verification (Optional)
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {payload.gst
                            ? `Entered: ${payload.gst}`
                            : "Not entered"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          kycStatus?.gstVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {kycStatus?.gstVerified ? "Verified" : "Optional"}
                      </span>
                    </div>

                    {payload.gst && (
                      <button
                        type="button"
                        onClick={verifyGst}
                        disabled={kycLoading || kycStatus?.gstVerified}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
                      >
                        {kycLoading
                          ? "Verifying..."
                          : kycStatus?.gstVerified
                          ? "GST Verified"
                          : "Verify GST"}
                      </button>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Aadhaar</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {payload.aadhaarCard
                            ? `Entered: ${maskAadhaar(payload.aadhaarCard)}`
                            : "Not entered"}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:text-slate-300">
                        Verification pending
                      </span>
                    </div>
                  </div>

                  {/* Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UploadCard
                      label="PAN Card Image"
                      preview={(payload as any).pancardPreview}
                      onUpload={(file) => handleFileUpload(file, "pancard")}
                    />

                    <UploadCard
                      label="Aadhaar Image (Front / Back)"
                      preview={(payload as any).aadhaarCardPreview}
                      onUpload={(file) => handleFileUpload(file, "aadhaarCard")}
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                    🔒 Your documents are encrypted and used only for
                    verification
                  </p>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Operating Hours</h4>

                  {/* DAY SELECTOR */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                      Select working days
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const isOpen = payload.openingHours?.[d]?.open;

                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...payload.openingHours,
                                [d]: {
                                  ...(payload.openingHours?.[d] || {}),
                                  open: !isOpen,
                                  from:
                                    payload.openingHours?.[d]?.from || "09:00",
                                  to: payload.openingHours?.[d]?.to || "18:00",
                                },
                              };
                              updatePayload({ openingHours: updated });
                            }}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium border transition
                ${
                  isOpen
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 dark:text-slate-300 border-gray-300"
                }
              `}
                          >
                            {d.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* WEEKDAY QUICK SET */}
                  <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                    <p className="text-sm font-medium mb-3">
                      Weekday timing (Mon–Fri)
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        onChange={(e) => {
                          const updated = { ...payload.openingHours };
                          ["mon", "tue", "wed", "thu", "fri"].forEach((d) => {
                            if (updated[d]?.open) {
                              updated[d] = {
                                ...updated[d],
                                from: e.target.value,
                              };
                            }
                          });
                          updatePayload({ openingHours: updated });
                        }}
                      />

                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        onChange={(e) => {
                          const updated = { ...payload.openingHours };
                          ["mon", "tue", "wed", "thu", "fri"].forEach((d) => {
                            if (updated[d]?.open) {
                              updated[d] = {
                                ...updated[d],
                                to: e.target.value,
                              };
                            }
                          });
                          updatePayload({ openingHours: updated });
                        }}
                      />
                    </div>
                  </div>

                  {/* WEEKEND QUICK SET */}
                  <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                    <p className="text-sm font-medium mb-3">
                      Weekend timing (Sat–Sun)
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        onChange={(e) => {
                          const updated = { ...payload.openingHours };
                          ["sat", "sun"].forEach((d) => {
                            if (updated[d]?.open) {
                              updated[d] = {
                                ...updated[d],
                                from: e.target.value,
                              };
                            }
                          });
                          updatePayload({ openingHours: updated });
                        }}
                      />

                      <input
                        type="time"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        onChange={(e) => {
                          const updated = { ...payload.openingHours };
                          ["sat", "sun"].forEach((d) => {
                            if (updated[d]?.open) {
                              updated[d] = {
                                ...updated[d],
                                to: e.target.value,
                              };
                            }
                          });
                          updatePayload({ openingHours: updated });
                        }}
                      />
                    </div>
                  </div>

                  {/* PER-DAY OVERRIDE */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Fine-tune per day (optional)
                    </p>

                    {DAYS.map((d) => {
                      const day = payload.openingHours?.[d];
                      if (!day?.open) return null;

                      return (
                        <div
                          key={d}
                          className="flex flex-col sm:flex-row gap-3 items-center border p-3 rounded-lg min-w-0"
                        >
                          <div className="w-full sm:w-20 font-semibold uppercase text-sm">
                            {d}
                          </div>

                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) => {
                              updatePayload({
                                openingHours: {
                                  ...payload.openingHours,
                                  [d]: { ...day, from: e.target.value },
                                },
                              });
                            }}
                            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />

                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) => {
                              updatePayload({
                                openingHours: {
                                  ...payload.openingHours,
                                  [d]: { ...day, to: e.target.value },
                                },
                              });
                            }}
                            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Logo & Cover Image</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Upload your brand logo and a cover image. These will be
                    visible to users while browsing your business.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LOGO */}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "logoKey");
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full text-gray-800 dark:text-slate-100"
                    >
                      {(payload as any).logoKeyPreview
                        ? "Change Logo"
                        : "Upload Logo"}
                    </button>

                    {/* COVER IMAGE */}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "coverKey");
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 w-full text-gray-800 dark:text-slate-100"
                    >
                      {(payload as any).coverKeyPreview
                        ? "Change Cover Image"
                        : "Upload Cover Image"}
                    </button>
                  </div>
                </section>
              )}

              {step === 5 && (
                <section className="space-y-6">
                  {/* Header */}
                  <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Services you offer</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Add services customers can book from your business
                    </p>
                  </div>

                  {/* Services list */}
                  <div className="space-y-2">
                    {services.map((s, index) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-4 space-y-2"
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 dark:text-slate-100">
                            Service {index + 1}
                          </span>
                          <button
                            onClick={() => removeService(s.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Service name */}
                        <input
                          value={s.name}
                          onChange={(e) =>
                            updateService(s.id, { name: e.target.value })
                          }
                          placeholder="Service name (e.g. Interior Cleaning)"
                          className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        />

                        {/* Pricing type */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Pricing type
                          </label>

                          <div className="flex flex-wrap gap-4">
                            {[
                              { key: "FIXED", label: "Fixed price" },
                              { key: "RANGE", label: "Price range" },
                              { key: "QUOTE", label: "Ask for quotation" },
                            ].map((opt) => (
                              <label
                                key={opt.key}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`pricing-${s.id}`}
                                  checked={s.pricingType === opt.key}
                                  onChange={() =>
                                    updateService(s.id, {
                                      pricingType: opt.key as any,
                                      price: null,
                                      minPrice: null,
                                      maxPrice: null,
                                    })
                                  }
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* FIXED PRICE */}
                        {s.pricingType === "FIXED" && (
                          <div>
                            <label className="text-sm text-gray-600 dark:text-slate-400 block mb-1">
                              Fixed price
                            </label>
                            <input
                              type="number"
                              min={0}
                              placeholder="e.g. 699"
                              value={s.price ?? ""}
                              onChange={(e) =>
                                updateService(s.id, {
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                            />
                          </div>
                        )}

                        {/* PRICE RANGE */}
                        {s.pricingType === "RANGE" && (
                          <div className="space-y-4">
                            <div className="text-sm text-gray-700 dark:text-slate-300">
                              Price range:
                              <span className="font-semibold ml-1">
                                ₹{s.minPrice ?? 100} – ₹{s.maxPrice ?? 3000}
                              </span>
                            </div>

                            <div>
                              <label className="text-xs text-gray-500 dark:text-slate-400">
                                Minimum price
                              </label>
                              <input
                                type="range"
                                min={100}
                                max={10000}
                                step={100}
                                value={s.minPrice ?? 100}
                                onChange={(e) =>
                                  updateService(s.id, {
                                    minPrice: Number(e.target.value),
                                  })
                                }
                                className="w-full accent-indigo-600"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500 dark:text-slate-400">
                                Maximum price
                              </label>
                              <input
                                type="range"
                                min={100}
                                max={10000}
                                step={100}
                                value={s.maxPrice ?? 3000}
                                onChange={(e) =>
                                  updateService(s.id, {
                                    maxPrice: Number(e.target.value),
                                  })
                                }
                                className="w-full accent-indigo-600"
                              />
                            </div>

                            <div className="flex justify-between text-xs text-gray-400">
                              <span>₹100</span>
                              <span>₹10,000</span>
                            </div>
                          </div>
                        )}

                        {/* QUOTATION */}
                        {s.pricingType === "QUOTE" && (
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <p className="text-sm text-yellow-800">
                              Customers will request a quote. You can inspect
                              and decide pricing later.
                            </p>
                          </div>
                        )}

                        {/* Duration + availability */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Duration (minutes)
                          </label>

                          <input
                            type="number"
                            min={5}
                            step={5}
                            value={s.durationMinutes}
                            onChange={(e) =>
                              updateService(s.id, {
                                durationMinutes: Number(e.target.value),
                              })
                            }
                            className="w-full sm:w-48 p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={s.available}
                              onChange={(e) =>
                                updateService(s.id, {
                                  available: e.target.checked,
                                })
                              }
                            />
                            Available for booking
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add service */}
                  <button
                    onClick={addService}
                    className="
        w-full
        py-3
        border-2 border-dashed
        border-indigo-400
        text-indigo-600
        rounded-xl
        hover:bg-indigo-50
        font-medium
      "
                  >
                    + Add another service
                  </button>
                </section>
              )}
              {step === 6 && savedBusinessId && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Terms & Plan Selection</h4>

                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 space-y-3">
                    <h5 className="font-semibold text-gray-900 dark:text-slate-100">Verification Summary</h5>
                    <div className="flex items-center justify-between text-sm">
                      <span>PAN</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          kycStatus?.panVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {kycStatus?.panVerified ? "Verified" : "Not verified"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>GST (Optional)</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          kycStatus?.gstVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {kycStatus?.gstVerified ? "Verified" : "Optional"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Aadhaar</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200">
                        {payload.aadhaarCard ? "Entered" : "Not entered"}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 bg-gray-50 dark:bg-slate-900 space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-slate-100">Terms & Conditions</h5>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        Please review and accept the business onboarding terms
                        before choosing a plan. This acts as your digital
                        signature.
                      </p>
                    </div>

                    {termsError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                        {termsError}
                      </div>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                      />
                      I agree to the Terms & Conditions
                    </label>
                    <a
                      href="/terms/business"
                      className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
                    >
                      Read Terms & Conditions
                    </a>

                    <div>
                      <label className="text-sm mb-1 block">
                        Signature (Full Name)
                      </label>
                      <input
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Type your full name"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={submitTerms}
                      disabled={termsSubmitting || termsSubmitted}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
                    >
                      {termsSubmitting
                        ? "Submitting..."
                        : termsSubmitted
                        ? "Terms Accepted"
                        : "Sign & Continue"}
                    </button>
                  </div>

                  {termsSubmitted && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">Choose Your Plan</h4>
                      <BusinessPlanSelection
                        businessId={savedBusinessId}
                        onActivated={() => {
                          localStorage.removeItem("business:register");
                          localStorage.removeItem("business:services");
                          localStorage.removeItem("businessId");
                          localStorage.removeItem("tempToken");
                          localStorage.removeItem("verifiedPhone");
                          window.location.href = "/auth/login?registered=1";
                        }}
                      />
                    </div>
                  )}
                </section>
              )}

              {/* navigation */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800 mt-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  {stepError && (
                    <div className="w-full bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                      {stepError}
                    </div>
                  )}
                  {/* Back */}
                  {step > 1 && (
                    <button
                      onClick={prev}
                      className="w-full sm:w-auto px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300"
                    >
                      Back
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
                    {/* Save draft – ONLY for steps 1–4 */}
                    {step < 5 && (
                      <button
                        onClick={() => {
                          localStorage.setItem(
                            "business:register",
                            JSON.stringify(payload)
                          );
                          localStorage.setItem(
                            "business:services",
                            JSON.stringify(services)
                          );
                          alert("Draft saved locally");
                        }}
                        className="w-full sm:w-auto px-5 py-3 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300"
                      >
                        Save draft
                      </button>
                    )}

                    {/* Next – ONLY for steps 1–4 */}
                    {step < 5 && (
                      <button
                        onClick={next}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold"
                      >
                        Next
                      </button>
                    )}

                    {/* Publish – ONLY for step 5 */}
                    {step === 5 && (
                      <>
                        <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2">
                          Your business will go live after plan selection
                        </p>

                        <button
                          onClick={submitAll}
                          disabled={submitting}
                          className={`
            w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold
            ${
              submitting
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }
          `}
                        >
                          {submitting
                            ? "Publishing..."
                            : "Continue to plans ->"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
