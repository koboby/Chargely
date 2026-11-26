import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, FileText, Users, Package, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { Feedback } from "@/components/feedback";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

const nav = [
 { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
 { href: "/invoices", label: "Invoices", icon: FileText },
 { href: "/clients", label: "Clients", icon: Users },
 { href: "/items", label: "Saved items", icon: Package },
 { href: "/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) redirect("/login");
 const navItems = user.email?.toLowerCase() === "blundigold@gmail.com"
  ? [...nav, { href: "/admin", label: "Admin", icon: ShieldCheck }]
  : nav;

 return (
  <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#eef8f1_0%,_#f7f9f7_38%,_#f7f9f7_100%)] md:flex">
   <Feedback />
   <aside className="hidden w-64 shrink-0 border-r border-[#e6ece7] bg-white p-5 md:flex md:flex-col">
    <Brand />
    <p className="mb-3 mt-10 px-3 text-[10px] font-bold tracking-[.18em] text-[#9aa59e]">WORKSPACE</p>
    <nav className="space-y-1">
     {navItems.map(({ href, label, icon: Icon }) => (
      <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#637168] transition hover:bg-[#edf6f0] hover:text-[#087b58]">
       <Icon size={18} />{label}
      </Link>
     ))}
    </nav>
    <div className="mt-auto rounded-2xl bg-[#f3f8f4] p-4">
     <p className="truncate text-sm font-bold">{user.email}</p>
     <p className="mt-1 text-xs text-[#849189]">Chargely account</p>
     <form action={signOut} className="mt-4">
      <button className="flex items-center gap-2 text-xs font-semibold text-[#68776f]"><LogOut size={14} /> Sign out</button>
     </form>
    </div>
   </aside>
   <div className="min-w-0 flex-1">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6ece7] bg-white/90 px-5 py-4 backdrop-blur md:hidden">
     <Brand />
     <form action={signOut}><button aria-label="Sign out" className="rounded-lg p-2 text-[#637168]"><LogOut size={18} /></button></form>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-9">
     <div className="mb-4 flex justify-end"><PwaInstallButton /></div>
     {children}
    </div>
    <nav className={`fixed inset-x-0 bottom-0 z-20 grid ${navItems.length === 6 ? "grid-cols-6" : "grid-cols-5"} border-t border-[#e6ece7] bg-white px-1 py-2 md:hidden`}>
     {navItems.map(({ href, label, icon: Icon }) => (
      <Link key={href} href={href} className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-[#718078]">
       <Icon size={19} />{label}
      </Link>
     ))}
    </nav>
   </div>
  </div>
 );
}
