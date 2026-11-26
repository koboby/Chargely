"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useState } from "react";
function ToastInner(){
 const params=useSearchParams(),router=useRouter(),pathname=usePathname();
 const success=params.get("success"),error=params.get("error");
 const [visible,setVisible]=useState(true);
 useEffect(()=>{if(success||error){setVisible(true);const t=setTimeout(()=>{router.replace(pathname,{scroll:false});},4200);return()=>clearTimeout(t);}},[success,error,router,pathname]);
 if(!visible||(!success&&!error))return null;
 const ok=!!success;
 return <div role="status" aria-live="polite" className={`fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${ok?"border-emerald-200 bg-white text-emerald-800":"border-rose-200 bg-white text-rose-800"}`}>
  {ok?<CheckCircle2 size={21}/>:<AlertCircle size={21}/>}
  <span className="text-sm font-semibold">{success||error}</span>
  <button onClick={()=>{setVisible(false);router.replace(pathname,{scroll:false});}} aria-label="Dismiss notification"><X size={17}/></button>
 </div>
}
export function Feedback(){return <Suspense fallback={null}><ToastInner/></Suspense>}
export function ConfirmForm({children,message="Are you sure you want to delete this item?",...props}:{children:React.ReactNode;message?:string;action:(data:FormData)=>void;className?:string}){
 return <form {...props} onSubmit={e=>{if(!window.confirm(message))e.preventDefault();}}>{children}</form>
}
