// app/lib/api.ts
import axios from "axios";
export const API_BASE = "https://44.210.135.75:5001";
// src/app/services/bookingActions.ts
function getToken(explicitToken?: string) {
  if (explicitToken) return explicitToken;
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("token") || undefined;
}

// Unified headers builder
function buildHeaders(isJson = true, token?: string) {
  const authToken = getToken(token);

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

// -------------------------------
// GET
// -------------------------------
export async function apiGet(path: string, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(false, token),
    cache: "no-store",
  });
  console.log("checkpath-------------->", path);
  if (!res.ok) {
    const err = await res.text();
    console.error("GET Error:", err);
    throw new Error(`GET ${path} failed`);
  }

  return res.json();
}

// -------------------------------
// POST (JSON)
// -------------------------------
export async function apiPost(path: string, data: any, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(true, token),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("POST Error:", err);
    throw new Error(`POST ${path} failed`);
  }

  return res.json();
}

// -------------------------------
// PUT (JSON)  ← YOU WILL NEED THIS
// -------------------------------
export async function apiPut(path: string, data: any, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: buildHeaders(true, token),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("PUT Error:", err);
    throw new Error(`PUT ${path} failed`);
  }

  return res.json();
}

// -------------------------------
// FILE UPLOAD (Multipart)
// -------------------------------
export async function apiUpload(path: string, file: File, token?: string) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(getToken(token)
        ? { Authorization: `Bearer ${getToken(token)}` }
        : {}),
      // ❌ DO NOT set Content-Type
    },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("UPLOAD Error:", err);
    throw new Error(`UPLOAD ${path} failed`);
  }

  return res.json();
}
// -------------------------------
// DELETE
// -------------------------------
export async function apiDelete(path: string, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(false, token),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("DELETE Error:", err);
    throw new Error(`DELETE ${path} failed`);
  }

  // some DELETE endpoints return empty body
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function startService(id: string, images: string[]) {
  return axios.put(
    `${API_BASE}/business-bookings/${id}/start-service`,
    { images },
    { headers: authHeader() }
  );
}

export async function completeService(id: string, images: string[]) {
  return axios.put(
    `${API_BASE}/business-bookings/${id}/complete-service`,
    { images },
    { headers: authHeader() }
  );
}

export async function deliverVehicle(id: string) {
  return axios.put(
    `${API_BASE}/business-bookings/${id}/deliver`,
    {},
    { headers: authHeader() }
  );
}


