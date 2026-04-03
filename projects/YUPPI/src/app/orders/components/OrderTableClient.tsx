"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderTableClient({ orders }: { orders: any[] }) {
  const router = useRouter();
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handleAction = (path: string) => {
    if (selectedOrderIds.length === 1) {
      router.push(`/orders/${selectedOrderIds[0]}${path}`);
    }
  };

  const handleInvoiceAction = () => {
    if (selectedOrderIds.length > 0) {
      router.push(`/invoices/new?orderIds=${selectedOrderIds.join(',')}`);
    }
  };

  return (
    <div className="w-full">
      {/* ACTION BAR */}
      <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 shadow-sm transition-all">
        <span className="text-sm font-semibold text-slate-500 mr-2 uppercase tracking-wide">İşlemler:</span>
        <button
          onClick={() => handleAction("")}
          disabled={selectedOrderIds.length !== 1}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
            selectedOrderIds.length === 1
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Sözleşme
        </button>
        <button
          onClick={() => handleAction("/production")}
          disabled={selectedOrderIds.length !== 1}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
            selectedOrderIds.length === 1
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Üretim Fişi
        </button>
        <button
          onClick={handleInvoiceAction}
          disabled={selectedOrderIds.length === 0}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
            selectedOrderIds.length > 0
              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Fatura
        </button>
        <button
          onClick={() => handleAction("/tracking")}
          disabled={selectedOrderIds.length !== 1}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ${
            selectedOrderIds.length === 1
              ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Sipariş Takibi
        </button>
        <button
          onClick={() => handleAction("/edit")}
          disabled={selectedOrderIds.length !== 1}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-colors border ml-auto ${
            selectedOrderIds.length === 1
              ? "bg-slate-800 text-white hover:bg-slate-700 border-slate-800 shadow-sm cursor-pointer" 
              : "bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
          }`}
        >
          Düzenle
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-4 px-6 w-12 text-center">Seç</th>
                <th className="py-4 px-6 font-semibold">Sözleşme No</th>
                <th className="py-4 px-6 font-semibold">Tarih</th>
                <th className="py-4 px-6 font-semibold">Alıcı</th>
                <th className="py-4 px-6 font-semibold text-right">Tutar</th>
                <th className="py-4 px-6 font-semibold text-right">Metraj</th>
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
                  const totalAmount = order.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
                  const totalQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                  const isSelected = selectedOrderIds.includes(order.id);

                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleCheckboxChange(order.id)}
                      className={`transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                           type="checkbox"
                           className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                           checked={isSelected}
                           onChange={() => handleCheckboxChange(order.id)}
                           onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
                          #{order.contractNo}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                        {new Date(order.contractDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                           <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mr-3 border border-emerald-100">
                             {order.buyer.name.substring(0,2)}
                           </div>
                           <span className="text-slate-700 font-medium">{order.buyer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="font-mono font-bold text-slate-800">
                          {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1.5 text-slate-400 font-sans">{order.currency}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <div className="font-mono font-bold text-slate-800">
                          {totalQuantity.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-xs ml-1.5 text-slate-400 font-sans">{order.unit}</span>
                        </div>
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
