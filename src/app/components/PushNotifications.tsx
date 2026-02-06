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
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

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

  return null;
}
