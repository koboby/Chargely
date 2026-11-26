"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function saveBusiness(formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const name=String(formData.get("name")||"").trim();if(!name)throw new Error("Business name is required.");
 const payload={owner_id:user.id,name,phone:String(formData.get("phone")||"").trim()||null,email:String(formData.get("email")||"").trim()||null,address:String(formData.get("address")||"").trim()||null,currency:String(formData.get("currency")||"NGN"),default_template:String(formData.get("default_template")||"emerald")};
 const {data:existing}=await supabase.from("businesses").select("id").limit(1).maybeSingle();
 const result=existing?await supabase.from("businesses").update(payload).eq("id",existing.id):await supabase.from("businesses").insert(payload);
 if(result.error)throw new Error(result.error.message);revalidatePath("/");redirect("/dashboard");
}
export async function createClientRecord(formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:business,error:be}=await supabase.from("businesses").select("id").limit(1).maybeSingle();if(be)throw new Error(be.message);if(!business)redirect("/onboarding");
 const name=String(formData.get("name")||"").trim();if(!name)throw new Error("Client name is required.");
 const {error}=await supabase.from("clients").insert({business_id:business.id,name,phone:String(formData.get("phone")||"").trim()||null,email:String(formData.get("email")||"").trim()||null,address:String(formData.get("address")||"").trim()||null});
 if(error)throw new Error(error.message);revalidatePath("/clients");
}
export async function deleteClient(id:string){const supabase=await createClient();const {error}=await supabase.from("clients").delete().eq("id",id);if(error)throw new Error(error.message);revalidatePath("/clients");}
export async function createItem(formData:FormData){
 const supabase=await createClient();const {data:business}=await supabase.from("businesses").select("id").limit(1).maybeSingle();if(!business)redirect("/onboarding");
 const name=String(formData.get("name")||"").trim();const price=Number(formData.get("default_price")||0);if(!name||!Number.isFinite(price)||price<0)throw new Error("Enter a valid item and price.");
 const {error}=await supabase.from("items").insert({business_id:business.id,name,default_price:price});if(error)throw new Error(error.message);revalidatePath("/items");
}
export async function deleteItem(id:string){const supabase=await createClient();const {error}=await supabase.from("items").delete().eq("id",id);if(error)throw new Error(error.message);revalidatePath("/items");}