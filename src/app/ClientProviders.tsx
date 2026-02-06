"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import PushNotifications from "@/app/components/PushNotifications";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PushNotifications />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
