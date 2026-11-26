export const invoiceTemplates = {
  emerald: { name: "Emerald", accent: "#087b58", soft: "#e8f5ef", border: "#cde8d8", heading: "INVOICE", layout: "bold" },
  midnight: { name: "Midnight", accent: "#172554", soft: "#eef2ff", border: "#c7d2fe", heading: "INVOICE", layout: "clean" },
  ocean: { name: "Ocean", accent: "#0369a1", soft: "#e0f2fe", border: "#bae6fd", heading: "INVOICE", layout: "dark" },
  sunset: { name: "Sunset", accent: "#c2410c", soft: "#fff7ed", border: "#fed7aa", heading: "INVOICE", layout: "minimal" },
  lavender: { name: "Lavender", accent: "#7e22ce", soft: "#faf5ff", border: "#e9d5ff", heading: "INVOICE", layout: "bold" },
  mono: { name: "Monochrome", accent: "#27272a", soft: "#f4f4f5", border: "#d4d4d8", heading: "INVOICE", layout: "soft" },
  classic: { name: "Classic", accent: "#854d0e", soft: "#fefce8", border: "#fde68a", heading: "INVOICE", layout: "minimal" },
  coral: { name: "Coral", accent: "#be123c", soft: "#fff1f2", border: "#fecdd3", heading: "INVOICE", layout: "classic" },
  forest: { name: "Forest", accent: "#166534", soft: "#f0fdf4", border: "#bbf7d0", heading: "INVOICE", layout: "bold" },
  royal: { name: "Royal", accent: "#48269b", soft: "#f0ebfa", border: "#ddd0f5", heading: "INVOICE", layout: "dark" },
} as const;
export type InvoiceTemplateKey = keyof typeof invoiceTemplates;
export function getInvoiceTemplate(key?: string) {
  return invoiceTemplates[key as InvoiceTemplateKey] ?? invoiceTemplates.emerald;
}