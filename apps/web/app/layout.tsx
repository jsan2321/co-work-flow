import type { Metadata } from "next";
import { Source_Serif_4, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoWorkFlow — High-Concurrency Workspace Reservation Platform",
  description:
    "Zero double-bookings guaranteed via PostgreSQL GiST exclusion constraints. Crafted with Architectural Editorial SaaS design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased flex flex-col">
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
