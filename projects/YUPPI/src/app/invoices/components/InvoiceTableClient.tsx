"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InvoiceTableClient({ invoices }: { invoices: any[] }) {
  const router = useRouter();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectInvoice = (invoiceId: number) => {
    if (selectedInvoiceIds.includes(invoiceId)) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds([invoiceId]); // Force single selection
    }
  };

  const handleEdit = () => {
    if (selectedInvoiceIds.length !== 1) {
      alert("Lütfen düzenlemek için sadece bir fatura seçiniz.");
      return;
    }
    router.push(`/invoices/${selectedInvoiceIds[0]}/edit`);
  };

  const handleDeleteClick = () => {
    if (selectedInvoiceIds.length !== 1) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedInvoiceIds.length !== 1) return;
    
    setIsDeleting(true);
    try {
      await fetch(`/api/invoices/${selectedInvoiceIds[0]}`, { method: 'DELETE' });
      setSelectedInvoiceIds([]);
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceIds[0]);

  return (
    <>
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      
      {/* 🟢 TOP ACTION BAR (Only visible if something is selected) */}
      <div className={`
        flex items-center gap-3 px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 transition-all duration-300
        ${selectedInvoiceIds.length > 0 ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden py-0 border-0'}
      `}>
        <div className="text-emerald-800 font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full shrink-0">
          Seçildi
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 w-full pl-2">
          {selectedInvoiceIds.length === 1 && (
             <>
               <button 
                 onClick={handleEdit}
                 className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
               >
                 Düzenle
               </button>
               
               <Link 
                 href={`/invoices/${selectedInvoiceIds[0]}`}
                 className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
               >
                 Fatura / Çeki Belgesi Görüntüle
               </Link>
               
               {selectedInvoice?.packingList ? (
                 <>
                   <Link 
                     href={`/invoices/${selectedInvoiceIds[0]}/packing-list`}
                     className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
                   >
                     PL Yazdır
                   </Link>
                   <Link 
                     href={`/invoices/${selectedInvoiceIds[0]}/bol`}
                     className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
                   >
                     KT Yazdır
                   </Link>
                 </>
               ) : (
                 <Link 
                   href={`/invoices/${selectedInvoiceIds[0]}`}
                   className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap border border-indigo-200"
                 >
                   PL Yükle
                 </Link>
               )}

               <button 
                  onClick={handleDeleteClick}
                  className="flex items-center px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ml-auto"
               >
                  Sil
               </button>
             </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200/60">
              <th className="py-4 px-6 w-12 text-center">Seç</th>
              <th className="py-4 px-3 font-semibold">Fatura No</th>
              <th className="py-4 px-3 font-semibold">Tarih</th>
              <th className="py-4 px-3 font-semibold">Müşteri</th>
              <th className="py-4 px-3 font-semibold text-right">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-500 bg-slate-50/30">
                   <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p>Henüz sistemde kayıtlı bir fatura bulunmuyor.</p>
                      <p className="mt-2 text-sm text-slate-400">Fatura oluşturmak için 'Siparişler' tablosundan ilgili siparişi seçip Fatura oluşturun.</p>
                   </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const totalAmount = invoice.items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
                const isSelected = selectedInvoiceIds.includes(invoice.id);
                
                return (
                  <tr 
                    key={invoice.id} 
                    className={`transition-colors group hover:bg-slate-50/80 cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}
                    onClick={() => handleSelectInvoice(invoice.id)}
                  >
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                       <input 
                         type="radio" 
                         name="selectedInvoice"
                         checked={isSelected}
                         onChange={() => handleSelectInvoice(invoice.id)}
                         className="w-4 h-4 rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                       />
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-slate-300 transition-colors">
                        {invoice.invoiceNo || `#INV-${invoice.id}`}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium text-sm">
                      {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center">
                         <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mr-3 border border-emerald-100">
                           {invoice.buyer?.name.substring(0,2) || 'NA'}
                         </div>
                         <span className="text-slate-700 font-medium">{invoice.buyer?.name || 'Bilinmiyor'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-mono font-bold text-slate-800 text-right">
                        {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

    {/* CUSTOM DELETE MODAL */}
    {isDeleteModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Faturayı Sil</h3>
          <p className="text-slate-500 mb-6 font-medium">Bu işlem geri alınamaz. <strong>{selectedInvoice?.invoiceNo || `#INV-${selectedInvoice?.id}`}</strong> numaralı fatura ve ilgili tüm alt kalemler sistemden tamamen silinecektir.</p>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              İptal
            </button>
            <button 
              onClick={confirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
