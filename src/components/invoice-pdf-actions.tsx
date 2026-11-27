"use client";

import { useState } from "react";
import { Download, Share2, LoaderCircle } from "lucide-react";
import { jsPDF } from "jspdf";

type PdfInvoice = {
  number: string;
  type?: string;
  currency: string;
  issueDate: string;
  dueDate?: string | null;
  business: { name: string; email?: string | null; phone?: string | null; address?: string | null; logoUrl?: string | null };
  client?: { name: string; email?: string | null; phone?: string | null; address?: string | null } | null;
  items: { description: string; quantity: number; unitPrice: number; amount: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid?: number;
  balance?: number;
  notes?: string | null;
  bank?: { bank_name?: string; account_name?: string; account_number?: string; payment_instructions?: string; paypal_email?: string } | null;
  template?: string;
};

const palettes: Record<string, { accent: string; pale: string; layout: string }> = {
  emerald: { accent: "#087b58", pale: "#e8f5ef", layout: "editorial" },
  midnight: { accent: "#172554", pale: "#eef2ff", layout: "dark" },
  ocean: { accent: "#0369a1", pale: "#e0f2fe", layout: "split" },
  sunset: { accent: "#c2410c", pale: "#fff7ed", layout: "band" },
  lavender: { accent: "#7e22ce", pale: "#faf5ff", layout: "editorial" },
  mono: { accent: "#27272a", pale: "#f4f4f5", layout: "minimal" },
  classic: { accent: "#854d0e", pale: "#fefce8", layout: "classic" },
  coral: { accent: "#be123c", pale: "#fff1f2", layout: "band" },
  forest: { accent: "#166534", pale: "#f0fdf4", layout: "classic" },
  royal: { accent: "#48269b", pale: "#f0ebfa", layout: "sidebar" },
};

function makePdf(invoice: PdfInvoice) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 16;
  const right = pageW - margin;
  const palette = palettes[invoice.template || "emerald"] || palettes.emerald;
  const accent = palette.accent;
  const rgb = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)] as [number, number, number];
  const ink: [number, number, number] = [25, 38, 32];
  const muted: [number, number, number] = [104, 119, 110];
  const line: [number, number, number] = [225, 232, 227];
  const pale = rgb(palette.pale);
  const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: invoice.currency, maximumFractionDigits: 2 }).format(Number(value || 0));
  const text = (value: unknown) => String(value ?? "").trim();
  let y = 18;

  if (palette.layout === "dark") {
    pdf.setFillColor(...rgb("#172554")); pdf.rect(0, 0, pageW, 61, "F");
    pdf.setTextColor(255, 255, 255);
  } else if (palette.layout === "band") {
    pdf.setFillColor(...rgb(accent)); pdf.rect(0, 0, pageW, 39, "F");
    pdf.setTextColor(255, 255, 255);
  } else if (palette.layout === "sidebar") {
    pdf.setFillColor(...rgb(accent)); pdf.rect(0, 0, 9, 297, "F");
  } else if (palette.layout === "classic") {
    pdf.setDrawColor(...rgb(accent)); pdf.setLineWidth(0.8); pdf.line(margin, 15, right, 15);
  }

  const topText = palette.layout === "dark" || palette.layout === "band";
  const headInk = topText ? [255, 255, 255] as [number, number, number] : ink;
  const headMuted = topText ? [224, 231, 255] as [number, number, number] : muted;
  const left = palette.layout === "sidebar" ? 22 : margin;

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.setTextColor(...headInk);
  pdf.text(text(invoice.business.name) || "Business", left, 25);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...headMuted);
  const businessLines = [invoice.business.address, invoice.business.email, invoice.business.phone].filter(Boolean).map(text);
  if (businessLines.length) pdf.text(businessLines, left, 32, { lineHeightFactor: 1.45, maxWidth: 90 });

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(23); pdf.setTextColor(...(topText ? [255,255,255] as [number,number,number] : rgb(accent)));
  pdf.text((invoice.type || "INVOICE").toUpperCase(), right, 24, { align: "right" });
  pdf.setFontSize(10); pdf.setTextColor(...headMuted); pdf.text(text(invoice.number), right, 31, { align: "right" });
  y = palette.layout === "dark" ? 73 : palette.layout === "band" ? 51 : 54;

  if (palette.layout === "split") {
    pdf.setFillColor(...pale); pdf.roundedRect(left, y - 5, 82, 31, 2, 2, "F");
    pdf.setFillColor(248, 250, 249); pdf.roundedRect(105, y - 5, 89, 31, 2, 2, "F");
  }
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...rgb(accent));
  pdf.text("BILLED TO", left + 2, y);
  pdf.text("INVOICE DETAILS", 108, y);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(...ink);
  pdf.text(text(invoice.client?.name) || "Customer", left + 2, y + 7);
  pdf.setFontSize(8.5); pdf.setTextColor(...muted);
  const clientLines = [invoice.client?.email, invoice.client?.phone, invoice.client?.address].filter(Boolean).map(text);
  if (clientLines.length) pdf.text(clientLines, left + 2, y + 13, { maxWidth: 78, lineHeightFactor: 1.4 });
  pdf.setTextColor(...ink); pdf.setFontSize(8.5);
  pdf.text("Issued: " + text(invoice.issueDate), 108, y + 7);
  pdf.text("Due: " + (text(invoice.dueDate) || "Not specified"), 108, y + 14);
  y += 39;

  const tableX = left;
  const tableW = right - left;
  const descW = tableW * 0.48;
  const qtyW = tableW * 0.12;
  const rateW = tableW * 0.18;
  const amountW = tableW - descW - qtyW - rateW;
  const colDesc = tableX + 3;
  const colQty = tableX + descW + qtyW - 2;
  const colRate = tableX + descW + qtyW + rateW - 2;
  const colAmount = right - 3;
  const drawTableHead = () => {
    pdf.setFillColor(...rgb(accent)); pdf.roundedRect(tableX, y, tableW, 10, 1.5, 1.5, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5); pdf.setTextColor(255, 255, 255);
    pdf.text("DESCRIPTION", colDesc, y + 6.5);
    pdf.text("QTY", colQty, y + 6.5, { align: "right" });
    pdf.text("RATE", colRate, y + 6.5, { align: "right" });
    pdf.text("AMOUNT", colAmount, y + 6.5, { align: "right" });
    y += 10;
  };
  drawTableHead();
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5);
  for (const item of invoice.items) {
    const lines = pdf.splitTextToSize(text(item.description), descW - 8);
    const rowH = Math.max(10, lines.length * 4.2 + 5);
    if (y + rowH > 255) { pdf.addPage(); y = 18; drawTableHead(); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); }
    pdf.setDrawColor(...line); pdf.line(tableX, y + rowH, right, y + rowH);
    pdf.setTextColor(...ink); pdf.text(lines, colDesc, y + 6, { lineHeightFactor: 1.25 });
    pdf.setTextColor(...muted); pdf.text(String(item.quantity), colQty, y + 6, { align: "right" });
    pdf.text(money(item.unitPrice), colRate, y + 6, { align: "right" });
    pdf.setTextColor(...ink); pdf.text(money(item.amount), colAmount, y + 6, { align: "right" });
    y += rowH;
  }
  if (y + 75 > 265) { pdf.addPage(); y = 20; }
  y += 9;
  const summaryX = right - 78;
  const summary = [
    ["Subtotal", money(invoice.subtotal)],
    ["Discount", "− " + money(invoice.discount)],
    ["Tax", money(invoice.tax)],
  ];
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...muted);
  for (const [label, value] of summary) {
    pdf.text(label, summaryX, y); pdf.setTextColor(...ink); pdf.text(value, right, y, { align: "right" }); pdf.setTextColor(...muted); y += 7;
  }
  y += 1;
  pdf.setFillColor(...pale); pdf.roundedRect(summaryX - 3, y - 5, right - summaryX + 3, 17, 2, 2, "F");
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...rgb(accent));
  pdf.text(invoice.balance !== undefined ? "BALANCE DUE" : "TOTAL DUE", summaryX, y + 5);
  pdf.setFontSize(12); pdf.text(money(invoice.balance !== undefined ? invoice.balance : invoice.total), right - 2, y + 5, { align: "right" });
  y += 24;

  if (invoice.bank && Object.values(invoice.bank).some(Boolean)) {
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setDrawColor(...line); pdf.line(left, y, right, y); y += 8;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...ink); pdf.text("PAYMENT INFORMATION", left, y); y += 6;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...muted);
    const bankLines = [
      invoice.bank.bank_name ? "Bank: " + invoice.bank.bank_name : "",
      invoice.bank.account_name ? "Account name: " + invoice.bank.account_name : "",
      invoice.bank.account_number ? "Account number: " + invoice.bank.account_number : "",
      invoice.bank.paypal_email ? "PayPal: " + invoice.bank.paypal_email : "",
      invoice.bank.payment_instructions || "",
    ].filter(Boolean);
    const wrapped = pdf.splitTextToSize(bankLines.join("   •   "), tableW);
    pdf.text(wrapped, left, y); y += wrapped.length * 4.2 + 4;
  }
  if (invoice.notes) {
    if (y > 265) { pdf.addPage(); y = 20; }
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...ink); pdf.text("NOTES", left, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8.5); pdf.setTextColor(...muted);
    const noteLines = pdf.splitTextToSize(text(invoice.notes), tableW);
    pdf.text(noteLines, left, y); y += noteLines.length * 4.2;
  }
  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page); pdf.setDrawColor(...line); pdf.line(margin, 282, right, 282);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...muted);
    pdf.text(text(invoice.business.name) + " · " + text(invoice.number), margin, 287);
    pdf.text("Page " + page + " of " + pageCount, right, 287, { align: "right" });
  }
  const filename = (text(invoice.number) || "invoice").replace(/[^a-z0-9-_]/gi, "-") + ".pdf";
  return { pdf, filename };
}

export function InvoicePdfActions({ invoice, publicUrl }: { invoice: PdfInvoice; publicUrl?: string }) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  async function download() {
    setBusy("download");
    try { const { pdf, filename } = makePdf(invoice); pdf.save(filename); }
    finally { setBusy(null); }
  }
  async function share() {
    setBusy("share");
    try {
      const { pdf, filename } = makePdf(invoice);
      const blob = pdf.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename, text: publicUrl ? "Please find your invoice attached." : undefined });
      } else {
        pdf.save(filename);
        if (publicUrl) window.open("https://wa.me/?text=" + encodeURIComponent("I've attached your invoice PDF. You can also view it here: " + publicUrl), "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") console.error("Could not share invoice PDF", error);
    } finally { setBusy(null); }
  }
  return <div className="flex flex-wrap gap-2 print:hidden">
    <button type="button" onClick={download} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm font-semibold text-[#34483d] disabled:opacity-60">
      {busy === "download" ? <LoaderCircle className="animate-spin" size={16}/> : <Download size={16}/>} Download PDF
    </button>
    <button type="button" onClick={share} disabled={busy !== null} className="inline-flex items-center gap-2 rounded-xl bg-[#087b58] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
      {busy === "share" ? <LoaderCircle className="animate-spin" size={16}/> : <Share2 size={16}/>} Share PDF
    </button>
  </div>;
}
