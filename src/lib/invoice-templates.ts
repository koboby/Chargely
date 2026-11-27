export const invoiceTemplates = {
  emerald: { name: "Emerald Editorial", accent: "#087b58", soft: "#e8f5ef", border: "#cde8d8", heading: "INVOICE", layout: "editorial" },
  midnight: { name: "Midnight Executive", accent: "#172554", soft: "#eef2ff", border: "#c7d2fe", heading: "INVOICE", layout: "dark" },
  ocean: { name: "Ocean Split", accent: "#0369a1", soft: "#e0f2fe", border: "#bae6fd", heading: "INVOICE", layout: "split" },
  sunset: { name: "Sunset Banner", accent: "#c2410c", soft: "#fff7ed", border: "#fed7aa", heading: "INVOICE", layout: "band" },
  lavender: { name: "Lavender Editorial", accent: "#7e22ce", soft: "#faf5ff", border: "#e9d5ff", heading: "INVOICE", layout: "editorial" },
  mono: { name: "Monochrome Minimal", accent: "#27272a", soft: "#f4f4f5", border: "#d4d4d8", heading: "INVOICE", layout: "minimal" },
  classic: { name: "Classic Ledger", accent: "#854d0e", soft: "#fefce8", border: "#fde68a", heading: "INVOICE", layout: "classic" },
  coral: { name: "Coral Banner", accent: "#be123c", soft: "#fff1f2", border: "#fecdd3", heading: "INVOICE", layout: "band" },
  forest: { name: "Forest Ledger", accent: "#166534", soft: "#f0fdf4", border: "#bbf7d0", heading: "INVOICE", layout: "classic" },
  royal: { name: "Royal Sidebar", accent: "#48269b", soft: "#f0ebfa", border: "#ddd0f5", heading: "INVOICE", layout: "sidebar" },
} as const;
export type InvoiceTemplateKey = keyof typeof invoiceTemplates;
export function getInvoiceTemplate(key?: string) {
  return invoiceTemplates[key as InvoiceTemplateKey] ?? invoiceTemplates.emerald;
}
