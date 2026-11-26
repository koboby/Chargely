"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
export function LogoUploader({businessId,initialUrl}:{businessId:string;initialUrl:string|null}){
 const [logo,setLogo]=useState(initialUrl);const [message,setMessage]=useState("");const [isError,setIsError]=useState(false);const [busy,setBusy]=useState(false);
 async function compress(file:File):Promise<Blob>{
  const bitmap=await createImageBitmap(file);let scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));let quality=.82;
  for(let attempt=0;attempt<12;attempt++){
   const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const context=canvas.getContext("2d");if(!context)throw new Error("Your browser could not process this image.");
   context.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
   if(blob&&blob.size<=100*1024&&blob.type==="image/webp"){bitmap.close();return blob;}
   if(quality>.42)quality-=.1;else{scale*=.82;quality=.78;}
  }
  bitmap.close();throw new Error("Could not compress this image below 100KB. Try a simpler logo.");
 }
 async function upload(file?:File){
  if(!file)return;setBusy(true);setMessage("");setIsError(false);
  try{
   const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please log in again.");
   const blob=await compress(file);const path=`${user.id}/${businessId}/logo.webp`;
   const {error:uploadError}=await supabase.storage.from("business-logos").upload(path,blob,{upsert:true,contentType:"image/webp",cacheControl:"3600"});
   if(uploadError)throw uploadError;
   const {data:{publicUrl}}=supabase.storage.from("business-logos").getPublicUrl(path);
   const {error:updateError}=await supabase.from("businesses").update({logo_url:publicUrl}).eq("id",businessId);
   if(updateError)throw updateError;setLogo(publicUrl+`?v=${Date.now()}`);setMessage(`Logo uploaded · ${(blob.size/1024).toFixed(1)}KB`);
  }catch(error){setIsError(true);setMessage(error instanceof Error?error.message:"Logo upload failed.");}
  finally{setBusy(false);}
 }
 return <div className="rounded-2xl border border-[#e7ece8] bg-[#fbfcfb] p-4"><p className="text-sm font-semibold">Business logo</p><div className="mt-3 flex items-center gap-4">{logo?<Image src={logo} alt="Business logo" width={64} height={64} unoptimized className="h-16 w-16 rounded-xl border border-[#e7ece8] bg-white object-contain p-1"/>:<div className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-[#cbd8ce] text-xs text-[#849189]">No logo</div>}<div><label className="inline-flex cursor-pointer rounded-xl border border-[#dfe7e1] bg-white px-4 py-2.5 text-sm font-semibold">{busy?"Uploading…":"Choose logo"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={e=>upload(e.target.files?.[0])}/></label><p className="mt-2 text-xs text-[#849189]">PNG, JPG or WebP. Automatically compressed below 100KB.</p></div></div>{message&&<p aria-live="polite" className={`mt-3 text-xs ${isError?"text-rose-600":"text-emerald-700"}`}>{message}</p>}</div>;
}