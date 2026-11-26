"use client";
import { useEffect,useState } from "react";
import { Download, Smartphone } from "lucide-react";
type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed"}>};
export function PwaInstallButton(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);const [installed,setInstalled]=useState(false);const [ios,setIos]=useState(false);
 useEffect(()=>{const standalone=window.matchMedia("(display-mode: standalone)").matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;setInstalled(standalone);setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));const handler=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallPromptEvent);};window.addEventListener("beforeinstallprompt",handler);window.addEventListener("appinstalled",()=>setInstalled(true));return()=>window.removeEventListener("beforeinstallprompt",handler);},[]);
 if(installed)return <span className="inline-flex items-center gap-2 rounded-xl bg-[#eaf5ee] px-3 py-2 text-xs font-semibold text-[#087b58]"><Smartphone size={15}/> App installed</span>;
 if(!promptEvent&&!ios)return null;
 return <button type="button" onClick={async()=>{if(promptEvent){await promptEvent.prompt();const result=await promptEvent.userChoice;if(result.outcome==="accepted")setInstalled(true);setPromptEvent(null);}else window.alert("To install Chargely on iPhone: tap the Share button in Safari, then choose Add to Home Screen.");}} className="inline-flex items-center gap-2 rounded-xl border border-[#dce9df] bg-white px-3 py-2 text-xs font-semibold text-[#087b58] hover:bg-[#f4faf5]"><Download size={15}/> Install app</button>;
}