import "./globals.css";
import ClientProviders from "./ClientProviders";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ClientProviders>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
