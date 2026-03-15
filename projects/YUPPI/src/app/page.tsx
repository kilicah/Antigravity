import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  // Toplam sayıları çek
  const [orderCount, companyCount] = await Promise.all([
    prisma.order.count(),
    prisma.company.count()
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
            Kontrol Üssü
          </h1>
          <p className="text-slate-500 mt-1">YUPPI ERP sistemine hoş geldiniz.</p>
        </div>
        <Link 
          href="/orders/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Yeni Sipariş Gir
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Aktif Siparişler</p>
            <p className="text-3xl font-bold text-slate-900">{orderCount}</p>
          </div>
        </div>

        {/* Firmalar */}
        <Link href="/companies" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Firmalar</h2>
              <p className="text-slate-500 text-sm mt-1">{companyCount} Kayıtlı Firma</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Son Eklenen Siparişler</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-500 text-center py-4">Henüz sipariş kaydı bulunmuyor.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Onay Bekleyen İşlemler</h2>
          </div>
          <div className="p-6">
             <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-yellow-800 font-medium text-sm">Lab Dip Onayları</span>
                </div>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-yellow-600 shadow-sm border border-yellow-200">0</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-orange-800 font-medium text-sm">Üretim Öncesi (ÜÖ-O)</span>
                </div>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-orange-600 shadow-sm border border-orange-200">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
