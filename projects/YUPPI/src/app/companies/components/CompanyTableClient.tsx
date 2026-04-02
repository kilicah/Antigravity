"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanyTableClient({ companies }: { companies: any[] }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const router = useRouter();

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
        <div className="flex gap-3">
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
              <tr className="bg-slate-100 text-slate-600 text-xs border-b border-slate-200">
                <th className="py-2 px-3 font-medium w-10 text-center">Seç</th>
                <th className="py-2 px-3 font-medium w-28">Firma Kodu</th>
                <th className="py-2 px-3 font-medium">Firma Ünvanı</th>
                <th className="py-2 px-3 font-medium">Firma Şehir</th>
                <th className="py-2 px-3 font-medium">Firma Ülke</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Henüz kayıtlı firma bulunmuyor.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
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
                      <div className="font-medium text-slate-900 leading-tight">{company.name}</div>
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
