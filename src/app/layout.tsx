import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Chargely — Invoicing made simple", template: "%s · Chargely" },
  description: "Create professional invoices, quotes and receipts. Share them with clients and track payments in one simple workspace.",
  applicationName: "Chargely",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  themeColor: "#087b58",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}