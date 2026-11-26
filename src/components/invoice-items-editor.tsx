"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
type Line = { id:number; description:string; quantity:string; unitPrice:string };
let nextId=1;
const blank=():Line=>({id:nextId++,description:"",quantity:"1",unitPrice:""});
export function InvoiceItemsEditor({initialItems}:{initialItems?:{description:string;quantity:number;unit_price:number}[]}){
 const [items,setItems]=useState<Line[]>(()=>initialItems?.length?initialItems.map(item=>({id:nextId++,description:item.description,quantity:String(item.quantity),unitPrice:String(item.unit_price)})):[blank()]);
 const update=(id:number,key:keyof Omit<Line,"id">,value:string)=>setItems(current=>current.map(item=>item.id===id?{...item,[key]:value}:item));
 const add=()=>{if(items.length<500)setItems(current=>[...current,blank()]);};
 const remove=(id:number)=>setItems(current=>current.length>1?current.filter(item=>item.id!==id):current);
 return <div className="mt-4 space-y-3">
  {items.map((item,index)=><div key={item.id} className="rounded-xl border border-[#edf0ed] bg-[#f8faf8] p-3">
   <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-[#718078]">ITEM {index+1}</span><button type="button" onClick={()=>remove(item.id)} disabled={items.length===1} aria-label={`Remove item ${index+1}`} className="rounded-lg p-2 text-[#9b625d] hover:bg-rose-50 disabled:opacity-30"><Trash2 size={16}/></button></div>
   <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_100px_130px]">
    <input name="description" value={item.description} onChange={e=>update(item.id,"description",e.target.value)} required placeholder="Description" className="min-w-0 rounded-lg border border-[#dfe7e1] bg-white px-3 py-2.5 text-sm"/>
    <input name="quantity" type="number" min="0.001" step="0.001" value={item.quantity} onChange={e=>update(item.id,"quantity",e.target.value)} required placeholder="Qty" className="w-full rounded-lg border border-[#dfe7e1] bg-white px-3 py-2.5 text-sm"/>
    <input name="unit_price" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e=>update(item.id,"unitPrice",e.target.value)} required placeholder="Unit price" className="w-full rounded-lg border border-[#dfe7e1] bg-white px-3 py-2.5 text-sm"/>
   </div>
  </div>)}
  <button type="button" onClick={add} disabled={items.length>=500} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9fcbb5] px-4 py-3 text-sm font-semibold text-[#087b58] hover:bg-[#f1f8f3] disabled:opacity-40"><Plus size={17}/> Add another item ({items.length}/500)</button>
 </div>;
}