"use client";
import React, { useEffect, useState, useRef } from "react";
import { apiPost, apiGet, apiPut, API_BASE } from "@/app/lib/api"; // your file earlier
import {
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
} from "@/app/lib/safeStorage";
import { UploadCard } from "@/app/business-dashboard/components/UploadCard";
import BusinessPlanSelection from "./plans/page";

type ServiceRow = {
  id: string;
  name: string;
  pricingType: "FIXED" | "RANGE" | "QUOTE";
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
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  bankBranch?: string;
  openingHours?: object; // shape { mon: {open:true, from:"09:00", to:"18:00"}, ...}
  logoKey?: string | null;
  coverKey?: string | null;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const CATEGORIES = [
  "Garage / Mechanic",
  "Painting",
  "Full service",
  "Accident repair",
  "Detailing",
  "Accessories",
];

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* ---------- Main Page ---------- */
export default function BusinessRegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const emptyPayload: BusinessPayload = {
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
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankName: "",
    bankBranch: "",
    openingHours: {},
    logoKey: null,
    coverKey: null,
  };

  const [payload, setPayload] = useState<BusinessPayload>(() => {
    try {
      const raw = safeGetItem("business:register");

      return raw ? JSON.parse(raw) : emptyPayload;
    } catch {
      return emptyPayload;
    }
  });

  const emptyServices: ServiceRow[] = [
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

  const [services, setServices] = useState<ServiceRow[]>(() => {
    try {
      const raw = safeGetItem("business:services");
      const parsed = raw ? JSON.parse(raw) : null;
      const normalized = Array.isArray(parsed)
        ? parsed.map((s: any) => ({
            ...s,
            pricingType:
              s.pricingType === "QUOTATION" ? "QUOTE" : s.pricingType,
          }))
        : null;
      return normalized ?? emptyServices;
    } catch (e) {
      return emptyServices;
    }
  });

  const emptyAccessories: ServiceRow[] = [
    {
      id: uid("a_"),
      name: "",
      price: null,
      minPrice: null,
      maxPrice: null,
      durationMinutes: 30,
      available: true,
    },
  ];

  const [accessories, setAccessories] = useState<ServiceRow[]>(() => {
    try {
      const raw = safeGetItem("business:accessories");
      const parsed = raw ? JSON.parse(raw) : null;
      const normalized = Array.isArray(parsed)
        ? parsed.map((s: any) => ({
            ...s,
            pricingType:
              s.pricingType === "QUOTATION" ? "QUOTE" : s.pricingType,
          }))
        : null;
      return normalized ?? emptyAccessories;
    } catch (e) {
      return emptyAccessories;
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
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [termsSubmitted, setTermsSubmitted] = useState(false);
  const [planActivated, setPlanActivated] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    const isPending =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("pending") === "1";
    if (!isPending) {
      const verifiedPhone = safeGetItem("verifiedPhone");
      const storedUserRaw = safeGetItem("user");
      if (verifiedPhone && storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw);
          if (storedUser?.phone && storedUser.phone !== verifiedPhone) {
            safeRemoveItem("token");
            safeRemoveItem("user");
          }
        } catch {
          safeRemoveItem("user");
        }
      }
      safeRemoveItem("business:register");
      safeRemoveItem("business:services");
      safeRemoveItem("business:accessories");
      safeRemoveItem("businessId");
      safeRemoveItem("business:draftPhone");
      setSavedBusinessId(null);
      setPendingMode(false);
      setTermsSubmitted(false);
      setTermsAccepted(false);
      setSignatureName("");
      setSignatureDataUrl(null);
      setSignatureConfirmed(false);
      setHasDrawn(false);
      setStepError(null);
      setPayload(emptyPayload);
      setServices([
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
      setAccessories([
        {
          id: uid("a_"),
          name: "",
          price: null,
          minPrice: null,
          maxPrice: null,
          durationMinutes: 30,
          available: true,
        },
      ]);
      setStep(1);
    }
  }, []);

  useEffect(() => {
    // save draft locally
    safeSetItem("business:register", JSON.stringify(payload));
    const currentPhone = safeGetItem("verifiedPhone");
    if (currentPhone) {
      safeSetItem("business:draftPhone", currentPhone);
    }
  }, [payload]);

  useEffect(() => {
    safeSetItem("business:services", JSON.stringify(services));
    const currentPhone = safeGetItem("verifiedPhone");
    if (currentPhone) {
      safeSetItem("business:draftPhone", currentPhone);
    }
  }, [services]);

  useEffect(() => {
    safeSetItem("business:accessories", JSON.stringify(accessories));
    const currentPhone = safeGetItem("verifiedPhone");
    if (currentPhone) {
      safeSetItem("business:draftPhone", currentPhone);
    }
  }, [accessories]);

  useEffect(() => {
    const token = safeGetItem("token");
    if (!token) {
      // save intent
      localStorage.setItem("redirectAfterLogin", "/auth/register/business");
      window.location.href = "/auth/login";
    }
  }, []);

  useEffect(() => {
    // pending mode is driven by business status, not just the query param
    // (so incomplete applications can continue registration)
  }, []);

  useEffect(() => {
    if (pendingMode && savedBusinessId) {
      setStep(6);
    }
  }, [pendingMode, savedBusinessId]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key || typeof window === "undefined") return;

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).google?.maps?.places) return resolve();
        const existing = document.getElementById("google-maps-sdk");
        if (existing) {
          existing.addEventListener("load", () => resolve());
          return;
        }
        const script = document.createElement("script");
        script.id = "google-maps-sdk";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });

    ensureScript()
      .then(() => {
        if (!addressInputRef.current) return;
        const google = (window as any).google;
        const autocomplete = new google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            fields: ["formatted_address", "geometry", "name"],
            types: ["geocode"],
          },
        );

        geocoderRef.current = new google.maps.Geocoder();

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place?.geometry?.location) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formatted =
            place.formatted_address || place.name || addressQuery;

          updatePayload({
            address: formatted,
            latitude: String(lat),
            longitude: String(lng),
          });
          setAddressQuery(formatted);
          setLocationError(null);

          if (mapRef.current) {
            if (!mapInstanceRef.current) {
              mapInstanceRef.current = new google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 15,
              });
            } else {
              mapInstanceRef.current.setCenter({ lat, lng });
            }
            if (!markerRef.current) {
              markerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                draggable: true,
              });
              markerRef.current.addListener("dragend", () => {
                const pos = markerRef.current.getPosition();
                if (!pos) return;
                const nLat = pos.lat();
                const nLng = pos.lng();
                updatePayload({
                  latitude: String(nLat),
                  longitude: String(nLng),
                });
                if (geocoderRef.current) {
                  geocoderRef.current.geocode(
                    { location: { lat: nLat, lng: nLng } },
                    (results: any) => {
                      if (results?.[0]?.formatted_address) {
                        updatePayload({
                          address: results[0].formatted_address,
                        });
                        setAddressQuery(results[0].formatted_address);
                      }
                    },
                  );
                }
              });
            } else {
              markerRef.current.setPosition({ lat, lng });
            }
          }
        });
      })
      .catch(() => {
        setLocationError("Failed to load Google Maps. Check API key.");
      });
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const existing = safeGetItem("businessId");
    if (existing) {
      setSavedBusinessId(existing);
    }
    const draftPhone = safeGetItem("business:draftPhone");
    const currentPhone = safeGetItem("verifiedPhone");
    if (draftPhone && currentPhone && draftPhone !== currentPhone) {
      safeRemoveItem("business:register");
      safeRemoveItem("business:services");
      safeRemoveItem("businessId");
      safeRemoveItem("business:draftPhone");
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    let cancelled = false;
    apiGet("/business/me", token)
      .then((res: any) => {
        if (cancelled) return;
        const businesses = res?.businesses || res || [];
        const biz = Array.isArray(businesses) ? businesses[0] : null;
        if (biz?.id) {
          setSavedBusinessId(biz.id);
          safeSetItem("businessId", biz.id);
        }
        if (biz?.status === "CONTRACT_PENDING") {
          setPendingMode(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingMode || savedBusinessId) return;
    const token = getAuthToken();
    if (!token) return;
    apiGet("/business/me", token)
      .then((res: any) => {
        const businesses = res?.businesses || res || [];
        const biz = Array.isArray(businesses) ? businesses[0] : null;
        if (biz?.id) {
          setSavedBusinessId(biz.id);
          localStorage.setItem("businessId", biz.id);
        }
      })
      .catch(() => {});
  }, [pendingMode, savedBusinessId]);

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
      setTimeout(() => initSignatureCanvas(), 0);
    }
  }, [step, savedBusinessId]);

  if (!hydrated) return null;

  if (pendingMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your application is Under review
          </h1>
          <p className="text-gray-600">
            Kindly wait for 24 to 48 hours. We are reviewing your submission and
            will notify you once it is approved.
          </p>
        </div>
      </div>
    );
  }

  function getAuthToken() {
    return localStorage.getItem("token");
  }

  function resetDraft() {
    safeRemoveItem("business:register");
    safeRemoveItem("business:services");
    safeRemoveItem("business:accessories");
    safeRemoveItem("businessId");
    safeRemoveItem("business:draftPhone");
    setSavedBusinessId(null);
    setPendingMode(false);
    setPlanActivated(false);
    setTermsSubmitted(false);
    setTermsAccepted(false);
    setSignatureName("");
    setSignatureDataUrl(null);
    setSignatureConfirmed(false);
    setHasDrawn(false);
    setStepError(null);
    setPayload(emptyPayload);
    setServices([
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
    setAccessories([
      {
        id: uid("a_"),
        name: "",
        price: null,
        minPrice: null,
        maxPrice: null,
        durationMinutes: 30,
        available: true,
      },
    ]);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function ensureOwnerToken() {
    const existingToken = localStorage.getItem("token");
    return existingToken || null;
  }

  function isValidPan(pan: string) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  function isValidGst(gst: string) {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      gst,
    );
  }

  async function ensureBusinessId() {
    if (savedBusinessId) return savedBusinessId;

    const authToken = getAuthToken();
    if (!authToken) {
      window.location.href = "/auth/login";
      return null;
    }

    if (pendingMode) {
      try {
        const me = await apiGet("/business/me", authToken);
        const businesses = me?.businesses || me || [];
        const existing = Array.isArray(businesses) ? businesses[0] : null;
        if (existing?.id) {
          setSavedBusinessId(existing.id);
          localStorage.setItem("businessId", existing.id);
          return existing.id;
        }
      } catch {
        // ignore
      }
      setKycError("Unable to load existing business");
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
        authToken ?? undefined,
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
        authToken ?? undefined,
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
    if (!signatureDataUrl) {
      setTermsError("Please provide your digital signature");
      return;
    }
    if (!signatureConfirmed) {
      setTermsError("Please confirm your signature before continuing");
      return;
    }

    setTermsSubmitting(true);
    try {
      const businessId = await ensureBusinessId();
      if (!businessId) return;
      const authToken = getAuthToken();
      if (!authToken) throw new Error("Unauthorized");

      // Upload signature image
      const blob = dataUrlToBlob(signatureDataUrl);
      const fd = new FormData();
      fd.append("file", blob, "signature.png");
      const uploadRes = await fetch(`${API_BASE}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload signature");
      const uploadJson = await uploadRes.json();
      const signatureUrl = uploadJson.url;

      await apiPost(
        `/business/${businessId}/terms`,
        { signatureName: signatureName.trim(), signatureUrl },
        authToken ?? undefined,
      );
      localStorage.setItem("business:signatureName", signatureName.trim());
      localStorage.setItem("business:signatureUrl", signatureUrl);
      localStorage.setItem(
        "business:signatureDate",
        new Date().toLocaleDateString(),
      );
      setTermsSubmitted(true);
      setSignatureConfirmed(false);
    } catch (e: any) {
      setTermsError(e?.message || "Failed to submit terms");
    } finally {
      setTermsSubmitting(false);
    }
  }

  function dataUrlToBlob(dataUrl: string) {
    const [meta, base64] = dataUrl.split(",");
    const mime = meta.match(/data:(.*);base64/)?.[1] || "image/png";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function initSignatureCanvas() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
  }

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (signatureConfirmed) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    setIsDrawing(true);
    setHasDrawn(false);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = getCanvasPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function handlePointerUp() {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    if (hasDrawn) {
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  }

  function clearSignature() {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setSignatureDataUrl(null);
    setSignatureConfirmed(false);
    setHasDrawn(false);
  }

  /* ---------- Step handlers ---------- */
  function updatePayload(partial: Partial<BusinessPayload>) {
    setPayload((p) => ({ ...p, ...partial }));
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 1) {
      if (!payload.name?.trim()) return "Business name is required.";
      if (
        !payload.phone?.trim() ||
        !/^[6-9]\d{9}$/.test(payload.phone.trim())
      ) {
        return "Valid 10-digit phone number is required.";
      }
      if (!payload.email?.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        return "Enter a valid email address.";
      }
      if (!payload.category || payload.category.length === 0) {
        return "Select at least one category.";
      }
      if (!payload.address?.trim()) return "Business address is required.";
      if (
        !payload.latitude?.toString().trim() ||
        !payload.longitude?.toString().trim()
      ) {
        return "Please allow location access or select an address from suggestions.";
      }
    }

    if (stepIndex === 2) {
      if (!payload.pancard?.trim()) return "PAN number is required.";
      if (!isValidPan(payload.pancard.trim()))
        return "Enter a valid PAN number.";
      if (!kycStatus?.panVerified)
        return "Please verify PAN before continuing.";
      if (!payload.bankAccountName?.trim())
        return "Account holder name is required.";
      if (!payload.bankAccountNumber?.trim())
        return "Account number is required.";
      if (!payload.bankIfsc?.trim()) return "IFSC code is required.";
      if (!payload.bankName?.trim()) return "Bank name is required.";
      if (!payload.bankBranch?.trim()) return "Bank branch is required.";
    }

    if (stepIndex === 3) {
      const hours = payload.openingHours || {};
      const openDays = Object.values(hours).filter(
        (d: any) => d?.open && d?.from && d?.to,
      );
      if (openDays.length === 0) {
        return "Select at least one working day with hours.";
      }
    }

    if (stepIndex === 5) {
      const namedServices = services.filter((s) => s.name?.trim());
      const namedAccessories = accessories.filter((s) => s.name?.trim());
      const total = namedServices.length + namedAccessories.length;
      if (total < 3) {
        return "Please add at least 3 items in total (services + accessories).";
      }
      for (const s of [...namedServices, ...namedAccessories]) {
        if (s.pricingType === "FIXED" && !s.price) {
          return `Enter a price for "${s.name}".`;
        }
        if (s.pricingType === "RANGE" && (!s.minPrice || !s.maxPrice)) {
          return `Enter a price range for "${s.name}".`;
        }
      }
    }

    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
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
  function addAccessory() {
    setAccessories((s) => [
      ...s,
      {
        id: uid("a_"),
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
      list.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }
  function updateAccessory(id: string, patch: Partial<ServiceRow>) {
    setAccessories((list) =>
      list.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }
  function removeService(id: string) {
    setServices((list) => list.filter((r) => r.id !== id));
  }
  function removeAccessory(id: string) {
    setAccessories((list) => list.filter((r) => r.id !== id));
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

  // Google Maps autocomplete handles address selection

  async function handleFileUpload(file: File, field: "logoKey" | "coverKey") {
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
    const err = validateStep(5);
    if (err) {
      setStepError(err);
      return;
    }

    setSubmitting(true);
    try {
      const authToken = await ensureOwnerToken();
      if (!authToken) {
        alert("Session expired. Please login again.");
        window.location.href = "/auth/login";
        return;
      }

      let businessId = savedBusinessId;

      const normalizedPayload = {
        ...payload,
        latitude: payload.latitude?.toString().trim() ? payload.latitude : null,
        longitude: payload.longitude?.toString().trim()
          ? payload.longitude
          : null,
      };

      if (!businessId) {
        const res = await apiPost("/business", normalizedPayload, authToken);
        businessId = res.id;
        setSavedBusinessId(businessId);
        localStorage.setItem("businessId", businessId);
      } else {
        await apiPut(`/business/${businessId}`, normalizedPayload, authToken);
      }

      // Refresh token so role becomes BUSINESS immediately
      try {
        const refreshed = await apiPost("/auth/refresh", {}, authToken);
        if (refreshed?.token) {
          localStorage.setItem("token", refreshed.token);
          if (refreshed.user) {
            localStorage.setItem("user", JSON.stringify(refreshed.user));
          }
        }
      } catch {
        // ignore refresh failures
      }

      await apiPost(
        `/business/${businessId}/services`,
        {
          services: [
            ...services.map((s) => ({
              name: s.name,
              pricingType: s.pricingType,
              price: s.price,
              minPrice: s.minPrice,
              maxPrice: s.maxPrice,
              durationMinutes: s.durationMinutes,
              available: s.available,
              offeringType: "SERVICE",
            })),
            ...accessories.map((s) => ({
              name: s.name,
              pricingType: s.pricingType,
              price: s.price,
              minPrice: s.minPrice,
              maxPrice: s.maxPrice,
              durationMinutes: s.durationMinutes,
              available: s.available,
              offeringType: "ACCESSORY",
            })),
          ],
        },
        authToken,
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
              {pendingMode && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="font-semibold">
                    Registration submitted — awaiting approval
                  </div>
                  <div className="text-sm mt-1">
                    Your business profile is under review. We’ll verify the
                    digital signature and confirm activation within 24–48 hours.
                    You’ll receive a notification once your business is live.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Step {step} / 6
                </h3>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {submitting ? "Saving..." : "Draft saved locally"}
                </div>
              </div>

              <div
                className={
                  pendingMode && step !== 6
                    ? "pointer-events-none opacity-60"
                    : ""
                }
              >
                {/* Step content */}
                {step === 1 && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        Business basics
                      </h4>
                      <button
                        type="button"
                        onClick={resetDraft}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Start fresh
                      </button>
                    </div>

                    {/* Mobile: 1 col | Desktop: 2 col */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={payload.name || ""}
                        onChange={(e) =>
                          updatePayload({ name: e.target.value })
                        }
                        placeholder="Business name"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg
          text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400
          focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                      />

                      <input
                        value={payload.phone || ""}
                        onChange={(e) =>
                          updatePayload({ phone: e.target.value })
                        }
                        placeholder="Phone"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg
          text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400
          focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900"
                      />

                      <input
                        value={payload.email || ""}
                        onChange={(e) =>
                          updatePayload({ email: e.target.value })
                        }
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
                          ref={addressInputRef}
                          value={addressQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAddressQuery(value);
                            updatePayload({
                              address: value,
                              latitude: "",
                              longitude: "",
                            });
                          }}
                          placeholder="Search area, street, landmark…"
                          className="w-full p-3 pl-10 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        />
                      </div>

                      <div
                        ref={mapRef}
                        className="mt-3 h-56 w-full rounded-lg border border-gray-200 dark:border-slate-800"
                      />
                      {locationError && (
                        <div className="mt-2 text-xs text-red-600">
                          {locationError}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {step === 2 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    KYC Verification
                  </h4>

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

                  {/* Bank Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm mb-1 block">
                        Account Holder Name
                      </label>
                      <input
                        value={payload.bankAccountName || ""}
                        onChange={(e) =>
                          updatePayload({ bankAccountName: e.target.value })
                        }
                        placeholder="Name as per bank"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm mb-1 block">
                        Account Number
                      </label>
                      <input
                        value={payload.bankAccountNumber || ""}
                        onChange={(e) =>
                          updatePayload({ bankAccountNumber: e.target.value })
                        }
                        placeholder="Account number"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm mb-1 block">IFSC Code</label>
                      <input
                        value={payload.bankIfsc || ""}
                        onChange={(e) =>
                          updatePayload({
                            bankIfsc: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="IFSC Code"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-sm mb-1 block">Bank Name</label>
                      <input
                        value={payload.bankName || ""}
                        onChange={(e) =>
                          updatePayload({ bankName: e.target.value })
                        }
                        placeholder="Bank name"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm mb-1 block">Branch</label>
                      <input
                        value={payload.bankBranch || ""}
                        onChange={(e) =>
                          updatePayload({ bankBranch: e.target.value })
                        }
                        placeholder="Branch"
                        className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    Operating Hours
                  </h4>

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
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    Logo & Cover Image
                  </h4>
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
                    <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      Services & Accessories
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Add services customers can book from your business
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Minimum 3 items in total are required to proceed. (
                      {services.length + accessories.length}/3)
                    </p>
                  </div>

                  {/* Services list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                        Services
                      </h5>
                      <button
                        onClick={addService}
                        className="text-sm text-indigo-600 hover:underline"
                        type="button"
                      >
                        + Add service
                      </button>
                    </div>
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

                  {/* Accessories list */}
                  <div className="space-y-2 pt-6">
                    <div className="flex items-center justify-between">
                      <h5 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                        Accessories
                      </h5>
                      <button
                        onClick={addAccessory}
                        className="text-sm text-indigo-600 hover:underline"
                        type="button"
                      >
                        + Add accessory
                      </button>
                    </div>
                    {accessories.map((s, index) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 dark:text-slate-100">
                            Accessory {index + 1}
                          </span>
                          <button
                            onClick={() => removeAccessory(s.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>

                        <input
                          value={s.name}
                          onChange={(e) =>
                            updateAccessory(s.id, { name: e.target.value })
                          }
                          placeholder="Accessory name (e.g. Seat Cover)"
                          className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Pricing type
                          </label>

                          <div className="flex flex-wrap gap-4">
                            {["FIXED", "RANGE", "QUOTE"].map((p) => (
                              <label
                                key={p}
                                className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300"
                              >
                                <input
                                  type="radio"
                                  name={`accessory-pricing-${s.id}`}
                                  checked={s.pricingType === p}
                                  onChange={() =>
                                    updateAccessory(s.id, {
                                      pricingType:
                                        p as ServiceRow["pricingType"],
                                    })
                                  }
                                />
                                {p === "FIXED" && "Fixed"}
                                {p === "RANGE" && "Range"}
                                {p === "QUOTE" && "Quotation"}
                              </label>
                            ))}
                          </div>
                        </div>

                        {s.pricingType === "FIXED" && (
                          <input
                            type="number"
                            value={s.price ?? ""}
                            onChange={(e) =>
                              updateAccessory(s.id, {
                                price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            placeholder="Price (₹)"
                            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                          />
                        )}

                        {s.pricingType === "RANGE" && (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              value={s.minPrice ?? ""}
                              onChange={(e) =>
                                updateAccessory(s.id, {
                                  minPrice: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              placeholder="Min price"
                              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                            />
                            <input
                              type="number"
                              value={s.maxPrice ?? ""}
                              onChange={(e) =>
                                updateAccessory(s.id, {
                                  maxPrice: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              placeholder="Max price"
                              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </section>
              )}
              {step === 6 && savedBusinessId && (
                <section className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    Terms & Plan Selection
                  </h4>

                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 space-y-3">
                    <h5 className="font-semibold text-gray-900 dark:text-slate-100">
                      Verification Summary
                    </h5>
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
                      <h5 className="font-semibold text-gray-900 dark:text-slate-100">
                        Terms & Conditions
                      </h5>
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

                    <div>
                      <label className="text-sm mb-2 block">
                        Draw Signature
                      </label>
                      <div className="border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 relative">
                        {signatureConfirmed && (
                          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-slate-200">
                            Signature confirmed
                          </div>
                        )}
                        <div className="absolute left-4 right-4 bottom-6 border-b border-dashed border-gray-300 dark:border-slate-700 pointer-events-none" />
                        <canvas
                          ref={signatureCanvasRef}
                          className="w-full h-40 touch-none bg-white"
                          style={{ backgroundColor: "#ffffff" }}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200"
                        >
                          Retake Signature
                        </button>
                        {signatureDataUrl && (
                          <span className="text-xs text-green-600">
                            Signature captured
                          </span>
                        )}
                        {signatureDataUrl && !signatureConfirmed && (
                          <button
                            type="button"
                            onClick={() => setSignatureConfirmed(true)}
                            className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white"
                          >
                            Confirm Signature
                          </button>
                        )}
                        {signatureConfirmed && (
                          <span className="text-xs text-indigo-600">
                            Confirmed
                          </span>
                        )}
                      </div>

                      {signatureDataUrl && (
                        <div className="mt-3 border border-gray-200 dark:border-slate-800 rounded-lg p-3 bg-gray-50 dark:bg-slate-900">
                          <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                            Preview
                          </div>
                          <img
                            src={signatureDataUrl}
                            alt="Signature preview"
                            className="h-20 object-contain bg-white rounded border border-gray-200 dark:border-slate-700"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={submitTerms}
                      disabled={termsSubmitting}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
                    >
                      {termsSubmitting
                        ? "Submitting..."
                        : termsSubmitted
                          ? "Update & Continue"
                          : "Sign & Continue"}
                    </button>
                  </div>

                  {termsSubmitted && !pendingMode && (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        Choose Your Plan
                      </h4>
                      <BusinessPlanSelection
                        businessId={savedBusinessId}
                        onActivated={() => {
                          setPlanActivated(true);
                        }}
                      />
                      {planActivated && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!savedBusinessId) return;
                              try {
                                const authToken = getAuthToken();
                                if (!authToken) return;
                                await apiPost(
                                  `/business/${savedBusinessId}/submit`,
                                  {},
                                  authToken,
                                );
                                setPendingMode(true);
                              } catch (e: any) {
                                setTermsError(
                                  e?.message || "Failed to submit application",
                                );
                              }
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
                          >
                            Submit Application
                          </button>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            Submit after selecting a plan to send your
                            application for review.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {pendingMode && (
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      Your plan is locked while the profile is under review. You
                      can update your digital signature above if needed.
                    </div>
                  )}
                </section>
              )}

              {/* navigation */}
              {!pendingMode && (
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
                              JSON.stringify(payload),
                            );
                            localStorage.setItem(
                              "business:services",
                              JSON.stringify(services),
                            );
                            localStorage.setItem(
                              "business:accessories",
                              JSON.stringify(accessories),
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
                            Your application is submitted only after terms and
                            plan completion.
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
                            {submitting ? "Saving..." : "Save & Continue ->"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
