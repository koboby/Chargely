"use server";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export async function createInvoice(formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:business,error:be}=await supabase.from("businesses").select("id,currency").limit(1).maybeSingle();if(be)throw new Error(be.message);if(!business)redirect("/onboarding");
 const descriptions=formData.getAll("description").map(v=>String(v).trim());const quantities=formData.getAll("quantity").map(v=>Number(v));const prices=formData.getAll("unit_price").map(v=>Number(v));
 const lines=descriptions.map((description,i)=>({description,quantity:quantities[i],unit_price:prices[i]})).filter(x=>x.description);
 if(!lines.length||lines.some(x=>!Number.isFinite(x.quantity)||x.quantity<=0||!Number.isFinite(x.unit_price)||x.unit_price<0))throw new Error("Add at least one valid line item.");
 const clientId=String(formData.get("client_id")||"");if(!clientId)throw new Error("Choose a client.");
 const discount=Number(formData.get("discount")||0);const taxRate=Number(formData.get("tax_rate")||0);
 if(!Number.isFinite(discount)||discount<0||!Number.isFinite(taxRate)||taxRate<0||taxRate>100)throw new Error("Enter a valid discount and tax rate.");
 const {data:invoiceId,error}=await supabase.rpc("create_invoice",{p_business_id:business.id,p_client_id:clientId,p_issue_date:String(formData.get("issue_date")||new Date().toISOString().slice(0,10)),p_due_date:String(formData.get("due_date")||"")||null,p_currency:business.currency,p_discount:discount,p_tax_rate:taxRate,p_notes:String(formData.get("notes")||"").trim()||null,p_items:lines});
 if(error)throw new Error(error.message);revalidatePath("/dashboard");revalidatePath("/invoices");redirect(`/invoices/${invoiceId}?success=Invoice%20created%20successfully`);
}
export async function sendInvoice(id:string){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const token=randomBytes(32).toString("base64url");
 const {data:doc,error:readError}=await supabase.from("documents").select("id,status").eq("id",id).single();if(readError||!doc)throw new Error("Invoice not found.");
 if(doc.status==="draft"){const {error}=await supabase.from("documents").update({status:"sent",public_token:token}).eq("id",id);if(error)throw new Error(error.message);}
 revalidatePath(`/invoices/${id}`);revalidatePath("/invoices");redirect(`/invoices/${id}?success=Invoice%20marked%20as%20sent`);
}
export async function recordPayment(id:string,formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const amount=Number(formData.get("amount"));const method=String(formData.get("method")||"transfer");const note=String(formData.get("note")||"").trim()||null;
 if(!Number.isFinite(amount)||amount<=0)throw new Error("Enter a valid payment amount.");
 const {error}=await supabase.rpc("record_invoice_payment",{p_document_id:id,p_amount:amount,p_method:method,p_note:note});
 if(error)redirect(`/invoices/${id}?error=Could%20not%20record%20payment`);revalidatePath(`/invoices/${id}`);revalidatePath("/dashboard");redirect(`/invoices/${id}?success=Payment%20recorded%20successfully`);
}
