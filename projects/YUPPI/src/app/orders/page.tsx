import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

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
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Sipariş Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Tüm sözleşme ve sipariş işlemlerini takip edin.</p>
        </div>
        <Link 
          href="/orders/new" 
          className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
        >
          <span className="mr-2 text-lg leading-none">+</span> Yeni Sözleşme
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-4 px-6 font-semibold">Sözleşme No</th>
                <th className="py-4 px-6 font-semibold">Satıcı</th>
                <th className="py-4 px-6 font-semibold">Alıcı</th>
                <th className="py-4 px-6 font-semibold">Tarih</th>
                <th className="py-4 px-6 font-semibold">Tutar</th>
                <th className="py-4 px-6 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500 bg-slate-50/30">
                     <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p>Sistemde henüz kayıtlı sipariş bulunmuyor.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalAmount = order.items.reduce((sum, item) => sum + item.totalAmount, 0);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
                          #{order.contractNo}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3 border border-indigo-100">
                             {order.seller.name.substring(0,2)}
                           </div>
                           <span className="text-slate-700 font-medium">{order.seller.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mr-3 border border-emerald-100">
                             {order.buyer.name.substring(0,2)}
                           </div>
                           <span className="text-slate-700 font-medium">{order.buyer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                        {new Date(order.contractDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-800">
                          {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1.5 text-slate-400 font-sans">{order.currency}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link 
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-md text-xs font-semibold transition-colors border border-blue-200/50"
                        >
                          Sözleşme
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/production`}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-md text-xs font-semibold transition-colors border border-emerald-200/50"
                        >
                          Üretim Fişi
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/invoice`}
                          className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-md text-xs font-semibold transition-colors border border-rose-200/50"
                        >
                          Fatura
                        </Link>
                        <Link 
                          href={`/orders/${order.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-md text-xs font-semibold transition-colors border border-slate-300/50"
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
