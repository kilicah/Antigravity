"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanyTableClient({ companies }: { companies: any[] }) {
  const router = useRouter();
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "passive">("active");

  const filteredCompanies = companies.filter(c => activeTab === "active" ? c.isActive !== false : c.isActive === false);

  const handleDelete = async () => {
    if (selectedCompanyIds.length === 0) return alert("Sipariş seçin."); // Wait, alert("Firma seçin.");

    const pwd = prompt("Firmaları KALICI olarak silmek üzeresiniz! İşleme devam etmek için şifreyi girin:");
    if (pwd !== "1996") {
      alert("Hatalı şifre. Silme işlemi iptal edildi.");
      return;
    }

    try {
      for (const id of selectedCompanyIds) {
        const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.json();
          alert(`Hata (Firma #${id}): ` + body.error);
        }
      }
      setSelectedCompanyIds([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    }
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedCompanyIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleAction = (path: string) => {
    if (selectedCompanyIds.length === 1) {
      router.push(`/companies/${selectedCompanyIds[0]}${path}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* HEADER: Sticky */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md shadow-sm border-b border-slate-200 flex justify-between items-center pb-4 mb-6 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Firma Yönetimi
          </h1>
        </div>
        <Link 
          href="/companies/new" 
          className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
        >
          <span className="mr-2 text-lg leading-none">+</span> Yeni Firma Ekle
        </Link>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 shadow-sm transition-all shrink-0">
        <button
          onClick={() => handleAction("/edit")}
          disabled={selectedCompanyIds.length !== 1}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
            selectedCompanyIds.length === 1
              ? "bg-slate-800 text-white hover:bg-slate-700 border-slate-800 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Düzenle
        </button>
        {activeTab === "passive" && (
          <button
            onClick={handleDelete}
            disabled={selectedCompanyIds.length === 0}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
              selectedCompanyIds.length > 0
                ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-sm cursor-pointer" 
                : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
            }`}
          >
            Tamamen Sil
          </button>
        )}

        <div className="ml-auto flex shrink-0">
          <button
            onClick={() => { setActiveTab(activeTab === "active" ? "passive" : "active"); setSelectedCompanyIds([]); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all border shadow-sm ${
              activeTab === "active"
                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
            }`}
          >
            {activeTab === "active" ? "Pasif Firmalar ❌" : "Aktif Firmalar ✅"}
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-4 px-6 w-12 text-center">Seç</th>
                <th className="py-4 px-6 font-semibold w-32">Firma Kodu</th>
                <th className="py-4 px-6 font-semibold">Firma Ünvanı</th>
                <th className="py-4 px-6 font-semibold">Firma Şehir</th>
                <th className="py-4 px-6 font-semibold">Firma Ülke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 bg-slate-50/30">
                     <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p>Sistemde henüz kayıtlı firma bulunmuyor.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => {
                  const isSelected = selectedCompanyIds.includes(company.id);

                  return (
                    <tr 
                      key={company.id} 
                      onClick={() => handleCheckboxChange(company.id)}
                      className={`transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                           type="checkbox"
                           className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                           checked={isSelected}
                           onChange={() => handleCheckboxChange(company.id)}
                           onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-4 px-6">
                        {company.code ? (
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
                            {company.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${company.isActive !== false ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]'}`}></div>
                           <div className={`font-bold ${company.isActive !== false ? 'text-slate-900' : 'text-slate-500 line-through decoration-slate-300'}`}>{company.name}</div>
                           {company.isActive === false && <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Pasif</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {company.isSeller && <span className="px-1 py-0 rounded text-[9px] font-bold bg-purple-100 text-purple-800 uppercase leading-relaxed">Satıcı</span>}
                          {company.isBuyer && <span className="px-1 py-0 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase leading-relaxed">Alıcı</span>}
                          {company.isShipTo && <span className="px-1 py-0 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 uppercase leading-relaxed">Sevk</span>}
                          {company.isBrand && <span className="px-1 py-0 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase leading-relaxed">Marka</span>}
                          {company.isCustoms && <span className="px-1 py-0 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase leading-relaxed">Gümrük</span>}
                          {company.isLogistics && <span className="px-1 py-0 rounded text-[9px] font-bold bg-cyan-100 text-cyan-800 uppercase leading-relaxed">Lojistik</span>}
                          {company.isInsurance && <span className="px-1 py-0 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase leading-relaxed">Sigorta</span>}
                          {company.isAgency && <span className="px-1 py-0 rounded text-[9px] font-bold bg-fuchsia-100 text-fuchsia-800 uppercase leading-relaxed">Acenta</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {company.city || "-"}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {company.country || "-"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
