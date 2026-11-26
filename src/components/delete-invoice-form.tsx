"use client";
import { deleteInvoice } from "@/app/actions/invoices";
export function DeleteInvoiceForm({id}:{id:string}){
 const action=deleteInvoice.bind(null,id);
 return <form action={action} onSubmit={event=>{if(!window.confirm("Delete this invoice permanently? Its line items, payment records and signature will also be deleted. This cannot be undone."))event.preventDefault();}}>
 <button type="submit" className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">Delete invoice</button>
 </form>;
}