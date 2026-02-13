"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import PushNotifications from "@/app/components/PushNotifications";
import ClientErrorReporter from "@/app/components/ClientErrorReporter";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClientErrorReporter />
        <PushNotifications />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
