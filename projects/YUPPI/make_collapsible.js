const fs = require('fs');
const content = `"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

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
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={\`\${isExpanded ? 'w-[280px]' : 'w-[88px]'} bg-[#0B1120] text-slate-300 min-h-screen flex flex-col print:hidden border-r border-[#1E293B] shadow-2xl relative z-20 transition-all duration-300 ease-in-out\`}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
           <div className="min-w-[32px] w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg leading-none">Y</span>
           </div>
           <h1 className={\`text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider transition-opacity duration-300 whitespace-nowrap \${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}\`}>YUPPI ERP</h1>
        </div>
        {isExpanded && (
           <button 
             onClick={() => setIsPinned(!isPinned)}
             className="text-slate-500 hover:text-white transition-colors"
             title={isPinned ? "Menüyü Daralt" : "Menüyü Sabitle"}
           >
             {isPinned ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
             )}
           </button>
        )}
      </div>
      
      <nav className="flex-1 py-6 px-4 overflow-hidden">
        <ul className="space-y-1.5 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <li key={item.name} title={!isExpanded ? item.name : ""}>
                <Link
                  href={item.href}
                  className={\`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group \${
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 font-semibold" 
                      : "hover:bg-slate-800/50 hover:text-white"
                  }\`}
                >
                  <span className={\`text-lg transition-transform duration-200 flex-shrink-0 \${isActive ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}\`}>
                    {item.icon}
                  </span>
                  <span className={\`ml-4 whitespace-nowrap transition-opacity duration-300 \${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}\`}>{item.name}</span>
                  {isActive && isExpanded && (
                     <div className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  )}
                  {isActive && !isExpanded && (
                     <div className="absolute left-0 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className={\`p-6 border-t border-slate-800/80 text-xs text-slate-500 flex items-center transition-all duration-300 \${isExpanded ? 'justify-between' : 'justify-center'}\`}>
        {isExpanded && <span className="font-medium whitespace-nowrap">USK Global</span>}
        <span className="bg-slate-800 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider">v1.08</span>
      </div>
    </aside>
  );
}
`;

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('Sidebar updated to be collapsible');
