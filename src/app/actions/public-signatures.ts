"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function signPublicDocument(token:string,formData:FormData){
 const name=String(formData.get("signer_name")||"").trim();
 const signature=String(formData.get("signature_data")||"");
 if(name.length<2||name.length>120||!signature.startsWith("data:image/png;base64,")||signature.length>500000)redirect(`/i/${token}?error=Please%20enter%20your%20name%20and%20draw%20a%20valid%20signature`);
 const supabase=await createClient();
 const {error}=await supabase.rpc("sign_public_document",{p_token:token,p_signer_name:name,p_signature_data:signature});
 if(error){const message=error.message.toLowerCase().includes("already signed")?"This document has already been signed":"Could not save your signature. Please try again";redirect(`/i/${token}?error=${encodeURIComponent(message)}`);}
 redirect(`/i/${token}?success=Document%20signed%20successfully`);
}