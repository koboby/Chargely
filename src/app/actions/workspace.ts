"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function saveBusiness(formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const name=String(formData.get("name")||"").trim();if(!name)redirect("/settings?error=Business%20name%20is%20required");
 const bankDetails={bank_name:String(formData.get("bank_name")||"").trim(),account_name:String(formData.get("account_name")||"").trim(),account_number:String(formData.get("account_number")||"").trim(),payment_instructions:String(formData.get("payment_instructions")||"").trim(),paypal_email:String(formData.get("paypal_email")||"").trim()};
 const payload={owner_id:user.id,name,phone:String(formData.get("phone")||"").trim()||null,email:String(formData.get("email")||"").trim()||null,address:String(formData.get("address")||"").trim()||null,currency:String(formData.get("currency")||"NGN"),default_template:String(formData.get("default_template")||"emerald"),bank_details:bankDetails};
 const {data:existing,error:readError}=await supabase.from("businesses").select("id").limit(1).maybeSingle();if(readError)redirect("/settings?error=Could%20not%20load%20business%20settings");
 const result=existing?await supabase.from("businesses").update(payload).eq("id",existing.id):await supabase.from("businesses").insert(payload);
 if(result.error)redirect("/settings?error=Could%20not%20save%20settings");
 revalidatePath("/");revalidatePath("/settings");revalidatePath("/invoices");redirect("/settings?success=Business%20settings%20saved");
}
export async function createClientRecord(formData:FormData){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:business,error:be}=await supabase.from("businesses").select("id").limit(1).maybeSingle();if(be)throw new Error(be.message);if(!business)redirect("/onboarding");
 const name=String(formData.get("name")||"").trim();if(!name)throw new Error("Client name is required.");
 const {error}=await supabase.from("clients").insert({business_id:business.id,name,phone:String(formData.get("phone")||"").trim()||null,email:String(formData.get("email")||"").trim()||null,address:String(formData.get("address")||"").trim()||null});
 if(error)redirect("/clients?error=Could%20not%20add%20client");revalidatePath("/clients");redirect("/clients?success=Client%20added");
}
export async function deleteClient(id:string){const supabase=await createClient();const {error}=await supabase.from("clients").delete().eq("id",id);if(error)redirect("/clients?error=Could%20not%20delete%20client");revalidatePath("/clients");redirect("/clients?success=Client%20deleted");}
export async function createItem(formData:FormData){
 const supabase=await createClient();const {data:business}=await supabase.from("businesses").select("id").limit(1).maybeSingle();if(!business)redirect("/onboarding");
 const name=String(formData.get("name")||"").trim();const price=Number(formData.get("default_price")||0);if(!name||!Number.isFinite(price)||price<0)throw new Error("Enter a valid item and price.");
 const {error}=await supabase.from("items").insert({business_id:business.id,name,default_price:price});if(error)redirect("/items?error=Could%20not%20save%20item");revalidatePath("/items");redirect("/items?success=Item%20saved");
}
export async function deleteItem(id:string){const supabase=await createClient();const {error}=await supabase.from("items").delete().eq("id",id);if(error)redirect("/items?error=Could%20not%20delete%20item");revalidatePath("/items");redirect("/items?success=Item%20deleted");}