import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RepresentativesPage() {
  const representatives = await prisma.representative.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Temsilciler</h1>
        <Link 
          href="/representatives/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Temsilci Ekle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Temsilci Adı Soyadı</th>
              <th className="py-3 px-4 font-medium">E-Posta</th>
              <th className="py-3 px-4 font-medium">Telefon</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {representatives.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Henüz kayıtlı temsilci bulunmuyor.
                </td>
              </tr>
            ) : (
              representatives.map((rep) => (
                <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    {rep.name.includes('|') ? (
                      <div>
                        <div>{rep.name.split('|')[0]}</div>
                        <div className="text-xs text-slate-500">{rep.name.split('|')[1]}</div>
                      </div>
                    ) : rep.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{rep.email || "-"}</td>
                  <td className="py-3 px-4 text-slate-500">{rep.phone || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/representatives/${rep.id}/edit`}
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
