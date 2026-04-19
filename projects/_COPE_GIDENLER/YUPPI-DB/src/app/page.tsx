import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [orderCount, companyCount] = await Promise.all([
    prisma.order.count(),
    prisma.company.count()
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Kontrol Merkezi
          </h1>
          <p className="text-slate-500 mt-2 text-lg">YUPPI ERP Sistem Özeti</p>
        </div>
        <Link 
          href="/orders/new" 
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
        >
          <span className="mr-2 text-xl">+</span> Yeni Sözleşme
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Orders Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300 transition-all duration-300 group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Sözleşmeler</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{orderCount}</p>
            </div>
          </div>
        </div>

        {/* Companies Card */}
        <Link href="/companies" className="relative block overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md hover:border-emerald-300 transition-all duration-300 group hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-emerald-50/80 text-emerald-600 rounded-xl shadow-sm border border-emerald-100/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Firmalar</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{companyCount}</p>
            </div>
          </div>
        </Link>
        
        {/* Placeholder Card 1 */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/60 opacity-60">
           <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-indigo-50/80 text-indigo-600 rounded-xl shadow-sm border border-indigo-100/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Aylık Rapor</p>
              <p className="text-xl font-medium text-slate-400 mt-1">Geliştiriliyor</p>
            </div>
          </div>
        </div>

        {/* Placeholder Card 2 */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-slate-200/60 opacity-60">
           <div className="relative flex items-center space-x-4">
            <div className="p-3 bg-amber-50/80 text-amber-600 rounded-xl shadow-sm border border-amber-100/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Bekleyen</p>
              <p className="text-xl font-medium text-slate-400 mt-1">Geliştiriliyor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-800 tracking-tight">Son İşlemler</h2>
            <Link href="/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">Tümünü Gör &rarr;</Link>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center bg-slate-50/30">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="mt-4 text-slate-500 font-medium">Bu alanda yakında sözleşme özetleri listelenecek.</p>
            </div>
          </div>
        </div>

        {/* Notifications / Alerts Board */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100/50">
            <h2 className="font-bold text-lg text-slate-800 tracking-tight">Dikkat Gerekenler</h2>
          </div>
          <div className="p-6 overflow-y-auto w-full">
            <ul className="space-y-4">
              <li className="flex justify-between items-center p-4 bg-gradient-to-r from-rose-50 to-white rounded-xl border border-rose-100/60 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-rose-900 font-semibold text-sm">Geciken Lab Dip</span>
                </div>
                <span className="bg-white px-2.5 py-1 rounded text-xs font-bold text-rose-600 shadow-sm border border-rose-200">0</span>
              </li>
              <li className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100/60 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-amber-900 font-semibold text-sm">Üretim Onayı Bekleyen</span>
                </div>
                <span className="bg-white px-2.5 py-1 rounded text-xs font-bold text-amber-600 shadow-sm border border-amber-200">0</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
