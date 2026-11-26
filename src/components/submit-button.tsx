"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
export function SubmitButton({children,pendingLabel="Saving…",className=""}:{children:ReactNode;pendingLabel?:string;className?:string}){
 const {pending}=useFormStatus();
 return <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-65`}>{pending?pendingLabel:children}</button>;
}
