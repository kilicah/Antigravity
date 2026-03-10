import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      representatives: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Markalar</h1>
        <Link 
          href="/brands/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Marka Ekle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Marka Adı</th>
              <th className="py-3 px-4 font-medium">Bölge (İl / Ülke)</th>
              <th className="py-3 px-4 font-medium">Yetkililer</th>
              <th className="py-3 px-4 font-medium">Telefon</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Henüz kayıtlı marka bulunmuyor.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium">{brand.name}</td>
                  <td className="py-3 px-4 text-slate-600 text-sm">
                    {[brand.city, brand.country].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm break-words max-w-xs">
                    {brand.representatives && brand.representatives.length > 0 
                      ? brand.representatives.map(r => r.name).join(", ")
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm">
                    {brand.phone || "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/brands/${brand.id}/edit`}
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
