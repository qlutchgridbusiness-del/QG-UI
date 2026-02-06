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
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          <Navbar />
          <main className="pt-16 flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
