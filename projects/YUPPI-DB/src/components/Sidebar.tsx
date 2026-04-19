"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Profil ve Rol bilgisini çek
    if (pathname !== "/login") {
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => console.error(err));
        
      // Ping atarak kullanıcının 'online' görünmesini sağla
      const ping = () => fetch('/api/auth/ping', { method: 'POST' }).catch(() => {});
      ping(); // İlk açılışta
      const interval = setInterval(ping, 2 * 60 * 1000); // Her 2 dakikada
      return () => clearInterval(interval);
    }
  }, [pathname]);

  // Login ekranında Sidebar'ı tamamen gizle
  if (pathname === "/login") return null;

  const isExpanded = isPinned || isHovered;

  const coreNavItems = [
    { name: "Kontrol Merkezi", href: "/", icon: "📊" },
    { name: "Sipariş Giriş", href: "/orders/new", icon: "✨" },
    { name: "Siparişler", href: "/orders", icon: "📋" },
    { name: "Üretim Takibi", href: "/production", icon: "🏭" },
    { name: "Faturalar", href: "/invoices", icon: "💰" },
    { name: "Firmalar", href: "/companies", icon: "🏢" },
    { name: "Ürünler", href: "/products", icon: "📦" },
    { name: "Ar-Ge Deposu", href: "/rnd-items", icon: "🔬" },
    { name: "Banka Hesapları", href: "/bank-infos", icon: "🏦" },
    { name: "Markalar", href: "/brands", icon: "📌" },
  ];

  const adminNavItems = [
    { name: "Kullanıcı Profilleri", href: "/admin/users", icon: "👥" },
    { name: "Sistem Ayarları", href: "/settings", icon: "⚙️" },
  ];

  const renderNavList = (items: any[]) => (
    <ul className="space-y-1.5 w-full">
      {items.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
        return (
          <li key={item.name} title={!isExpanded ? item.name : ""}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400 font-semibold" 
                  : "hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <span className={`text-lg transition-transform duration-200 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 grayscale group-hover:grayscale-0'}`}>
                {item.icon}
              </span>
              <span className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
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
  );

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${isExpanded ? 'w-[280px]' : 'w-[88px]'} bg-[#0B1120] text-slate-300 min-h-screen flex flex-col print:hidden border-r border-[#1E293B] shadow-2xl relative z-20 transition-all duration-300 ease-in-out`}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
           <img src="/us-logo.png" className="w-10 h-10 object-contain drop-shadow-md" alt="US Logo" />
           <h1 className={`text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wider transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>YUPPI</h1>
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
      
      <nav className="flex-1 py-6 px-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {renderNavList(coreNavItems)}

        {/* SADECE ADMIN GÖREBİLİR */}
        {user?.role === 'ADMIN' && (
          <>
            <div className={`mt-8 mb-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
               <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Yönetim Paneli</span>
            </div>
            {renderNavList(adminNavItems)}
          </>
        )}
      </nav>
      
      <div className={`p-4 border-t border-slate-800/80 transition-all duration-300 ${isExpanded ? '' : 'flex flex-col items-center justify-center'}`}>
        <div className={`flex items-center gap-3 ${isExpanded ? 'justify-between' : 'justify-center flex-col'}`}>
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden relative group">
              {user?.avatar ? (
                 <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-sm font-bold text-slate-300">
                  {user?.fullName ? user.fullName.substring(0,2).toUpperCase() : (user?.username ? user.username.substring(0,2).toUpperCase() : '👤')}
                </span>
              )}
            </div>
            {isExpanded && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-200 truncate cursor-default">
                  {user?.fullName ? user.fullName : `@${user ? user.username : 'Misafir'}`}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-500">
                    {user?.role || 'BEKLENIYOR'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {isExpanded ? (
            <button 
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              title="Çıkış Yap"
              className="shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-2 w-full border-t border-slate-800/80 pt-2 items-center">
              <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-1 py-0.5 rounded text-[8px] uppercase font-bold tracking-widest text-center">
                {typeof window !== 'undefined' && window.location.hostname.includes('yuppi.usk.one') ? 'V1.19' : 'v1.20x'}
              </span>
              <button 
                onClick={async () => {
                  await fetch('/api/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                title="Çıkış Yap"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full flex justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-center text-center">
             <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">
               {typeof window !== 'undefined' && window.location.hostname.includes('yuppi.usk.one') ? 'V1.19 YUPPI ✨' : 'V1.20x TEST SUNUCUSU'}
             </span>
          </div>
        )}
      </div>
    </aside>
  );
}
