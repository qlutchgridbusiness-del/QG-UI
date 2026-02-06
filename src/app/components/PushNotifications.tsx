"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function base64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotifications() {
  const { isAuthenticated, role, isAuthReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || role !== "BUSINESS") return;
    setReady(true);
  }, [isAuthReady, isAuthenticated, role]);

  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
    if (!publicKey) return;

    (async () => {
      const permission = Notification.permission;
      if (permission !== "granted") {
        setNeedsPermission(true);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(publicKey),
        }));

      await apiPost("/push/subscribe", subscription);
    })().catch(() => {});
  }, [ready]);

  async function requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      setNeedsPermission(false);

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
      if (!publicKey) return;
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(publicKey),
        }));
      await apiPost("/push/subscribe", subscription);
    } catch {
      // ignore
    }
  }

  if (!ready || !needsPermission) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg rounded-xl p-4 max-w-sm">
      <p className="text-sm text-gray-800 dark:text-slate-100">
        Enable notifications to get instant booking alerts.
      </p>
      <button
        onClick={requestPermission}
        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-lg"
      >
        Enable Notifications
      </button>
    </div>
  );
}
