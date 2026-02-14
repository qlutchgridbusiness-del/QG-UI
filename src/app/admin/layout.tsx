"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthReady, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated || role !== "ADMIN") {
      router.replace("/auth/login?admin=1");
    }
  }, [isAuthReady, isAuthenticated, role, router]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Checking admin access…
      </div>
    );
  }

  if (!isAuthenticated || role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
