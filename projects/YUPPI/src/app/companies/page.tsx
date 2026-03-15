import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
        <Link 
          href="/companies/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Firma Ekle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Firma Adı & Rolü</th>
              <th className="py-3 px-4 font-medium">VD / VNo</th>
              <th className="py-3 px-4 font-medium">Tic. Sicil No</th>
              <th className="py-3 px-4 font-medium">Telefon</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Henüz kayıtlı firma bulunmuyor.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{company.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {company.isSeller && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-100 text-purple-800 uppercase">
                          Satıcı
                        </span>
                      )}
                      {company.isBuyer && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-800 uppercase">
                          Alıcı
                        </span>
                      )}
                      {company.isShipTo && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-100 text-indigo-800 uppercase">
                          Sevk
                        </span>
                      )}
                      {company.isBrand && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-800 uppercase">
                          Marka
                        </span>
                      )}
                      {company.isCustoms && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-100 text-amber-800 uppercase">
                          Gümrük
                        </span>
                      )}
                      {company.isLogistics && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-100 text-cyan-800 uppercase">
                          Lojistik
                        </span>
                      )}
                      {company.isInsurance && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-100 text-rose-800 uppercase">
                          Sigorta
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 align-top">
                    {company.taxOffice || "-"} / {company.taxNo || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{company.registrationNo || "-"}</td>
                  <td className="py-3 px-4 text-slate-600">{company.phone || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/companies/${company.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
