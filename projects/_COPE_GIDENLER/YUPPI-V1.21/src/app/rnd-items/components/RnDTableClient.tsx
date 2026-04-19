"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RnDTableClient({ items, rndNote }: { items: any[], rndNote?: string | null }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, dir: "asc" | "desc" } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  // Excel Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importNote, setImportNote] = useState("");

  const toggleRow = (id: number) => {
     setExpandedRows(prev => {
        if (prev[id]) return {};
        return { [id]: true };
     });
  };

  const parseRawData = (rawDataStr: string | null) => {
     if (!rawDataStr) return null;
     try {
       return JSON.parse(rawDataStr);
     } catch(e) {
       return null;
     }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setIsImporting(true);
    setImportStatus("Dosya yükleniyor ve işleniyor, lütfen bekleyin...");

    const formData = new FormData();
    formData.append("file", importFile);
    if(importNote) {
       formData.append("note", importNote);
    }

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setImportStatus(`✅ Başarılı! ${data.count} satır aktarıldı.`);
        setTimeout(() => {
           setIsImportModalOpen(false);
           setImportFile(null);
           setImportStatus("");
           router.refresh();
        }, 2000);
      } else {
        setImportStatus(`❌ Hata: ${data.error}`);
      }
    } catch (error: any) {
      setImportStatus(`❌ Hata: Sunucuya bağlanılamadı.`);
    } finally {
      setIsImporting(false);
    }
  };

  let filteredItems = items;
  if (searchTerm) {
     const lower = searchTerm.toLocaleLowerCase('tr-TR');
     filteredItems = filteredItems.filter(p => {
        let match = (p.code && p.code.toLocaleLowerCase('tr-TR').includes(lower)) ||
                    (p.name && p.name.toLocaleLowerCase('tr-TR').includes(lower)) ||
                    (p.composition && p.composition.toLocaleLowerCase('tr-TR').includes(lower));
        if(!match && p.rawData) {
           match = p.rawData.toLocaleLowerCase('tr-TR').includes(lower);
        }
        return match;
     });
  }

  if (sortConfig) {
     filteredItems.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
     });
  }

  const handleSort = (key: string) => {
    let dir: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.dir === "asc") {
       dir = "desc";
    }
    setSortConfig({ key, dir });
  };

  return (
    <div className="w-full h-full flex flex-col items-start relative pb-20">
      <div className="sticky top-0 z-20 w-full bg-slate-50/95 backdrop-blur-md shadow-sm border-b border-slate-200 flex justify-between items-center pb-4 mb-3 pt-2 px-2">
        <div className="flex-1 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Ar-Ge Kütüphanesi
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">USK Tekstil Ürün Deposu</p>
          </div>
          {rndNote && (
            <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm mr-2 mb-1">
              {rndNote}
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-[80px] z-10 flex w-full items-center gap-3 mb-4 bg-white/90 backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 shadow-md transition-all shrink-0">
        <div className="flex-1 relative">
           <svg className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           <input
             type="text"
             placeholder="Kalite adına, koduna veya kompozisyona göre ara..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all text-sm font-medium bg-white"
           />
        </div>
        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center font-bold text-sm transition-colors shadow-sm whitespace-nowrap">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Excel'den İçe Aktar
        </button>
      </div>

      <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col mt-2">
          <div className="overflow-x-auto overflow-y-auto w-full max-h-[calc(100vh-210px)] relative">
            <table className="w-full text-left border-collapse table-auto min-w-max">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-300">
                  <th className="py-4 px-4 sticky top-0 bg-slate-100 z-10 text-left w-24">İşlemler</th>
                  <th className="py-4 px-4 sticky top-0 bg-slate-100 z-10 w-24 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('code')}>
                    Kodu {sortConfig?.key==='code'?(sortConfig.dir==='asc'?'▲':'▼'):''}
                  </th>
                  <th className="py-4 px-3 sticky top-0 bg-slate-100 z-10 w-64 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('name')}>
                    Kalite Adı {sortConfig?.key==='name'?(sortConfig.dir==='asc'?'▲':'▼'):''}
                  </th>
                  <th className="py-4 px-3 sticky top-0 bg-slate-100 z-10 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('composition')}>
                    Konstrüksiyon {sortConfig?.key==='composition'?(sortConfig.dir==='asc'?'▲':'▼'):''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">Eşleşen Ar-Ge kaydı bulunamadı.</td>
                  </tr>
                ) : (
                  filteredItems.map(p => {
                    const rawDataObj = parseRawData(p.rawData);
                    const isExpanded = !!expandedRows[p.id];
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-blue-50/50 transition-colors group">
                          <td className="py-3 px-4 text-left">
                             {rawDataObj && (
                                <button onClick={() => toggleRow(p.id)} className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:text-blue-700 transition-all font-bold shadow-sm whitespace-nowrap flex items-center justify-center">
                                   {isExpanded ? "Kapat" : "İncele"}
                                   <svg className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                             )}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-slate-600">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{p.code || "BOS"}</span>
                          </td>
                          <td className="py-3 px-3">
                             <div className="font-bold text-[14px] text-slate-800 group-hover:text-blue-700 transition-colors">{p.name}</div>
                          </td>
                          <td className="py-3 px-3 text-sm font-medium text-slate-700 max-w-sm truncate" title={p.composition || ""}>
                             {p.composition || "-"}
                          </td>
                        </tr>
                        {isExpanded && rawDataObj && (
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                             <td colSpan={4} className="py-4 px-6">
                                <div className="flex flex-wrap gap-x-8 gap-y-5 p-5 bg-white rounded-xl border border-slate-200 shadow-inner">
                                   {Object.entries(rawDataObj).map(([key, val]) => {
                                      if(!val || val === "") return null;
                                      
                                      let displayKey = key;
                                      if (!key || key.trim() === "" || key.startsWith("__EMPTY")) {
                                         displayKey = "ATKI";
                                      }

                                      return (
                                        <div key={key} className="flex flex-col flex-1 min-w-[150px] max-w-full border-b border-slate-100 pb-2">
                                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{displayKey}</span>
                                           <span 
                                              className="text-sm font-bold text-slate-800 cursor-pointer hover:text-blue-700 hover:bg-blue-100 inline-block px-1.5 -mx-1.5 py-0.5 rounded transition-colors break-words"
                                              title="Tıklayarak sadece bu değere sahip ürünleri filtrele"
                                              onClick={() => { setSearchTerm(String(val)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                           >
                                              {String(val)}
                                           </span>
                                        </div>
                                      )
                                   })}
                                </div>
                             </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* EXCEL IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden transform transition-all">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <h3 className="text-xl font-bold text-slate-800">Ar-Ge Dosyası İçe Aktar</h3>
               </div>
               <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <div className="p-6">
                <p className="text-sm text-slate-600 mb-6">
                   Lütfen güncel <strong>KOLLEKSİYON LİST ÜR-GE</strong> formatlı Excel (xlsx, xls) dosyanızı seçin. Excel'deki TÜM sütunlar akıllıca okunup kaydedilecektir. Sisteme ana ürün (fiyatı olan ürün) eklenmesini beklemez, yalnızca bu "depoya" alır.
                </p>

                <form onSubmit={handleImportSubmit} className="space-y-4">
                  <div className="flex justify-center px-6 py-10 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                     <div className="space-y-2 text-center pointer-events-none">
                       {importFile ? (
                          <div className="text-green-600 font-bold flex flex-col items-center">
                             <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                             {importFile.name}
                          </div>
                       ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            <div className="text-sm text-slate-600"><span className="text-indigo-600 font-bold hover:underline">Dosya Yükle</span> seçimi yapmak için tıklayın</div>
                          </>
                       )}
                     </div>
                     <input 
                       type="file" 
                       ref={fileInputRef}
                       accept=".xls,.xlsx" 
                       onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                       className="hidden" 
                     />
                  </div>

                  {importStatus && (
                    <div className={`p-3 rounded-lg text-sm font-semibold border ${importStatus.includes("Hata") ? "bg-red-50 text-red-600 border-red-200" : importStatus.includes("Başarılı") ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                      {importStatus}
                    </div>
                  )}

                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Dosya Notu (İsteğe Bağlı)</label>
                     <input
                       type="text"
                       placeholder="Örn: Revize Liste Ocak 2026 (Boş bırakılırsa onay tarihi yazılır)"
                       value={importNote}
                       onChange={e => setImportNote(e.target.value)}
                       className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-500"
                     />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                     <button type="button" disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">İptal</button>
                     <button type="submit" disabled={isImporting || !importFile} className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed">
                       {isImporting ? "Yükleniyor..." : "İçe Aktarımı Başlat"}
                     </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
