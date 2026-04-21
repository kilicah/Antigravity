"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackingBoard({ order, items: initialItems }: { order: any, items: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [savingId, setSavingId] = useState<number | null>(null);

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleUpdate = async (itemId: number, field: string, value: any) => {
    // Optimistic Update
    setItems(items.map((it: any) => it.id === itemId ? { ...it, [field]: value } : it));
    
    // Save Background
    setSavingId(itemId);
    try {
      await fetch(`/api/order-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Alan güncellenirken bir hata oluştu!");
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { label: "ETD", field: "etd", type: "date", bg: "bg-blue-50", desc: "Estimated Time of Delivery" },
    { label: "FDS", field: "fds", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-emerald-50", desc: "Fabric Direction Sample" },
    { label: "C/S", field: "cs", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-emerald-50", desc: "Color Standard" },
    { label: "C/S-SD", field: "csSentDate", type: "date", bg: "bg-emerald-50", desc: "Color Standard - Sent Date" },
    { label: "C/S-AD", field: "csApprovalDate", type: "date", bg: "bg-emerald-50", desc: "Color Standard - Approval Date" },
    { label: "L/D-SD", field: "ldSentDate", type: "date", bg: "bg-purple-50", desc: "Lab Dip - Sent Date" },
    { label: "L/D-AD", field: "ldApprovalDate", type: "date", bg: "bg-purple-50", desc: "Lab Dip - Approval Date" },
    { label: "B/S-SD", field: "bsSentDate", type: "date", bg: "bg-orange-50", desc: "Buyer's Sample - Sent Date" },
    { label: "B/S-AD", field: "bsApprovalDate", type: "date", bg: "bg-orange-50", desc: "Buyer's Sample - Approval Date" },
    { label: "M.PA", field: "mpa", type: "checkbox", bg: "bg-amber-50", desc: "Main Production Approval" },
    { label: "D.PA", field: "dpa", type: "checkbox", bg: "bg-amber-50", desc: "Delivery Production Approval" },
    { label: "R/S", field: "rs", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-rose-50", desc: "Red Seal" },
    { label: "R/S-MS", field: "rsMs", type: "date", bg: "bg-rose-50", desc: "Red Seal - MS" },
    { label: "B.S-MS", field: "bsMs", type: "date", bg: "bg-rose-50", desc: "Buyer's Sample - MS" },
    { label: "B.LT-RD", field: "bltRd", type: "date", bg: "bg-teal-50", desc: "Bulk Lab Test - Requested Date" },
    { label: "B.LT-MS", field: "bltMs", type: "date", bg: "bg-teal-50", desc: "Bulk Lab Test - MS" },
    { label: "B.LT-MA", field: "bltMa", type: "date", bg: "bg-teal-50", desc: "Bulk Lab Test - MA" },
    { label: "LT-AD", field: "ltAd", type: "date", bg: "bg-teal-50", desc: "Lab Test - Approval Date" },
    { label: "B.SAD", field: "bsad", type: "date", bg: "bg-teal-50", desc: "Bulk Sample Approval Date" },
    { label: "PL", field: "pl", type: "checkbox", bg: "bg-slate-100", desc: "Packing List" }
  ];

  return (
    <div className="w-full relative">
       {/* Loader Overlay if saving */}
       {savingId && (
         <div className="absolute top-2 right-4 z-50 flex items-center gap-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
           <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           Kaydediliyor...
         </div>
       )}
       
       <div className="w-full max-h-[75vh] min-h-[500px] overflow-auto border-t border-slate-300">
         <table className="w-full text-left border-collapse whitespace-nowrap text-[11px] font-mono">
            <thead className="sticky top-0 z-20 bg-slate-800 text-white shadow-md">
              <tr>
                <th className="sticky left-0 bg-slate-900 border-r border-slate-700 py-3 px-3 uppercase text-[10px] w-[250px] min-w-[250px] z-30 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                  KALİTE / MODEL BİLGİSİ
                </th>
                <th className="py-3 px-3 border-r border-slate-700 uppercase min-w-[60px] text-center">MİKTAR</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="border-r border-slate-700 py-3 px-2 text-center uppercase tracking-wider min-w-[100px]" title={col.desc}>
                     <span className="cursor-help border-b border-dotted border-slate-400/60 hover:border-slate-300 pb-0.5 transition-colors">{col.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  {/* Fixed Left Column */}
                  <td className="sticky left-0 bg-white border-r border-slate-300 py-2 px-3 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                     <div className="font-bold text-[12px] truncate w-[240px] text-indigo-900 leading-tight">
                        {i+1}. {item.qualityName || "KALİTE GİRİLMEMİŞ"}
                     </div>
                     <div className="text-[10px] text-slate-500 truncate w-[240px] mt-0.5">
                        {item.buyerModelName ? `M: ${item.buyerModelName} |` : ''} {item.colorCode} 
                     </div>
                  </td>
                  
                  {/* Quantity Display */}
                  <td className="border-r border-slate-200 py-1.5 px-3 text-center bg-slate-50 font-bold text-slate-700">
                     {item.quantity.toLocaleString('tr-TR')} <span className="text-[9px] text-slate-400 font-normal">{order.unit}</span>
                  </td>

                  {/* Dynamic Editable Cells */}
                  {columns.map((col, idx) => {
                     const isDate = col.type === "date";
                     const isCheckbox = col.type === "checkbox";
                     const isSelect = col.type === "select";

                     let disabled = false;
                     if ((col.field === "csSentDate" || col.field === "csApprovalDate") && item.cs === "NO") disabled = true;
                     if ((col.field === "ldSentDate" || col.field === "ldApprovalDate") && item.ldRequest === "NO") disabled = true;
                     if ((col.field === "bsSentDate" || col.field === "bsApprovalDate" || col.field === "bsMs") && (!item.bq || Number(item.bq) === 0)) disabled = true;
                     if (col.field === "rsMs" && item.rs === "NO") disabled = true;

                     return (
                       <td key={idx} className={`border-r border-slate-200 p-1.5 text-center align-middle ${col.bg}`}>
                          {isDate && (
                            <input 
                              type="date"
                              disabled={disabled}
                              value={formatDateForInput(item[col.field])}
                              onChange={(e) => handleUpdate(item.id, col.field, e.target.value)}
                              className={`w-full border rounded px-1 min-w-[105px] text-center h-[26px] transition-colors focus:ring-1 focus:ring-indigo-500 ${
                                disabled 
                                  ? 'bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed' 
                                  : 'bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 cursor-pointer'
                              }`}
                            />
                          )}

                          {isSelect && (
                            <select
                              value={item[col.field] || "WAIT"}
                              disabled={disabled}
                              onChange={(e) => handleUpdate(item.id, col.field, e.target.value)}
                              className={`w-full border rounded px-1 text-center h-[26px] font-bold focus:ring-1 focus:ring-indigo-500 transition-colors ${
                                disabled
                                  ? 'bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : `bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 cursor-pointer ${item[col.field] === 'YES' || item[col.field] === 'OK' ? 'text-emerald-700' : item[col.field] === 'NO' ? 'text-rose-700' : 'text-slate-500'}`
                              }`}
                            >
                               {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          )}

                          {isCheckbox && (
                            <div className="flex justify-center items-center w-full h-[26px]">
                              <input 
                                type="checkbox"
                                checked={!!item[col.field]}
                                disabled={disabled}
                                onChange={(e) => handleUpdate(item.id, col.field, e.target.checked)}
                                className={`w-5 h-5 rounded focus:ring-indigo-500 ${
                                  disabled
                                    ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                                    : 'text-indigo-600 border-slate-300 cursor-pointer'
                                }`}
                              />
                            </div>
                          )}
                       </td>
                     );
                  })}
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
}
