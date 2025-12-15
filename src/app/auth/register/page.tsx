"use client";
import React, { useEffect, useState, useRef } from "react";
import { apiPost, apiGet } from "@/app/lib/api"; // your file earlier
import { UploadCard } from "@/app/business-dashboard/components/UploadCard";

type ServiceRow = {
  id: string;
  name: string;
  price?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  durationMinutes?: number | null;
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
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || "";
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

/* ---------- Utility: getPresignUrl ---------- 
  Expects backend endpoint POST /uploads/presign with { filename, contentType }
  Response: { url: 'https://...', key: 'uploads/xxx.jpg' }
*/
// async function uploadFileToS3(file: File) {
//   // ask backend for presigned url
//   const res = await apiPost("/uploads", {
//     filename: file.name,
//     contentType: file.type,
//   });
//   const { url, key } = res;
//   // upload with PUT
//   await fetch(url, {
//     method: "PUT",
//     headers: { "Content-Type": file.type },
//     body: file,
//   });
//   // return key (useful to store on DB) and public url if your bucket is public or you can build URL
//   return { key, url: url.split("?")[0] };
// }

/* ---------- Google Places autocomplete loader ---------- */
function loadGooglePlacesScript() {
  if (!GOOGLE_KEY) return Promise.resolve();
  if (document.getElementById("google-places")) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.id = "google-places";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ---------- Main Page ---------- */
export default function BusinessRegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(null);

  const [payload, setPayload] = useState<BusinessPayload>(() => {
    // try hydrate from localStorage
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("business:register")
          : null;
      return raw
        ? JSON.parse(raw)
        : ({
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
            openingHours: DAYS.reduce(
              (acc, d) => ({
                ...acc,
                [d]: { open: false, from: "09:00", to: "18:00" },
              }),
              {} as any
            ),
            logoKey: null,
            coverKey: null,
          } as BusinessPayload);
    } catch (e) {
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

  // google autocomplete refs
  const addressRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // save draft locally
    localStorage.setItem("business:register", JSON.stringify(payload));
  }, [payload]);

  useEffect(() => {
    localStorage.setItem("business:services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    // load google places if available and wire autocomplete
    if (!GOOGLE_KEY) return;
    loadGooglePlacesScript()
      .then(() => {
        if (!addressRef.current) return;
        const google = (window as any).google;
        autocompleteRef.current = new google.maps.places.Autocomplete(
          addressRef.current,
          { types: ["geocode"] }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          const address = place.formatted_address || "";
          const lat = place.geometry?.location?.lat?.() || null;
          const lng = place.geometry?.location?.lng?.() || null;
          setPayload((p) => ({
            ...p,
            address,
            latitude: lat ? String(lat) : p.latitude,
            longitude: lng ? String(lng) : p.longitude,
          }));
        });
      })
      .catch(() => {
        // ignore
      });
  }, []);

  useEffect(() => {
    // auto detect geolocation for user (optional)
    if (!payload.latitude || !payload.longitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPayload((p) => ({
              ...p,
              latitude: String(pos.coords.latitude),
              longitude: String(pos.coords.longitude),
            }));
          },
          () => {
            /*ignore*/
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  /* ---------- Step handlers ---------- */
  function updatePayload(partial: Partial<BusinessPayload>) {
    setPayload((p) => ({ ...p, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(5, s + 1));
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

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`
          );
          const data = await res.json();

          updatePayload({
            address: data.results?.[0]?.formatted_address || "Current location",
            latitude: String(lat),
            longitude: String(lng),
          });
        } catch {
          updatePayload({
            address: "Current location",
            latitude: String(lat),
            longitude: String(lng),
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
      // 1) create business (if not created)
      let businessId = savedBusinessId;
      if (!businessId) {
        const createBody = {
          ...payload,
        };
        // sanitize openingHours if needed
        const res = await apiPost("/business", createBody);
        businessId = res?.id || res?.b_id || res?.business?.id;
        setSavedBusinessId(businessId);
      }

      // 2) push services
      const servicesPayload = services.map((s) => ({
        name: s.name,
        price: s.price ?? null,
        minPrice: s.minPrice ?? null,
        maxPrice: s.maxPrice ?? null,
        durationMinutes: s.durationMinutes ?? null,
        available: s.available ?? true,
      }));
      await apiPost(`/business/${businessId}/services`, {
        services: servicesPayload,
      });

      // clear drafts
      localStorage.removeItem("business:register");
      localStorage.removeItem("business:services");

      alert("Business created successfully!");
      // redirect to business dashboard
      window.location.href = "/business-dashboard";
    } catch (err) {
      console.error(err);
      alert("Failed to submit. See console.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- UI per step ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
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
                  {["Basics", "KYC", "Hours", "Media", "Services"].map(
                    (label, i) => {
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
                    }
                  )}
                </ol>
              </div>

              <div>
                <div className="text-xs opacity-90">Progress</div>
                <div className="w-full bg-white/20 h-2 rounded mt-2">
                  <div
                    className="h-2 bg-white rounded"
                    style={{ width: `${(step / 5) * 100}%` }}
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
          <div className="col-span-12 lg:col-span-8 p-8 bg-white/95 backdrop-blur rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Step {step} / 5</h3>
                <div className="text-sm text-gray-500">
                  {submitting ? "Saving..." : "Draft saved locally"}
                </div>
              </div>

              {/* Step content */}
              {step === 1 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold">Business basics</h4>

                  {/* Mobile: 1 col | Desktop: 2 col */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={payload.name || ""}
                      onChange={(e) => updatePayload({ name: e.target.value })}
                      placeholder="Business name"
                      className="w-full p-3 border border-gray-300 rounded-lg
          text-gray-900 placeholder-gray-500
          focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <input
                      value={payload.phone || ""}
                      onChange={(e) => updatePayload({ phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full p-3 border border-gray-300 rounded-lg
          text-gray-900 placeholder-gray-500
          focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <input
                      value={payload.email || ""}
                      onChange={(e) => updatePayload({ email: e.target.value })}
                      placeholder="Email"
                      className="w-full p-3 border border-gray-300 rounded-lg
          text-gray-900 placeholder-gray-500
          focus:ring-2 focus:ring-indigo-500 outline-none"
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
                : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
            }
          `}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        You can select multiple categories
                      </p>
                    </div>

                    {/* Address always full width */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium block">
                        Business location
                      </label>

                      <div className="relative">
                        <input
                          ref={addressRef}
                          value={payload.address || ""}
                          onChange={(e) =>
                            updatePayload({ address: e.target.value })
                          }
                          placeholder="Search area, street, landmark…"
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg
        text-gray-900 placeholder-gray-500
        focus:ring-2 focus:ring-indigo-500 outline-none"
                        />

                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          🔍
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="text-sm text-indigo-600 hover:underline flex items-center gap-2"
                      >
                        📍 Use my current location
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold">KYC Verification</h4>

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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      {payload.pancard && (
                        <p className="text-xs text-gray-500 mt-1">
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
                        onChange={(e) => updatePayload({ gst: e.target.value })}
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      {payload.aadhaarCard && (
                        <p className="text-xs text-gray-500 mt-1">
                          Stored as: {maskAadhaar(payload.aadhaarCard)}
                        </p>
                      )}
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

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Your documents are encrypted and used only for
                    verification
                  </p>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold">Operating Hours</h4>

                  {/* DAY SELECTOR */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
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
                    : "bg-white text-gray-700 border-gray-300"
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
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <p className="text-sm font-medium mb-3">
                      Weekday timing (Mon–Fri)
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                      <input
                        type="time"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <p className="text-sm font-medium mb-3">
                      Weekend timing (Sat–Sun)
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                      <input
                        type="time"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    <p className="text-sm font-medium text-gray-700">
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
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold">Logo & Cover Image</h4>
                  <p className="text-sm text-gray-600">
                    Upload your brand logo and a cover image. These will be
                    visible to users while browsing your business.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LOGO */}
                    <div className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold">Business Logo</h5>
                        <span className="text-xs text-gray-500">
                          Square image
                        </span>
                      </div>

                      {!(payload as any).logoKeyPreview ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-600">
                            Upload your business logo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Recommended size: 500 × 500 • JPG / PNG
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <img
                            src={(payload as any).logoKeyPreview}
                            alt="Logo preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "logoKey");
                          }}
                        />
                        <div className="mt-2 text-center">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            {(payload as any).logoKeyPreview
                              ? "Change Logo"
                              : "Upload Logo"}
                          </button>
                        </div>
                      </label>
                    </div>

                    {/* COVER IMAGE */}
                    <div className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold">Cover Image</h5>
                        <span className="text-xs text-gray-500">
                          Wide image
                        </span>
                      </div>

                      {!(payload as any).coverKeyPreview ? (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-600">
                            Upload a cover image for your business
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Recommended size: 1200 × 400 • JPG / PNG
                          </p>
                        </div>
                      ) : (
                        <img
                          src={(payload as any).coverKeyPreview}
                          alt="Cover preview"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                      )}

                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "coverKey");
                          }}
                        />
                        <div className="mt-2 text-center">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                          >
                            {(payload as any).coverKeyPreview
                              ? "Change Cover Image"
                              : "Upload Cover Image"}
                          </button>
                        </div>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {step === 5 && (
                <section className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold">Services you offer</h4>
                    <p className="text-sm text-gray-500">
                      Add at least one service so customers can book you
                    </p>
                  </div>

                  <div className="space-y-5">
                    {services.map((s, index) => (
                      <div
                        key={s.id}
                        className="border rounded-xl p-4 space-y-4 bg-gray-50"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-700">
                            Service {index + 1}
                          </div>
                          <button
                            onClick={() => removeService(s.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Service name */}
                        <input
                          value={s.name}
                          onChange={(e) =>
                            updateService(s.id, { name: e.target.value })
                          }
                          placeholder="Service name (e.g. Full Service)"
                          className="w-full p-3 border rounded-lg"
                        />

                        {/* Pricing */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-600">
                            Pricing
                          </div>

                          {/* Fixed price */}
                          <input
                            value={s.price ?? ""}
                            onChange={(e) => {
                              const v =
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value);
                              updateService(s.id, {
                                price: v,
                                minPrice: null,
                                maxPrice: null,
                              });
                            }}
                            placeholder="Fixed price (₹)"
                            className="w-full p-3 border rounded-lg"
                          />

                          {/* OR range */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              value={s.minPrice ?? ""}
                              onChange={(e) => {
                                const v =
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value);
                                updateService(s.id, {
                                  minPrice: v,
                                  price: null,
                                });
                              }}
                              placeholder="Min price (₹)"
                              className="p-3 border rounded-lg"
                            />

                            <input
                              value={s.maxPrice ?? ""}
                              onChange={(e) => {
                                const v =
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value);
                                updateService(s.id, {
                                  maxPrice: v,
                                  price: null,
                                });
                              }}
                              placeholder="Max price (₹)"
                              className="p-3 border rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Duration + availability */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <input
                            value={String(s.durationMinutes)}
                            onChange={(e) =>
                              updateService(s.id, {
                                durationMinutes: Number(e.target.value),
                              })
                            }
                            placeholder="Duration (minutes)"
                            className="w-full sm:w-48 p-3 border rounded-lg"
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

              {/* navigation */}
              <div className="pt-6 border-t mt-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  {/* Back */}
                  {step > 1 && (
                    <button
                      onClick={prev}
                      className="w-full sm:w-auto px-5 py-3 border rounded-lg text-gray-700"
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
                        className="w-full sm:w-auto px-5 py-3 border rounded-lg text-gray-700"
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
                        {submitting ? "Publishing..." : "Finish & Publish"}
                      </button>
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
