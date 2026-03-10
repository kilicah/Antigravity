import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      seller: true,
      brand: true,
      items: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
          Sipariş Yönetimi
        </h1>
        <Link 
          href="/orders/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors"
        >
          + Yeni Sipariş (Sözleşme)
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                <th className="py-3 px-4 font-medium">Sözleşme No</th>
                <th className="py-3 px-4 font-medium">Satıcı</th>
                <th className="py-3 px-4 font-medium">Alıcı</th>
                <th className="py-3 px-4 font-medium">Tarih</th>
                <th className="py-3 px-4 font-medium">Tutar</th>
                <th className="py-3 px-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Sistemde henüz kayıtlı sipariş bulunmuyor.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalAmount = order.items.reduce((sum, item) => sum + item.totalAmount, 0);
                  return (
                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          {order.contractNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{order.seller.name}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{order.buyer.name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(order.contractDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800">
                          {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1 text-slate-500">{order.currency}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-3">
                        <Link 
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Sözleşme
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/production`}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                        >
                          Üretim Fişi
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/invoice`}
                          className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                        >
                          Fatura
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/edit`}
                          className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                        >
                          Düzenle
                        </Link>
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
