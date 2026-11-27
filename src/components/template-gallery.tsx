"use client";
import { useState } from "react";
import { Check, Eye, X } from "lucide-react";

const designs = [
  {id:"emerald",name:"Emerald Editorial",accent:"#087b58",soft:"#e8f5ef",layout:"editorial",desc:"Editorial hierarchy with generous whitespace"},
  {id:"midnight",name:"Midnight Executive",accent:"#172554",soft:"#eef2ff",layout:"dark",desc:"Dark executive masthead and crisp detail blocks"},
  {id:"ocean",name:"Ocean Split",accent:"#0369a1",soft:"#e0f2fe",layout:"split",desc:"Side-by-side client and invoice information"},
  {id:"sunset",name:"Sunset Banner",accent:"#c2410c",soft:"#fff7ed",layout:"band",desc:"Strong full-width document title band"},
  {id:"lavender",name:"Lavender Editorial",accent:"#7e22ce",soft:"#faf5ff",layout:"editorial",desc:"Airy editorial layout with restrained purple"},
  {id:"mono",name:"Monochrome Minimal",accent:"#27272a",soft:"#f4f4f5",layout:"minimal",desc:"Ink-only typography and minimal rules"},
  {id:"classic",name:"Classic Ledger",accent:"#854d0e",soft:"#fefce8",layout:"classic",desc:"Traditional ruled sections and ledger table"},
  {id:"coral",name:"Coral Banner",accent:"#be123c",soft:"#fff1f2",layout:"band",desc:"Confident title band with warm accent"},
  {id:"forest",name:"Forest Ledger",accent:"#166534",soft:"#f0fdf4",layout:"classic",desc:"Structured business ledger with forest accent"},
  {id:"royal",name:"Royal Sidebar",accent:"#48269b",soft:"#f0ebfa",layout:"sidebar",desc:"Distinctive vertical brand rail and modern grid"}
] as const;

function MiniInvoice({t,large=false}:{t:typeof designs[number];large?:boolean}){
 const scale=large?"p-6 min-h-[470px]":"p-3 min-h-[180px]";
 return <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
  {t.layout==="sidebar"&&<div className="absolute inset-y-0 left-0 w-2" style={{background:t.accent}}/>}
  <div className={`relative ${scale} ${t.layout==="dark"?"text-white":""} ${t.layout==="band"?"text-white":""}`} style={{background:t.layout==="dark"?"#172554":t.layout==="band"?t.accent:"#fff",borderTop:t.layout==="classic"?"4px solid "+t.accent:undefined}}>
   <div className={`flex items-start justify-between gap-2 ${t.layout==="editorial"?"border-b pb-3":""}`} style={{borderColor:t.layout==="editorial"?t.accent:undefined}}>
    <div><div className={`h-3 rounded ${large?"w-32":"w-16"} ${t.layout==="dark"||t.layout==="band"?"bg-white":"bg-slate-800"}`}/><div className={`mt-2 h-1.5 w-20 rounded ${t.layout==="dark"||t.layout==="band"?"bg-white/50":"bg-slate-300"}`}/><div className={`mt-1 h-1.5 w-14 rounded ${t.layout==="dark"||t.layout==="band"?"bg-white/40":"bg-slate-200"}`}/></div>
    <div className="text-right"><p className="text-[9px] font-black tracking-[.18em]" style={{color:t.layout==="dark"||t.layout==="band"?"#fff":t.accent}}>INVOICE</p><div className={`mt-1 ml-auto h-1.5 w-12 rounded ${t.layout==="dark"||t.layout==="band"?"bg-white/60":"bg-slate-300"}`}/></div>
   </div>
   <div className={`mt-4 grid gap-2 ${t.layout==="split"?"grid-cols-2":t.layout==="editorial"?"grid-cols-[1.2fr_.8fr]":"grid-cols-2"}`}>
    <div className="rounded-lg p-2" style={{background:t.layout==="minimal"?"#fff":t.soft,border:t.layout==="minimal"?"1px solid #e5e7eb":undefined}}><div className="h-1.5 w-12 rounded" style={{background:t.accent}}/><div className="mt-2 h-2 w-20 rounded bg-slate-700"/><div className="mt-1 h-1 w-16 rounded bg-slate-300"/></div>
    <div className="rounded-lg p-2" style={{background:t.layout==="split"?"#f8fafc":"#fff",border:"1px solid #edf0ed"}}><div className="h-1.5 w-14 rounded bg-slate-400"/><div className="mt-2 h-2 w-16 rounded bg-slate-700"/><div className="mt-1 h-1 w-12 rounded bg-slate-300"/></div>
   </div>
   <div className="mt-4 overflow-hidden rounded-md border border-slate-100">
    <div className="grid grid-cols-[1fr_28px_40px] px-2 py-2" style={{background:t.soft}}><div className="h-1.5 w-14 rounded bg-slate-500"/><div className="h-1.5 w-4 rounded bg-slate-500"/><div className="ml-auto h-1.5 w-7 rounded bg-slate-500"/></div>
    {[0,1,2].map(n=><div key={n} className="grid grid-cols-[1fr_28px_40px] border-t border-slate-100 px-2 py-2"><div className="h-1.5 w-20 rounded bg-slate-300"/><div className="h-1.5 w-3 rounded bg-slate-200"/><div className="ml-auto h-1.5 w-7 rounded bg-slate-300"/></div>)}
   </div>
   <div className="mt-4 flex justify-end"><div className="w-28 rounded-lg p-2" style={{background:t.soft}}><div className="h-1.5 w-full rounded bg-slate-300"/><div className="mt-2 h-3 w-full rounded" style={{background:t.accent}}/></div></div>
   {t.layout==="classic"&&<div className="mt-4 border-t pt-2" style={{borderColor:t.accent}}><div className="h-1 w-24 rounded bg-slate-300"/></div>}
  </div>
 </div>;
}

export function TemplateGallery({initial="emerald"}:{initial?:string}){
 const [selected,setSelected]=useState(initial),[preview,setPreview]=useState<string|null>(null);
 const current=designs.find(x=>x.id===preview);
 return <div>
  <input type="hidden" name="default_template" value={selected}/>
  <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Choose your invoice layout</h2><p className="mt-1 text-sm text-slate-500">These designs change document structure, not only colour.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">10 styles</span></div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
   {designs.map(t=><div key={t.id} className={`rounded-2xl border bg-white p-2 transition ${selected===t.id?"border-emerald-600 ring-2 ring-emerald-100":"border-slate-200 hover:border-slate-300"}`}>
    <button type="button" onClick={()=>setSelected(t.id)} className="block w-full text-left"><MiniInvoice t={t}/><div className="flex items-center justify-between gap-1 px-1 pt-2"><span className="text-xs font-bold text-slate-800">{t.name}</span>{selected===t.id?<span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-700 text-white"><Check size={13}/></span>:<span className="h-5 w-5 rounded-full border border-slate-300"/>}</div><p className="px-1 pb-1 pt-1 text-[10px] leading-4 text-slate-500">{t.desc}</p></button>
    <button type="button" onClick={()=>setPreview(t.id)} className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"><Eye size={13}/> Preview full layout</button>
   </div>)}
  </div>
  {current&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-3 sm:p-6" onClick={()=>setPreview(null)}><div role="dialog" aria-modal="true" aria-label={current.name+" invoice preview"} onClick={e=>e.stopPropagation()} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Full layout preview</p><h3 className="mt-1 text-xl font-bold">{current.name}</h3></div><button type="button" onClick={()=>setPreview(null)} className="rounded-full bg-slate-100 p-2"><X size={18}/></button></div><div className="mx-auto max-w-lg"><MiniInvoice t={current} large/></div><div className="mt-5 flex gap-2"><button type="button" onClick={()=>{setSelected(current.id);setPreview(null)}} className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white" style={{background:current.accent}}>Use this layout</button><button type="button" onClick={()=>setPreview(null)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Close</button></div></div></div>}
 </div>;
}
