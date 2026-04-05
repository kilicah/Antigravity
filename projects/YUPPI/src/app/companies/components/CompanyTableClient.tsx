"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanyTableClient({ companies }: { companies: any[] }) {
  const activeCompaniesList = companies.filter(c => c.isActive !== false);
  const passiveCompaniesList = companies.filter(c => c.isActive === false);
  const handleDelete = async () => {
    if(!selectedCompanyId) return alert("Lütfen silmek için firma seçin.");
    if(!confirm("Emin misiniz?")) return;
    try { const res = await fetch(`/api/companies/${selectedCompanyId}`, { method: "DELETE" }); if(!res.ok) { const j = await res.json(); alert(j.error); } else { window.location.reload(); } } catch(e) { alert("Hata oluştu."); }
  };
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "passive">("active");
  const router = useRouter();

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const isDeleteEnabled = selectedCompany && selectedCompany.isActive === false;

  const handleEditClick = () => {
    if (selectedCompanyId) {
      router.push(`/companies/${selectedCompanyId}/edit`);
    } else {
      alert("Lütfen düzenlemek için bir firma seçin!");
    }
  };

  const handleRowClick = (id: number) => {
    setSelectedCompanyId(id);
  };

  return (
    <div>
      <div className="sticky top-0 -mt-8 pt-8 pb-4 -mx-8 px-8 z-20 bg-slate-50/95 backdrop-blur-md shadow-sm border-b border-slate-200 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={!isDeleteEnabled}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isDeleteEnabled 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            Tamamen Sil
          </button>
          <button
            onClick={handleEditClick}
            disabled={!selectedCompanyId}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedCompanyId 
                ? "bg-slate-800 hover:bg-slate-900 text-white shadow-sm" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Düzenle
          </button>
          <button
            onClick={() => { setActiveTab(activeTab === "active" ? "passive" : "active"); setSelectedCompanyId(null); }}
            className={`px-4 py-2 rounded-md font-medium transition-colors border ${
              activeTab === "active"
                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm"
                : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 shadow-sm"
            }`}
          >
            {activeTab === "active" ? "Pasif Firmalar ❌" : "Aktif Firmalar ✅"}
          </button>
          <Link 
            href="/companies/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            Yeni Firma Ekle
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm border-b border-slate-300 shadow-sm">
                <th className="py-3 px-4 font-semibold w-10 text-center">Seç</th>
                <th className="py-3 px-4 font-semibold w-32">Firma Kodu</th>
                <th className="py-3 px-4 font-semibold">Firma Ünvanı</th>
                <th className="py-3 px-4 font-semibold">Firma Şehir</th>
                <th className="py-3 px-4 font-semibold">Firma Ülke</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(activeTab === "active" ? activeCompaniesList : passiveCompaniesList).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Henüz kayıtlı firma bulunmuyor.
                  </td>
                </tr>
              ) : (
                (activeTab === "active" ? activeCompaniesList : passiveCompaniesList).map((company) => (
                  <tr 
                    key={company.id} 
                    onClick={() => handleRowClick(company.id)}
                    className={`border-b border-slate-100 transition-colors cursor-pointer ${selectedCompanyId === company.id ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                  >
                    <td className="py-1.5 px-3 text-center">
                      <input 
                        type="radio" 
                        name="selectedCompany" 
                        checked={selectedCompanyId === company.id}
                        onChange={() => setSelectedCompanyId(company.id)}
                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      {company.code ? (
                        <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs border border-slate-200">
                          {company.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${company.isActive !== false ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]'}`}></div>
           <div className={`font-bold ${company.isActive !== false ? 'text-slate-900' : 'text-slate-500 line-through decoration-slate-300'}`}>{company.name}</div>
           {company.isActive === false && <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Pasif</span>}
        </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
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
                    <td className="py-1.5 px-3 text-slate-600">
                      {company.city || "-"}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">
                      {company.country || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
