"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Kontrol Üssü", href: "/", icon: "📊" },
    { name: "Sipariş Giriş", href: "/orders/new", icon: "📝" },
    { name: "Siparişler", href: "/orders", icon: "📋" },
    { name: "Üretim Siparişleri", href: "/production", icon: "🏭" },
    { name: "Faturalar", href: "/invoices", icon: "💰" },
    { name: "Firmalar", href: "/companies", icon: "🏢" },
    { name: "Banka Hesapları", href: "/bank-infos", icon: "🏦" },
    { name: "Markalar", href: "/brands", icon: "📌" },
    { name: "Temsilciler", href: "/representatives", icon: "👥" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col print:hidden">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider">YUPPI ERP</h1>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 hover:bg-slate-800 transition-colors ${
                    isActive ? "bg-slate-800 text-blue-400 border-r-4 border-blue-500" : ""
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        Yuppi System v1.0
      </div>
    </aside>
  );
}
