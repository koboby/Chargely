import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
function csv(value:unknown){const s=String(value??"");return '"'+s.replace(/"/g,'""')+'"';}
export async function GET(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Unauthorised"},{status:401});
 const {data:docs,error}=await supabase.from("documents").select("number,type,status,issue_date,due_date,currency,subtotal,discount,tax,total").order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:"Unable to export invoices"},{status:500});
 const headers=["Number","Type","Status","Issue date","Due date","Currency","Subtotal","Discount","Tax","Total"];
 const rows=(docs||[]).map(d=>[d.number,d.type,d.status,d.issue_date,d.due_date,d.currency,d.subtotal,d.discount,d.tax,d.total].map(csv).join(","));
 return new NextResponse([headers.map(csv).join(","),...rows].join("\r\n"),{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":'attachment; filename="chargely-invoices.csv"',"cache-control":"private, no-store"}});
}