import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/layout/cookie-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkNest · Milestone Escrow Freelance Marketplace",
    template: "%s · WorkNest",
  },
  description:
    "Hire world-class freelance specialists and get paid with milestone-based escrow protection and audited double-entry accounting.",
  metadataBase: new URL(process.env.APP_URL || "https://worknest.dev"),
  keywords: [
    "freelance marketplace",
    "hire developers",
    "milestone escrow",
    "contract work",
    "freelance platform",
    "secure payments",
  ],
  authors: [{ name: "WorkNest Team" }],
  openGraph: {
    title: "WorkNest · Production-Grade Freelance Marketplace",
    description:
      "Milestone-based escrow, double-entry financial ledger auditing, and verifiable freelance contracts.",
    siteName: "WorkNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkNest Freelance Marketplace",
    description:
      "Milestone-based escrow, double-entry financial ledger auditing, and verifiable freelance contracts.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-nonce={nonce}
      >
        {children}
        <CookieBanner />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
