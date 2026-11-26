"use client";
import { useState } from "react";
import { Copy, Printer, MessageCircle, Check } from "lucide-react";
export function InvoiceActions({publicUrl}:{publicUrl:string}){
 const [copied,setCopied]=useState(false);
 async function copy(){try{await navigator.clipboard.writeText(publicUrl);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}catch{window.prompt("Copy this invoice link",publicUrl);}}
 return <div className="flex flex-wrap gap-2 print:hidden"><button type="button" onClick={()=>window.print()} className="rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm font-semibold"><Printer className="mr-2 inline" size={16}/> Print / PDF</button><button type="button" onClick={copy} className="rounded-xl border border-[#dfe7e1] bg-white px-4 py-3 text-sm font-semibold">{copied?<Check className="mr-2 inline text-[#087b58]" size={16}/>:<Copy className="mr-2 inline" size={16}/>} {copied?"Copied":"Copy link"}</button><a target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent("Please find your invoice: "+publicUrl)}`} className="rounded-xl bg-[#087b58] px-4 py-3 text-sm font-semibold text-white"><MessageCircle className="mr-2 inline" size={16}/> WhatsApp</a></div>;
}