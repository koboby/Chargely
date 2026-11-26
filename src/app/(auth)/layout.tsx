import { Brand } from "@/components/brand";
export default function AuthLayout({children}:{children:React.ReactNode}) {
 return <main className="min-h-screen bg-[#f7f9f7] px-4 py-8"><div className="mx-auto max-w-md"><Brand/><div className="mt-8 rounded-3xl border border-[#e8eee9] bg-white p-6 shadow-sm sm:p-8">{children}</div><p className="mt-6 text-center text-xs text-[#8a968f]">Simple invoicing for your independent business.</p></div></main>;
}