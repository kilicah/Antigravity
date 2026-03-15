"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Kontrol Merkezi", href: "/", icon: "📊" },
    { name: "Sipariş Giriş", href: "/orders/new", icon: "✨" },
    { name: "Siparişler", href: "/orders", icon: "📋" },
    { name: "Üretim Takibi", href: "/production", icon: "🏭" },
    { name: "Faturalar", href: "/invoices", icon: "💰" },
    { name: "Firmalar", href: "/companies", icon: "🏢" },
    { name: "Banka Hesapları", href: "/bank-infos", icon: "🏦" },
    { name: "Markalar", href: "/brands", icon: "📌" },
  ];

  return (
    <aside className="w-[280px] bg-[#0B1120] text-slate-300 min-h-screen flex flex-col print:hidden border-r border-[#1E293B] shadow-2xl relative z-20">
      <div className="h-20 flex items-center px-8 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg leading-none">Y</span>
           </div>
           <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider">YUPPI ERP</h1>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 font-semibold" 
                      : "hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <span className={`mr-3 text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
        <span className="font-medium">USK Global</span>
        <span className="bg-slate-800 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider">v1.02</span>
      </div>
    </aside>
  );
}
