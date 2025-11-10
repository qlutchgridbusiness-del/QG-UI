"use client"
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<"user" | "business">("business");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as
      | "user"
      | "business"
      | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Navbar userRole={userRole} setUserRole={setUserRole} />
        <main className="flex-1 container mx-auto p-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
