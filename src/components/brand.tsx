import Link from "next/link";
import { ReceiptText } from "lucide-react";
export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`inline-flex items-center gap-2 font-bold tracking-tight ${light ? "text-white" : "text-[#17251f]"}`}>
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#087b58] text-white"><ReceiptText size={19}/></span>
    <span className="text-xl">chargely<span className="text-[#0b9b6d]">.</span></span>
  </Link>;
}