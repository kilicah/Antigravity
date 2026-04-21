import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import TrackingBoard from "@/components/orders/TrackingBoard";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: true,
      buyer: true,
      items: true,
      logs: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!order) notFound();

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Üretim & Sipariş Takip Paneli
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ref: {order.contractNo} | Alıcı: {order.buyer.name}</p>
        </div>
        <div className="space-x-3">
            <Link 
              href={`/orders/${order.id}`}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Siparişe Dön
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <TrackingBoard order={order} items={order.items} />
      </div>

      {order.logs && order.logs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8 print:hidden transition-all duration-300">
          <div className="bg-slate-800 text-slate-100 p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Sipariş İşlem Geçmişi
            </h2>
            <span className="text-xs font-mono bg-slate-700 px-3 py-1.5 rounded-full shadow-inner text-slate-300 border border-slate-600">
              {order.logs.length} Kayıt
            </span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">İşlem Zamanı</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Kullanıcı</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px]">Eylem Türü</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[11px] w-full">Değişen Detaylar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-[13px]">
                      {new Date(log.createdAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {log.username}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[11px] font-bold rounded uppercase tracking-wide ${
                        log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-pre-line leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
