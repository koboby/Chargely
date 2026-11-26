"use client";
import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
const designs=[
 {id:"royal",name:"Royal Signature",accent:"#48269b",soft:"#f0ebfa",kind:"bold",desc:"Bold purple brand header"},
 {id:"emerald",name:"Modern Emerald",accent:"#087b58",soft:"#e8f5ef",kind:"clean",desc:"Fresh, clean business style"},
 {id:"midnight",name:"Midnight Luxe",accent:"#172554",soft:"#eef2ff",kind:"dark",desc:"Premium dark navy"},
 {id:"ocean",name:"Ocean Blue",accent:"#0369a1",soft:"#e0f2fe",kind:"clean",desc:"Crisp blue corporate"},
 {id:"sunset",name:"Sunset",accent:"#c2410c",soft:"#fff7ed",kind:"bold",desc:"Warm and confident"},
 {id:"lavender",name:"Lavender",accent:"#7e22ce",soft:"#faf5ff",kind:"clean",desc:"Elegant creative"},
 {id:"mono",name:"Monochrome",accent:"#27272a",soft:"#f4f4f5",kind:"minimal",desc:"Minimal black and white"},
 {id:"classic",name:"Classic Gold",accent:"#854d0e",soft:"#fefce8",kind:"classic",desc:"Traditional and refined"},
 {id:"coral",name:"Coral",accent:"#be123c",soft:"#fff1f2",kind:"bold",desc:"Distinctive modern"},
 {id:"forest",name:"Forest",accent:"#166534",soft:"#f0fdf4",kind:"classic",desc:"Grounded natural tones"}
];
function MiniInvoice({t,large=false}:{t:typeof designs[number];large?:boolean}){
 return <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${large?"":"aspect-[1.18]"}`}>
  <div className={`relative px-3 py-3 text-white ${t.kind==="dark"?"bg-slate-950":""}`} style={t.kind!=="dark"?{background:t.accent}:{}}>
   <div className="flex items-center justify-between"><div><div className="h-2 w-16 rounded bg-white/90"/><div className="mt-1 h-1.5 w-10 rounded bg-white/55"/></div><div className="text-[8px] font-black tracking-[.18em]" style={{color:t.kind==="clean"||t.kind==="minimal"||t.kind==="classic"?t.accent:undefined}}>INVOICE</div></div>
   {t.kind==="bold"&&<div className="absolute -bottom-2 left-0 h-3 w-full rounded-[50%] bg-white/40"/>}
  </div>
  <div className="p-3">
   <div className="flex justify-between"><div><div className="h-1.5 w-14 rounded bg-slate-700"/><div className="mt-1 h-1 w-20 rounded bg-slate-200"/></div><div className="text-right"><div className="h-1 w-10 rounded bg-slate-300"/><div className="mt-1 h-1 w-12 rounded bg-slate-200"/></div></div>
   <div className="mt-4 grid grid-cols-4 gap-1 px-1 py-1.5" style={{background:t.soft}}><span className="col-span-2 h-1 rounded bg-slate-500"/><span className="h-1 rounded bg-slate-500"/><span className="h-1 rounded bg-slate-500"/></div>
   {[0,1,2].map(n=><div key={n} className="grid grid-cols-4 gap-1 border-b border-slate-100 px-1 py-2"><span className="col-span-2 h-1 rounded bg-slate-300"/><span className="h-1 rounded bg-slate-200"/><span className="h-1 rounded bg-slate-300"/></div>)}
   <div className="ml-auto mt-3 h-5 w-20 rounded" style={{background:t.soft}}/>
   <div className="mt-3 flex justify-between"><div className="h-1 w-14 rounded bg-slate-300"/><div className="h-2 w-16 rounded" style={{background:t.accent}}/></div>
  </div>
 </div>
}
export function TemplateGallery({initial="emerald"}:{initial?:string}){
 const [selected,setSelected]=useState(initial),[preview,setPreview]=useState<string|null>(null);
 const current=designs.find(x=>x.id===preview);
 return <div>
  <input type="hidden" name="default_template" value={selected}/>
  <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Choose your invoice style</h2><p className="mt-1 text-sm text-slate-500">Ten distinct looks. Preview before you decide.</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">10 designs</span></div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
   {designs.map(t=><div key={t.id} className={`rounded-2xl border bg-white p-2 transition ${selected===t.id?"border-violet-500 ring-2 ring-violet-100":"border-slate-200 hover:border-slate-300"}`}>
    <button type="button" onClick={()=>setSelected(t.id)} className="block w-full text-left"><MiniInvoice t={t}/><div className="flex items-center justify-between gap-1 px-1 pt-2"><span className="text-xs font-bold text-slate-800">{t.name}</span>{selected===t.id?<span className="grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-white"><Check size={13}/></span>:<span className="h-5 w-5 rounded-full border border-slate-300"/>}</div><p className="px-1 pb-1 pt-1 text-[10px] text-slate-500">{t.desc}</p></button>
    <button type="button" onClick={()=>setPreview(t.id)} className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"><Eye size={13}/> Preview</button>
   </div>)}
  </div>
  {current&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-3 sm:p-6" onClick={()=>setPreview(null)}><div role="dialog" aria-modal="true" aria-label={current.name+" invoice preview"} onClick={e=>e.stopPropagation()} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-600">Template preview</p><h3 className="mt-1 text-xl font-bold">{current.name}</h3></div><button type="button" onClick={()=>setPreview(null)} className="rounded-full bg-slate-100 p-2"><X size={18}/></button></div><div className="mx-auto max-w-lg"><MiniInvoice t={current} large/><div className="mt-4 rounded-xl p-4" style={{background:current.soft}}><p className="text-xs font-bold" style={{color:current.accent}}>PAYMENT INFORMATION</p><p className="mt-2 text-sm text-slate-600">Your saved bank details and payment instructions appear here on the finished invoice.</p></div></div><div className="mt-5 flex gap-2"><button type="button" onClick={()=>{setSelected(current.id);setPreview(null)}} className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white" style={{background:current.accent}}>Use this template</button><button type="button" onClick={()=>setPreview(null)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Close</button></div></div></div>}
 </div>
}
