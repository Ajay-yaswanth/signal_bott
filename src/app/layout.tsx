import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/lib/site";

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
  metadataBase: getSiteUrl(),
  title: {
    default: "ULTRON Signals",
    template: "%s | ULTRON Signals",
  },
  description:
    "Premium XAUUSD signals, disciplined trade levels, ICT/SMC market context, and transparent performance analytics.",
  applicationName: "ULTRON Signals",
  keywords: [
    "XAUUSD signals",
    "gold trading signals",
    "ICT",
    "SMC",
    "trading analytics",
  ],
  authors: [{ name: "ULTRON Signals" }],
  creator: "ULTRON Signals",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ULTRON Signals",
    title: "ULTRON Signals | Premium XAUUSD Signal Terminal",
    description:
      "Live gold setups, structured risk levels, and transparent signal performance.",
  },
  twitter: {
    card: "summary",
    title: "ULTRON Signals | Premium XAUUSD Signal Terminal",
    description:
      "Live gold setups, structured risk levels, and transparent signal performance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
