"use client";
import React, { useEffect, useState, useRef } from "react";
import { apiPost, apiGet } from "@/app/lib/api"; // your file earlier
// If you used axios or direct fetch, swap accordingly.

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
  category?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  pancard?: string;
  aadhaarCard?: string;
  gst?: string;
  openingHours?: any; // shape { mon: {open:true, from:"09:00", to:"18:00"}, ...}
  logoKey?: string | null;
  coverKey?: string | null;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || "";

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
            category: "",
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
  async function uploadFileFake(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string); // base64 preview URL
      };
      reader.readAsDataURL(file);
    });
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

  /* ---------- Final submit ---------- */
  async function submitAll() {
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
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white p-8 bg-white/95 backdrop-blur rounded-xl">
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
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={payload.name || ""}
                      onChange={(e) => updatePayload({ name: e.target.value })}
                      placeholder="Business name"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />
                    <input
                      value={payload.phone || ""}
                      onChange={(e) => updatePayload({ phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />
                    <input
                      value={payload.email || ""}
                      onChange={(e) => updatePayload({ email: e.target.value })}
                      placeholder="Email"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />
                    <select
                      value={payload.category || ""}
                      onChange={(e) =>
                        updatePayload({ category: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select category</option>
                      <option>Garage / Mechanic</option>
                      <option>Painting</option>
                      <option>Full service</option>
                      <option>Accident repair</option>
                      <option>Detailing</option>
                    </select>

                    <div className="col-span-2">
                      <label className="text-sm block mb-2">
                        Address (Google autocomplete available)
                      </label>
                      <input
                        ref={addressRef}
                        value={payload.address || ""}
                        onChange={(e) =>
                          updatePayload({ address: e.target.value })
                        }
                        placeholder="Start typing address..."
                        className="w-full w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Lat: {payload.latitude} • Lng: {payload.longitude}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold">KYC</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={payload.pancard || ""}
                      onChange={(e) =>
                        updatePayload({ pancard: e.target.value })
                      }
                      placeholder="PAN"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />
                    <input
                      value={payload.gst || ""}
                      onChange={(e) => updatePayload({ gst: e.target.value })}
                      placeholder="GST ID"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />
                    <input
                      value={payload.aadhaarCard || ""}
                      onChange={(e) =>
                        updatePayload({ aadhaarCard: e.target.value })
                      }
                      placeholder="Aadhaar"
                      className="w-full p-3 border border-gray-300 rounded-lg 
             text-gray-900 placeholder-gray-500 focus:ring-2 
             focus:ring-indigo-500 outline-none"
                    />

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <label className="flex flex-col">
                        <span className="text-sm mb-1">Upload PAN image</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "pancard");
                          }}
                        />
                      </label>

                      <label className="flex flex-col">
                        <span className="text-sm mb-1">
                          Upload Aadhaar (front/back)
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "aadhaarCard");
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold">Operating hours</h4>
                  <div className="grid gap-2">
                    {DAYS.map((d) => {
                      const day = (payload.openingHours || {})[d] || {
                        open: false,
                        from: "09:00",
                        to: "18:00",
                      };
                      return (
                        <div key={d} className="flex items-center gap-4">
                          <div className="w-20 capitalize">{d}</div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={day.open}
                              onChange={(e) => {
                                const oh = {
                                  ...payload.openingHours,
                                  [d]: { ...day, open: e.target.checked },
                                };
                                updatePayload({ openingHours: oh });
                              }}
                            />
                            Open
                          </label>
                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) => {
                              const oh = {
                                ...payload.openingHours,
                                [d]: { ...day, from: e.target.value },
                              };
                              updatePayload({ openingHours: oh });
                            }}
                            className="p-2 border rounded"
                          />
                          <span>—</span>
                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) => {
                              const oh = {
                                ...payload.openingHours,
                                [d]: { ...day, to: e.target.value },
                              };
                              updatePayload({ openingHours: oh });
                            }}
                            className="p-2 border rounded"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold">Media & Branding</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">
                        Logo (square)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) await handleFileUpload(f, "logoKey");
                        }}
                      />
                      {(payload as any).logoKeyPreview && (
                        <img
                          src={(payload as any).logoKeyPreview}
                          alt="logo"
                          className="mt-3 w-28 h-28 object-cover rounded"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-2">
                        Cover image (wide)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) await handleFileUpload(f, "coverKey");
                        }}
                      />
                      {(payload as any).coverKeyPreview && (
                        <img
                          src={(payload as any).coverKeyPreview}
                          alt="cover"
                          className="mt-3 w-full h-28 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                </section>
              )}

              {step === 5 && (
                <section className="space-y-4">
                  <h4 className="text-xl font-bold">Add Services</h4>
                  <div className="space-y-4">
                    {services.map((s) => (
                      <div key={s.id} className="p-4 border rounded-lg">
                        <div className="flex gap-3 items-center">
                          <input
                            value={s.name}
                            onChange={(e) =>
                              updateService(s.id, { name: e.target.value })
                            }
                            placeholder="Service name (e.g., Full Service)"
                            className="flex-1 p-2 border rounded"
                          />
                          <button
                            onClick={() => removeService(s.id)}
                            className="text-red-500"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3">
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
                            className="p-2 border rounded"
                          />

                          <div className="flex gap-2">
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
                              placeholder="Min price"
                              className="p-2 border rounded"
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
                              placeholder="Max price"
                              className="p-2 border rounded"
                            />
                          </div>

                          <input
                            value={String(s.durationMinutes)}
                            onChange={(e) =>
                              updateService(s.id, {
                                durationMinutes: Number(e.target.value),
                              })
                            }
                            placeholder="Duration (mins)"
                            className="p-2 border rounded"
                          />
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={s.available}
                              onChange={(e) =>
                                updateService(s.id, {
                                  available: e.target.checked,
                                })
                              }
                            />
                            Available
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addService}
                      className="px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      + Add another service
                    </button>
                  </div>
                </section>
              )}

              {/* navigation */}
              <div className="flex items-center justify-between py-4">
                <div>
                  {step > 1 && (
                    <button
                      onClick={prev}
                      className="px-4 py-2 border rounded mr-3"
                    >
                      Back
                    </button>
                  )}
                  {step < 5 && (
                    <button
                      onClick={next}
                      className="px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                      Next
                    </button>
                  )}
                </div>

                <div>
                  {step === 5 ? (
                    <button
                      onClick={submitAll}
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded"
                    >
                      {submitting ? "Submitting..." : "Finish & Publish"}
                    </button>
                  ) : (
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
                        alert("Saved locally");
                      }}
                      className="px-4 py-2 border rounded"
                    >
                      Save draft
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
