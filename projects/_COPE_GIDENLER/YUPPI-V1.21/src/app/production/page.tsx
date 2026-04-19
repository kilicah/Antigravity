import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductionPage() {
  const productionOrders = await prisma.productionOrder.findMany({
    include: {
      order: {
        include: {
          buyer: true,
          brand: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Üretim Siparişleri Takibi</h1>
        <Link 
          href="/production/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Üretim Emri Oluştur
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Sözleşme No</th>
              <th className="py-3 px-4 font-medium">Satın Alan (Buyer)</th>
              <th className="py-3 px-4 font-medium">Marka</th>
              <th className="py-3 px-4 font-medium">Ex-Mill Tarihi</th>
              <th className="py-3 px-4 font-medium">Durum</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {productionOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Sistemde kayıtlı üretim siparişi bulunmuyor.
                </td>
              </tr>
            ) : (
              productionOrders.map((po) => (
                <tr key={po.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium whitespace-nowrap">{po.order.contractNo}</td>
                  <td className="py-3 px-4 text-slate-700">{po.order.buyer.name}</td>
                  <td className="py-3 px-4 text-slate-600">{po.order.brand?.name || "-"}</td>
                  <td className="py-3 px-4">
                    {po.exMillDate ? new Date(po.exMillDate).toLocaleDateString('tr-TR') : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Üretimde
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/production/${po.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Detay
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
