import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/layout/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Abstruse Drop Ship - Wholesale Distribution Platform",
  description:
    "Connect with top US distributors. Dropship products directly to your customers.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-gray-400 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm space-y-2">
              <div>
                &copy; {new Date().getFullYear()} USA Track &amp; Reclaim LLC.
                All rights reserved. Abstruse Drop Ship is a brand of USA Track
                &amp; Reclaim LLC.
              </div>
              <div className="flex justify-center gap-4 text-xs">
                <a href="/terms" className="hover:text-gray-200">
                  Terms
                </a>
                <a href="/privacy" className="hover:text-gray-200">
                  Privacy
                </a>
                <a href="/refund" className="hover:text-gray-200">
                  Refunds
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
