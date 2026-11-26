import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
export const metadata: Metadata = {
  title: { default: "Chargely — Invoicing made simple", template: "%s · Chargely" },
  description: "Create professional invoices, quotes and receipts. Share them with clients and track payments in one simple workspace.",
  applicationName: "Chargely",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#087b58" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister/>{children}</body></html>;
}