"use client";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<"user" | "business">("user");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as
      | "user"
      | "business"
      | null;
    if (storedRole) setUserRole(storedRole);
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900 flex flex-col">
        <Navbar userRole={userRole} setUserRole={setUserRole} />

        <main
          className="
    flex-1 w-full mx-auto
    px-4 pt-16
    sm:px-2 sm:pt-14
    lg:px-8 lg:pt-24
  "
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
