import type { Metadata, Viewport } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "Lenkynas — Lenkijos pasiūlymai su pristatymu į Lietuvą",
    template: "%s · Lenkynas",
  },
  description:
    "Populiariausios Allegro prekės eurais ir lietuviškai. Skaidrios kainos, saugus apmokėjimas ir pristatymas į Lietuvą per 3–6 darbo dienas.",
  applicationName: "Lenkynas",
  openGraph: { siteName: "Lenkynas", locale: "lt_LT", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
