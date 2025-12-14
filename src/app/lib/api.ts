// app/lib/api.ts
export const API_BASE = "http://44.210.135.75:5001";

// Unified headers builder
function buildHeaders(token?: string, isJson = true) {
  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// -------------------------------
// GET
// -------------------------------
export async function apiGet(path: string, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(token, false),
    cache: "no-store",
  });

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
    headers: buildHeaders(token, true),
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
// FILE UPLOAD (Multipart FormData)
// -------------------------------
export async function apiUpload(path: string, file: File, token?: string) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // ❌ DO NOT set content-type manually while using formData
    },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("UPLOAD Error:", err);
    throw new Error(`UPLOAD ${path} failed`);
  }

  return res.json(); // must return { url }
}
