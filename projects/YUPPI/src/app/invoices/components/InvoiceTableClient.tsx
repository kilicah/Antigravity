"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordConfirmModal from "@/components/PasswordConfirmModal";

export default function InvoiceTableClient({ invoices }: { invoices: any[] }) {
  const router = useRouter();
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "passive">("active");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredInvoices = invoices.filter(i => activeTab === "active" ? i.isActive !== false : i.isActive === false);

  const handleSelectInvoice = (invoiceId: number) => {
    if (selectedInvoiceIds.includes(invoiceId)) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds([invoiceId]); // Force single selection
    }
  };

  const handleEdit = () => {
    if (selectedInvoiceIds.length !== 1) return;
    router.push(`/invoices/${selectedInvoiceIds[0]}/edit`);
  };

  const prepareDelete = () => {
    if (selectedInvoiceIds.length !== 1) return;
    
    if (activeTab === "active") {
      if (!confirm("Seçili faturayı pasife (arşive) almak istiyor musunuz?")) return;
      executeDelete();
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const executeDelete = async (password?: string) => {
    setIsDeleting(true);
    try {
      const fetchOptions: any = { method: "DELETE" };
      if (activeTab === "passive") {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = JSON.stringify({ password });
      }

      const res = await fetch(`/api/invoices/${selectedInvoiceIds[0]}${activeTab === "passive" ? "?hard=true" : ""}`, fetchOptions);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Silme başarısız");
      }
      
      setSelectedInvoiceIds([]);
      setIsPasswordModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      if (activeTab === "passive") throw err; // rethrow for modal
      console.error(err);
      alert(err.message || "Bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceIds[0]);

  return (
    <>
    <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 shadow-sm transition-all shrink-0">
      <div className="ml-auto flex shrink-0 w-full justify-between sm:justify-end">
        <button
          onClick={() => { setActiveTab(activeTab === "active" ? "passive" : "active"); setSelectedInvoiceIds([]); }}
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all border shadow-sm ${
            activeTab === "active"
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
          }`}
        >
          {activeTab === "active" ? "Arşivlenmiş Faturalar 🗃️" : "Aktif Faturalar ✅"}
        </button>
      </div>
    </div>

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
                  onClick={prepareDelete}
                  className="flex items-center px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ml-auto"
               >
                  {activeTab === "active" ? "Arşive Kaldır" : "Tamamen Sil"}
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
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-500 bg-slate-50/30">
                   <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      <p>Kayıt bulunamadı.</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
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

    <PasswordConfirmModal
      isOpen={isPasswordModalOpen}
      onClose={() => setIsPasswordModalOpen(false)}
      onConfirm={executeDelete}
      title="Faturayı Kalıcı Olarak Sil"
      description={`Bu işlem geri alınamaz. Seçili fatura ve tüm çeki verileri sistemden SİLİNECEKTİR.`}
    />
    </>
  );
}
