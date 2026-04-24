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

  const handleFileUpload = async (itemId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setSavingId(itemId);
    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        const d = await res.json();
        if (d.success) {
            await handleUpdate(itemId, "plFileUrl", d.url);
            await handleUpdate(itemId, "plFileName", d.originalName);
        } else {
            alert(d.error || "Yükleme başarısız.");
        }
    } catch(err) {
        alert("Dosya yüklenemedi.");
    } finally {
        setSavingId(null);
    }
  };

  const getStatusBadge = (item: any) => {
    if (item.cs === "YES" && (!item.csApprovalDate || !item.csSentDate)) return { text: "C/S Bekliyor", color: "bg-rose-100 text-rose-700 border-rose-200" };
    if (item.ldRequest === "YES" && (!item.ldApprovalDate || !item.ldSentDate)) return { text: "L/D Bekliyor", color: "bg-rose-100 text-rose-700 border-rose-200" };
    if (item.fds === "YES" && !item.etd) return { text: "FDS Bekliyor", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (Number(item.bq) > 0 && (!item.bsSentDate || !item.bsApprovalDate)) return { text: "B/S Bekliyor", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (item.rs === "YES" && !item.rsMs) return { text: "R/S Bekliyor", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (item.ltRequest === "YES" && (!item.ltAd || !item.bltRd)) return { text: "Test Bekliyor", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (item.dpa) return { text: "Sevkiyata Hazır", color: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm border-transparent font-bold" };
    if (item.mpa) return { text: "Kalite Kontrol", color: "bg-blue-100 text-blue-700 border-blue-200 shadow-sm font-bold" };
    if (item.etd) return { text: "Üretimde", color: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    return { text: "Üretime Hazır", color: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" };
  };

  const columns = [
    { label: "DURUM", field: "_status", type: "status", bg: "bg-slate-50", desc: "STATUS" },
    { label: "ETD", field: "etd", type: "date", bg: "bg-blue-50", desc: "ESTIMATED DATE OF DEPARTURE" },
    { label: "FDS", field: "fds", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-emerald-50", desc: "FDS FORM SENT?" },
    { label: "C/S", field: "cs", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-emerald-50", desc: "COUNTER SAMPLE APPLY?" },
    { label: "C/S-SD", field: "csSentDate", type: "date", bg: "bg-emerald-50", desc: "COUNTER SAMPLE SENT DATE" },
    { label: "C/S-AD", field: "csApprovalDate", type: "date", bg: "bg-emerald-50", desc: "COUNTER SAMPLE APPROVAL DATE" },
    { label: "L/D-SD", field: "ldSentDate", type: "date", bg: "bg-purple-50", desc: "LAB DIP SENT DATE" },
    { label: "L/D-AD", field: "ldApprovalDate", type: "date", bg: "bg-purple-50", desc: "LAB DIP SAMPLE APPROVAL DATE" },
    { label: "B/S-SD", field: "bsSentDate", type: "date", bg: "bg-orange-50", desc: "BULK SENT DATE" },
    { label: "B/S-AD", field: "bsApprovalDate", type: "date", bg: "bg-orange-50", desc: "BULK APPROVAL DATE" },
    { label: "M.PA", field: "mpa", type: "checkbox", bg: "bg-amber-50", desc: "MAIN PRODUCTION APPROVAL" },
    { label: "D.PA", field: "dpa", type: "checkbox", bg: "bg-amber-50", desc: "DELIVERY PRODUCTION APPROVAL" },
    { label: "R/S", field: "rs", type: "select", options: ["WAIT", "YES", "NO"], bg: "bg-rose-50", desc: "RED SEAL APPLY?" },
    { label: "R/S-MS", field: "rsMs", type: "date", bg: "bg-rose-50", desc: "RED SEAL MANUFACTURER SENT" },
    { label: "B.S-MS", field: "bsMs", type: "date", bg: "bg-rose-50", desc: "BUYER SAMPLE MANUFACTURER SENT" },
    { label: "B.LT-RD", field: "bltRd", type: "date", bg: "bg-teal-50", desc: "BULK LAB TEST REQUESTED DATE" },
    { label: "B.LT-MS", field: "bltMs", type: "date", bg: "bg-teal-50", desc: "BULK LAB TEST M.S" },
    { label: "B.LT-MA", field: "bltMa", type: "date", bg: "bg-teal-50", desc: "BULK LAB TEST M.A" },
    { label: "LT-AD", field: "ltAd", type: "date", bg: "bg-teal-50", desc: "LAB TEST APPROVAL DATE" },
    { label: "B.SAD", field: "bsad", type: "date", bg: "bg-teal-50", desc: "BULK SAMPLE APPROVAL DATE" },
    { label: "PL", field: "pl", type: "file", bg: "bg-sky-50", desc: "PACKING LIST EXCEL" }
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
            <thead className="sticky top-0 z-40 bg-slate-800 text-white shadow-md">
              <tr>
                <th className="sticky left-0 bg-slate-900 border-r border-slate-700 py-3 px-3 uppercase text-[10px] w-[250px] min-w-[250px] z-[50] shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                  KALİTE / MODEL BİLGİSİ
                </th>
                <th className="py-3 px-3 border-r border-slate-700 uppercase min-w-[60px] text-center">MİKTAR</th>
                {columns.map((col, idx) => (
                  <th key={idx} className="border-r border-slate-700 py-1.5 px-2 text-center uppercase tracking-wider min-w-[100px] align-middle">
                     <div className="flex flex-col items-center justify-center gap-1 cursor-help group" title={col.desc}>
                       <span className="text-[8px] font-bold text-sky-400 opacity-80 group-hover:opacity-100 max-w-[120px] whitespace-normal leading-tight">{col.desc}</span>
                       <span className="border-b border-dotted border-slate-400/60 group-hover:border-slate-300 pb-0.5 transition-colors">{col.label}</span>
                     </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  {/* Fixed Left Column */}
                  <td className="sticky left-0 bg-white border-r border-slate-300 py-2 px-3 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] hover:bg-slate-50">
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
                     const isStatus = col.type === "status";
                     const isFile = col.type === "file";

                     let disabled = false;
                     if ((col.field === "csSentDate" || col.field === "csApprovalDate") && item.cs === "NO") disabled = true;
                     if ((col.field === "ldSentDate" || col.field === "ldApprovalDate") && item.ldRequest === "NO") disabled = true;
                     if ((col.field === "bsSentDate" || col.field === "bsApprovalDate" || col.field === "bsMs") && (!item.bq || Number(item.bq) === 0)) disabled = true;
                     if (col.field === "rsMs" && item.rs === "NO") disabled = true;
                     if ((col.field === "bltRd" || col.field === "bltMs" || col.field === "bltMa" || col.field === "ltAd") && item.ltRequest !== "YES") disabled = true;

                     return (
                       <td key={idx} className={`relative border-r border-slate-200 p-1.5 text-center align-middle ${col.bg}`}>
                          {disabled && (
                             <svg className="absolute inset-x-0 inset-y-1 mx-auto w-[60%] h-[80%] pointer-events-none opacity-20 z-10" preserveAspectRatio="none">
                               <line x1="0" y1="100%" x2="100%" y2="0" stroke="black" strokeWidth="1" />
                             </svg>
                          )}
                          
                          {isStatus && (() => {
                             const st = getStatusBadge(item);
                             return <div className={`px-2 py-1 text-[10px] rounded-full border border-slate-200 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-[110px] mx-auto text-center font-bold ${st.color}`}>
                                {st.text}
                             </div>;
                          })()}

                          {isFile && (
                            <div className="flex justify-center items-center w-full min-w-[120px]">
                                {item.plFileUrl ? (
                                    <div className="flex items-center justify-between gap-1 bg-green-50 text-green-700 border border-green-300 w-full px-1.5 py-0.5 rounded shadow-sm relative z-20">
                                        <a href={item.plFileUrl} target="_blank" rel="noreferrer" className="hover:underline text-[10px] truncate max-w-[85px] font-bold" title={item.plFileName || "İndir"}>
                                           ✓ Excel
                                        </a>
                                        <button title="Sil" onClick={() => handleUpdate(item.id, "plFileUrl", null)} className="text-rose-500 hover:text-rose-700 font-bold ml-1 px-1 opacity-70 hover:opacity-100">×</button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 px-2 py-0.5 rounded shadow-sm text-[10px] uppercase font-bold flex items-center justify-center w-full transition-colors relative z-20">
                                        BÖLÜM PDF/XLS
                                        <input type="file" className="hidden" accept=".xlsx,.xls,.pdf" onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileUpload(item.id, e.target.files[0]);
                                        }} />
                                    </label>
                                )}
                            </div>
                          )}

                          {isDate && (
                            <input 
                              type="date"
                              disabled={disabled}
                              value={formatDateForInput(item[col.field])}
                              onChange={(e) => handleUpdate(item.id, col.field, e.target.value)}
                              className={`relative z-20 w-full border rounded px-1 min-w-[105px] text-center h-[26px] transition-colors focus:ring-1 focus:ring-indigo-500 ${
                                disabled 
                                  ? 'bg-slate-100/30 text-transparent border-slate-200 cursor-not-allowed pointer-events-none' 
                                  : 'bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 cursor-pointer'
                              }`}
                            />
                          )}

                          {isSelect && (
                            <select
                              value={item[col.field] || "WAIT"}
                              disabled={disabled}
                              onChange={(e) => handleUpdate(item.id, col.field, e.target.value)}
                              className={`relative z-20 w-full border rounded px-1 text-center h-[26px] font-bold focus:ring-1 focus:ring-indigo-500 transition-colors ${
                                disabled
                                  ? 'bg-slate-100/30 text-transparent border-slate-200 cursor-not-allowed pointer-events-none appearance-none'
                                  : `bg-transparent border-transparent hover:border-slate-300 focus:border-indigo-500 cursor-pointer ${item[col.field] === 'YES' || item[col.field] === 'OK' ? 'text-emerald-700' : item[col.field] === 'NO' ? 'text-rose-700' : 'text-slate-500'}`
                              }`}
                            >
                               {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          )}

                          {isCheckbox && (
                            <div className="flex justify-center items-center w-full h-[26px] relative z-20">
                              <input 
                                type="checkbox"
                                checked={!!item[col.field]}
                                disabled={disabled}
                                onChange={(e) => handleUpdate(item.id, col.field, e.target.checked)}
                                className={`w-5 h-5 rounded focus:ring-indigo-500 ${
                                  disabled
                                    ? 'text-slate-300 border-slate-200 cursor-not-allowed pointer-events-none'
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
