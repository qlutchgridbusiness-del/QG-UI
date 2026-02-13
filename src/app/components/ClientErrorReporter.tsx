"use client";

import { useEffect } from "react";
import { API_BASE } from "@/app/lib/api";

type LogPayload = {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  extra?: Record<string, any>;
};

function sendLog(payload: LogPayload) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      (navigator as any).sendBeacon(`${API_BASE}/client-logs`, blob);
      return;
    }
    fetch(`${API_BASE}/client-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // swallow
  }
}

export default function ClientErrorReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleError = (event: ErrorEvent) => {
      sendLog({
        message: event.message || "Client error",
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        extra: { source: "window.onerror", filename: event.filename, lineno: event.lineno, colno: event.colno },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      sendLog({
        message:
          typeof reason === "string"
            ? reason
            : reason?.message || "Unhandled promise rejection",
        stack: reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        extra: { source: "unhandledrejection" },
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
