"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductTableClient({ products, userRole }: { products: any[], userRole?: string }) {
  const router = useRouter();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "passive" | "cancelled" | "new">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: "code" | "name" | "comp", dir: "asc" | "desc"} | null>(null);

  const filteredProducts = React.useMemo(() => {
     let result = products.filter(p => {
        let st = p.status || (p.isActive === false ? "PASSIVE" : "ACTIVE");
        if (activeTab === "active") return st === "ACTIVE";
        if (activeTab === "passive") return st === "PASSIVE";
        if (activeTab === "cancelled") return st === "CANCELLED";
        if (activeTab === "new") return st === "NEW";
        return false;
     });

     if (searchTerm) {
        const lower = searchTerm.toLocaleLowerCase('tr-TR');
        result = result.filter(p => 
           (p.code && p.code.toLocaleLowerCase('tr-TR').includes(lower)) ||
           (p.name && p.name.toLocaleLowerCase('tr-TR').includes(lower)) ||
           (p.composition && p.composition.toLocaleLowerCase('tr-TR').includes(lower))
        );
     }

     if (sortConfig) {
        result.sort((a,b) => {
           let aVal = ""; let bVal = "";
           if (sortConfig.key === "code") { aVal = a.code || ""; bVal = b.code || ""; }
           if (sortConfig.key === "name") { aVal = a.name || ""; bVal = b.name || ""; }
           if (sortConfig.key === "comp") { aVal = a.composition || ""; bVal = b.composition || ""; }
           const res = aVal.localeCompare(bVal, 'tr-TR');
           return sortConfig.dir === "asc" ? res : -res;
        });
     }
     return result;
  }, [products, activeTab, searchTerm, sortConfig]);

  const handleSort = (key: "code" | "name" | "comp") => {
     let dir: "asc" | "desc" = "asc";
     if (sortConfig && sortConfig.key === key && sortConfig.dir === "asc") {
        dir = "desc";
     }
     setSortConfig({ key, dir });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  
  const [config, setConfig] = useState<any>(null);
  const [autoCalc, setAutoCalc] = useState(true);

  useEffect(() => {
    fetch("/api/system-config")
      .then(res => res.json())
      .then(data => {
         if(data.data) setConfig(data.data);
      }).catch(e => console.error("Config fetch error", e));
  }, []);
  
  const [formData, setFormData] = useState({
    code: "", name: "", composition: "", weight: "", width: "", gtipNo: "", 
    minOrderQty: 0, mcq: 0, tMoq: 0, 
    costPrice: "", priceTier1: "", priceTier2: "", priceTier3: "", poundPrice: "", euroPrice: "",
    status: "ACTIVE",
    productTypes: [] as string[],
    priceUpdatedAt: null as string | null,
    priceNote: ""
  });
  
  const [isBulkTypeModalOpen, setIsBulkTypeModalOpen] = useState(false);
  const [bulkTypes, setBulkTypes] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const handleTierChange = (tierName: "priceTier1" | "priceTier2" | "priceTier3", valStr: string) => {
     setFormData(prev => {
        let newForm = { ...prev, [tierName]: valStr };
        let nGbp = prev.poundPrice;
        let nEur = prev.euroPrice;
        
        let targetTier = config?.baseTier;
        if(targetTier === "T1") targetTier = "priceTier1";
        if(targetTier === "T2") targetTier = "priceTier2";
        if(targetTier === "T3") targetTier = "priceTier3";
        
        if (autoCalc && config && targetTier === tierName) {
           const val = parseFloat(valStr);
           if (!isNaN(val)) {
              const gbpBase = val / (config.usdToGbpRate || 1.30);
              const eurBase = val / (config.usdToEurRate || 1.10);

              const gbpCif = (gbpBase * (1 + (config.gbpCommission || 0) / 100)) + (config.gbpFreight || 0);
              const eurCif = (eurBase * (1 + (config.eurCommission || 0) / 100)) + (config.eurFreight || 0);

              nGbp = String(parseFloat(gbpCif.toFixed(2)));
              nEur = String(parseFloat(eurCif.toFixed(2)));
           } else if (valStr === "") {
              nGbp = "";
              nEur = "";
           }
           newForm.poundPrice = nGbp;
           newForm.euroPrice = nEur;
        }
        
        return newForm;
     });
  };

  const handleAutoCostPricing = () => {
     if (!formData.costPrice || isNaN(parseFloat(formData.costPrice))) return;
     const M = parseFloat(formData.costPrice);
     const t1 = M * 1.38;
     const t2 = M * 1.32;
     const t3 = M * 1.23;

     setFormData(prev => {
        let newForm = {
           ...prev,
           priceTier1: String(parseFloat(t1.toFixed(2))),
           priceTier2: String(parseFloat(t2.toFixed(2))),
           priceTier3: String(parseFloat(t3.toFixed(2)))
        };

        if (autoCalc && config) {
           let targetTier = config.baseTier;
           let baseVal = t2;
           if(targetTier === "T1") baseVal = t1;
           if(targetTier === "T3") baseVal = t3;

           const gbpBase = baseVal / (config.usdToGbpRate || 1.30);
           const eurBase = baseVal / (config.usdToEurRate || 1.10);

           const gbpCif = (gbpBase * (1 + (config.gbpCommission || 0) / 100)) + (config.gbpFreight || 0);
           const eurCif = (eurBase * (1 + (config.eurCommission || 0) / 100)) + (config.eurFreight || 0);

           newForm.poundPrice = String(parseFloat(gbpCif.toFixed(2)));
           newForm.euroPrice = String(parseFloat(eurCif.toFixed(2)));
        }

        return newForm;
     });
  };

  // Excel Import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importNote, setImportNote] = useState("");

  // RnD Search Modal
  const [isRndModalOpen, setIsRndModalOpen] = useState(false);
  const [rndSearchTerm, setRndSearchTerm] = useState("");
  const [rndResults, setRndResults] = useState<any[]>([]);
  const [isRndSearching, setIsRndSearching] = useState(false);

  const searchRnD = async (query: string) => {
     setRndSearchTerm(query);
     if(query.length < 2) {
        setRndResults([]);
        return;
     }
     setIsRndSearching(true);
     try {
       const res = await fetch(`/api/rnd-items?query=${encodeURIComponent(query)}`);
       const json = await res.json();
       setRndResults(json.data || []);
     } catch(e) {
       console.error("Error fetching rnd");
     } finally {
       setIsRndSearching(false);
     }
  };

  const handleSelectRndItem = (item: any) => {
     setFormData(prev => ({
        ...prev,
        composition: item.composition || prev.composition,
        weight: item.weight || prev.weight,
        width: item.width || prev.width
     }));
     setIsRndModalOpen(false);
     setRndSearchTerm("");
     setRndResults([]);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleOpenModal = (product?: any) => {
    setError("");
    if (product) {
      setEditProduct(product);
      setFormData({
        code: product.code || "",
        name: product.name || "",
        composition: product.composition || "",
        weight: product.weight || "",
        width: product.width || "",
        gtipNo: product.gtipNo || "",
        minOrderQty: product.minOrderQty || 0,
        mcq: product.mcq || 0,
        tMoq: product.tMoq || 0,
        costPrice: product.costPrice || "",
        priceTier1: product.priceTier1 || "",
        priceTier2: product.priceTier2 || "",
        priceTier3: product.priceTier3 || "",
        poundPrice: product.poundPrice || "",
        euroPrice: product.euroPrice || "",
        status: product.status || (product.isActive === false ? "PASSIVE" : "ACTIVE"),
        productTypes: product.productTypes ? product.productTypes.split(",") : [],
        priceUpdatedAt: product.priceUpdatedAt || null,
        priceNote: product.priceNote || ""
      });
    } else {
      setEditProduct(null);
      setFormData({
         code: "", name: "", composition: "", weight: "", width: "", gtipNo: "", minOrderQty: 0, mcq: 0, tMoq: 0, costPrice: "", priceTier1: "", priceTier2: "", priceTier3: "", poundPrice: "", euroPrice: "", status: "ACTIVE", productTypes: [], priceUpdatedAt: null, priceNote: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";
      
      let finalCode = formData.code;
      if (!finalCode || finalCode.trim() === "") {
        const lowerName = formData.name.toLowerCase();
        const keywords = ["jl", "ecovero", "bci", "recycle", "rcyc"];
        if (keywords.some(kw => lowerName.includes(kw))) {
          finalCode = `S-${formData.name}`;
        }
      }

      const payload = {
        ...formData,
        code: finalCode,
        minOrderQty: parseFloat(formData.minOrderQty as any) || 0,
        mcq: parseFloat(formData.mcq as any) || null,
        tMoq: parseFloat(formData.tMoq as any) || null,
        costPrice: parseFloat(formData.costPrice as any) || null,
        priceTier1: parseFloat(formData.priceTier1 as any) || null,
        priceTier2: parseFloat(formData.priceTier2 as any) || null,
        priceTier3: parseFloat(formData.priceTier3 as any) || null,
        poundPrice: parseFloat(formData.poundPrice as any) || null,
        euroPrice: parseFloat(formData.euroPrice as any) || null,
        status: formData.status,
        productTypes: formData.productTypes.join(","),
        priceNote: formData.priceNote
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu.");
      }

      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = async (action: 'aktifle' | 'pasifle' | 'iptal') => {
    if (selectedProductIds.length === 0) return;
    
    let msg = action === 'aktifle' ? 'aktifleştirmek' : action === 'pasifle' ? 'pasife almak' : 'iptal etmek';
    if (!window.confirm(`Seçili ${selectedProductIds.length} ürünü ${msg} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedProductIds })
      });
      if (!res.ok) throw new Error("İşlem başarısız.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBulkTypeSave = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'cinsle', ids: selectedProductIds, data: { types: bulkTypes } })
      });
      if (!res.ok) throw new Error("İşlem başarısız.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (activeTab === "active") return;
    const pass = window.prompt("Dikkat: Bu işlem geri alınamaz. Devam etmek için yönetici şifresini giriniz (Şifre: yuppi):");
    if (pass !== "yuppi") {
      alert("Hatalı şifre.");
      return;
    }
    
    try {
      for (const id of selectedProductIds) {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE", headers: { "x-user-role": userRole || "" } });
        if (!res.ok) throw new Error("Silme işlemi başarısız.");
      }
      window.location.reload();
    } catch(err:any){
      alert(err.message);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
       setImportStatus("Lütfen bir Excel dosyası seçin.");
       return;
    }
    
    setIsImporting(true);
    setImportStatus("Yükleniyor ve işleniyor, lütfen bekleyin...");
    
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      if (importNote.trim()) {
         fd.append("note", importNote.trim());
      }
      
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: fd
      });
      
      const data = await res.json();
      
      if(!res.ok) {
         throw new Error(data.error || "Sunucu hatası");
      }
      
      setImportStatus(`✅ Başarılı! Toplam ${data.count} ürün işlendi.`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        window.location.reload();
      }, 1500);
      
    } catch(err: any) {
      setImportStatus("Hata: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start relative pb-20">
      <div className="sticky top-0 z-20 w-full bg-slate-50/95 backdrop-blur-md border-b border-slate-200 flex justify-between items-center pb-4 mb-3 pt-6 px-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
            Ürün Kataloğu
          </h1>
        </div>
        <div className="flex space-x-3">
          {userRole !== 'USER' && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="group relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Excel'den Aktar
            </button>
          )}
          {userRole !== 'USER' && (
            <button 
              onClick={() => handleOpenModal()}
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-blue-900 border border-transparent rounded-lg hover:bg-blue-800 shadow-md"
            >
              <span className="mr-2 text-lg leading-none">+</span> Yeni Ürün Ekle
            </button>
          )}
        </div>
      </div>

      <div className="sticky top-[80px] z-10 flex w-full items-center gap-3 mb-4 bg-white/90 backdrop-blur-xl p-3 rounded-xl border border-slate-200 shadow-sm transition-all shrink-0">
        {selectedProductIds.length > 0 && userRole === 'ADMIN' && (
           <div className="flex bg-indigo-50/50 items-center px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm space-x-2">
             <span className="text-xs font-bold text-indigo-700">{selectedProductIds.length} Seçili</span>
             <div className="w-px h-4 bg-indigo-200"></div>
             {selectedProductIds.length === 1 && (
               <button onClick={() => {
                 const p = products.find(prod => prod.id === selectedProductIds[0]);
                 if (p) handleOpenModal(p);
               }} className="text-[11px] font-bold text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded shadow-sm hover:bg-indigo-50 transition">Düzenle</button>
             )}
             <button onClick={() => { setBulkTypes([]); setIsBulkTypeModalOpen(true); }} className="text-[11px] font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded shadow-sm hover:bg-blue-50 transition">Cinsle</button>
             
             {activeTab !== 'active' && (
                <button onClick={() => handleBulkAction('aktifle')} className="text-[11px] font-bold text-emerald-600 bg-white border border-emerald-200 px-2.5 py-1 rounded shadow-sm hover:bg-emerald-50 transition">Aktifle</button>
             )}
             {activeTab !== 'passive' && (
                <button onClick={() => handleBulkAction('pasifle')} className="text-[11px] font-bold text-orange-600 bg-white border border-orange-200 px-2.5 py-1 rounded shadow-sm hover:bg-orange-50 transition">Pasifle</button>
             )}
             {activeTab !== 'cancelled' && (
                <button onClick={() => handleBulkAction('iptal')} className="text-[11px] font-bold text-slate-600 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-sm hover:bg-slate-100 transition">Kaldır</button>
             )}
              {(activeTab === 'new' || activeTab === 'passive' || activeTab === 'cancelled') && userRole === 'ADMIN' && (
                 <button onClick={handleDelete} className="text-[11px] font-bold text-red-600 bg-white border border-red-200 px-2.5 py-1 rounded shadow-sm hover:bg-red-50 transition flex items-center">
                   <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   Sil
                 </button>
              )}
              <button 
                onClick={() => setSelectedProductIds([])} 
                className="text-[11px] font-bold text-slate-500 bg-transparent px-2.5 py-1 hover:bg-slate-200/50 hover:text-slate-700 rounded transition"
              >
                Vazgeç
              </button>
            </div>
         )}

        <div className="relative ml-2 w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input
             type="text"
             placeholder="Kodu, isim, kompozisyon.."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 text-slate-800"
           />
        </div>

        <div className="ml-auto flex flex-col md:flex-row shrink-0 border-l border-slate-300 pl-4 space-x-2">
          <button
            onClick={() => { setActiveTab("active"); setSelectedProductIds([]); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm border ${
              activeTab === "active" ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-slate-500 border-transparent shadow-none hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => { setActiveTab("new"); setSelectedProductIds([]); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm border ${
              activeTab === "new" ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-transparent text-slate-500 border-transparent shadow-none hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Yeni
          </button>
          <button
            onClick={() => { setActiveTab("passive"); setSelectedProductIds([]); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm border ${
              activeTab === "passive" ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-transparent text-slate-500 border-transparent shadow-none hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Pasif
          </button>
          <button
            onClick={() => { setActiveTab("cancelled"); setSelectedProductIds([]); }}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm border ${
              activeTab === "cancelled" ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-transparent text-slate-500 border-transparent shadow-none hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Kaldırılan
          </button>
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)] relative">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm">
                <tr className="text-slate-600 text-[11px] uppercase tracking-wider font-bold select-none">
                  <th className="py-4 px-4 w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-indigo-600 cursor-pointer" 
                           checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                           onChange={(e) => {
                              if(e.target.checked) setSelectedProductIds(filteredProducts.map(p => p.id));
                              else setSelectedProductIds([]);
                           }} />
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center">
                      Kodu
                      {sortConfig?.key === "code" && (
                         <span className="ml-1 text-blue-600">{sortConfig.dir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-4 px-4 font-semibold w-64 cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      KALİTE ADI
                      {sortConfig?.key === "name" && (
                         <span className="ml-1 text-blue-600">{sortConfig.dir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-3 font-semibold text-center">CİNSİ</th>
                  <th 
                    className="py-4 px-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors group"
                    onClick={() => handleSort("comp")}
                  >
                    <div className="flex items-center">
                      <div className="flex flex-col text-[11px] leading-tight">
                        <span>KOMPOZİSYON</span>
                        <span>GRAMAJ / EN</span>
                      </div>
                      {sortConfig?.key === "comp" && (
                         <span className="ml-1 text-blue-400">{sortConfig.dir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                  {userRole === 'ADMIN' && (
                     <th className="py-2 px-3 font-semibold text-right align-top">
                        <div className="flex flex-col items-end">
                           <span className="mb-0.5">Maliyet($)</span>
                        </div>
                     </th>
                  )}
                  <th className="py-2 px-3 font-semibold text-right align-top">
                     <div className="flex flex-col items-end">
                        <span className="mb-0.5">T1 ($)</span>
                        <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">FOB</span>
                     </div>
                  </th>
                  <th className="py-2 px-3 font-semibold text-right align-top">
                     <div className="flex flex-col items-end">
                        <span className="mb-0.5">T2 ($)</span>
                        <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">FOB</span>
                     </div>
                  </th>
                  <th className="py-2 px-3 font-semibold text-right align-top">
                     <div className="flex flex-col items-end">
                        <span className="mb-0.5">T3 ($)</span>
                        <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">FOB</span>
                     </div>
                  </th>
                  <th className="py-2 px-3 font-semibold text-right align-top">
                     <div className="flex flex-col items-end">
                        <span className="mb-0.5">GBP(£)</span>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                           {(config?.gbpCommission && config.gbpCommission > 0) ? "CIF-IC" : ((config?.gbpFreight && config.gbpFreight > 0) ? "CIF" : "FOB")}
                        </span>
                     </div>
                  </th>
                  <th className="py-2 px-3 font-semibold text-right align-top">
                     <div className="flex flex-col items-end">
                        <span className="mb-0.5">EUR(€)</span>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                           {(config?.eurCommission && config.eurCommission > 0) ? "CIF-IC" : ((config?.eurFreight && config.eurFreight > 0) ? "CIF" : "FOB")}
                        </span>
                     </div>
                  </th>
                  <th className="py-4 px-3 font-semibold text-center">MCQ / T.MOQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProducts.length === 0 ? (
                  <tr>
                     <td colSpan={userRole === 'ADMIN' ? 12 : 11} className="text-center py-8 text-slate-500">Gösterilecek ürün yok.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <tr key={p.id} onClick={() => handleCheckboxChange(p.id)} className={`transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-4 text-center">
                          <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-indigo-600 transition-all cursor-pointer" checked={isSelected} onChange={() => {}} />
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-700">
                           {p.code ? <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 text-slate-800">{p.code}</span> : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800 whitespace-normal min-w-[200px]">{p.name || "-"}</td>
                        <td className="py-3 px-3 text-center">
                           <div className="flex flex-wrap justify-center gap-1">
                              {p.productTypes && p.productTypes.split(",").map((t: string) => {
                                 let bg = "bg-slate-50"; let text = "text-slate-700"; let border = "border-slate-200";
                                 if(t === 'W') { bg = "bg-green-100"; text = "text-green-800"; border = "border-green-200"; }
                                 else if(t === 'K') { bg = "bg-blue-100"; text = "text-blue-800"; border = "border-blue-200"; }
                                 else if(t === 'Y') { bg = "bg-yellow-100"; text = "text-yellow-800"; border = "border-yellow-200"; }
                                 else if(t === 'FP') { bg = "bg-emerald-600"; text = "text-white"; border = "border-emerald-700"; }
                                 else if(t === 'PFD') { bg = "bg-purple-100"; text = "text-purple-800"; border = "border-purple-200"; }
                                 else if(t === 'GR') { bg = "bg-slate-200"; text = "text-slate-800"; border = "border-slate-300"; }
                                 else if(t === 'PRT') { bg = "bg-orange-100"; text = "text-orange-800"; border = "border-orange-200"; }
                                 return (
                                   <span key={t} className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${bg} ${text} ${border}`}>
                                      {t}
                                   </span>
                                 )
                              })}
                           </div>
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-normal">
                           <div className="font-semibold text-slate-700">{p.composition || "-"}</div>
                           <div className="font-normal text-slate-500 mt-0.5">
                              {p.weight ? p.weight : "-"} GSM / {p.width ? p.width : "-"} CM
                           </div>
                        </td>
                        {userRole === 'ADMIN' && (
                           <td className="py-3 px-3 text-sm text-right font-medium text-slate-400">
                              {p.costPrice ? p.costPrice.toFixed(2) : "-"}
                           </td>
                        )}
                        <td className="py-3 px-3 text-sm text-right font-medium text-slate-700">{p.priceTier1 ? p.priceTier1.toFixed(2) : "-"}</td>
                        <td className="py-3 px-3 text-sm text-right font-medium text-slate-700">{p.priceTier2 ? p.priceTier2.toFixed(2) : "-"}</td>
                        <td className="py-3 px-3 text-sm text-right font-bold text-slate-800">{p.priceTier3 ? p.priceTier3.toFixed(2) : "-"}</td>
                        <td className="py-3 px-3 text-sm text-right font-bold text-blue-700">{p.poundPrice ? p.poundPrice.toFixed(2) : "-"}</td>
                        <td className="py-3 px-3 text-sm text-right font-bold text-rose-700">{p.euroPrice ? p.euroPrice.toFixed(2) : "-"}</td>
                        <td className="py-3 px-3 text-sm text-center font-bold text-slate-600 bg-slate-50/50">
                           {Number(p.mcq || 0).toLocaleString('tr-TR')} / {Number(p.tMoq || 0).toLocaleString('tr-TR')}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
             <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
               <h3 className="text-xl font-bold text-white">{editProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-300 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <div className="overflow-y-auto p-6">
               <form id="productForm" onSubmit={handleSubmit}>
                  {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold">{error}</div>}
                  
                  {/* IDENTIFICATION */}
                  <div className="flex justify-between items-center border-b border-indigo-100 pb-2 mb-4">
                     <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Temel Bilgiler</h4>
                     <label className="flex items-center cursor-pointer">
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`ml-3 text-sm font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 ${formData.status === 'ACTIVE' ? 'text-emerald-700' : formData.status === 'PASSIVE' ? 'text-orange-700' : 'text-slate-500'}`}>
                             <option value="ACTIVE">Aktif</option>
                             <option value="PASSIVE">Pasif</option>
                             <option value="CANCELLED">İptal</option>
                        </select>
                     </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ürün Kodu *</label>
                        <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Adı / Kalitesi *</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold" />
                     </div>
                  </div>
                  
                  <div className="mb-6">
                     <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Ürün Cinsi</label>
                     <div className="flex flex-wrap gap-3">
                        {[
                           { label: "DOKUMA", val: "W" },
                           { label: "ÖRME", val: "K" },
                           { label: "İPLİK", val: "Y" },
                           { label: "MAMÜL", val: "FP" },
                           { label: "PFD", val: "PFD" },
                           { label: "HAM", val: "GR" },
                           { label: "BASKILI", val: "PRT" }
                        ].map(type => (
                           <label key={type.val} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition border ${formData.productTypes.includes(type.val) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                              <input 
                                 type="checkbox" 
                                 checked={formData.productTypes.includes(type.val)}
                                 onChange={(e) => {
                                    if(e.target.checked) setFormData({...formData, productTypes: [...formData.productTypes, type.val]});
                                    else setFormData({...formData, productTypes: formData.productTypes.filter(t => t !== type.val)});
                                 }}
                                 className="rounded border-slate-300 text-blue-500 focus:ring-indigo-600 w-4 h-4"
                              />
                              <span className={`text-xs font-bold ${formData.productTypes.includes(type.val) ? 'text-indigo-800' : 'text-slate-300'}`}>{type.label} ({type.val})</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* R&D */}
                  <div className="flex justify-between items-center border-b border-blue-100 pb-2 mb-4">
                     <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest">ÜR-GE (Özellikler)</h4>
                     <button type="button" onClick={() => setIsRndModalOpen(true)} className="text-xs bg-blue-50 text-blue-400 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-100 transition shadow-sm font-semibold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        AR-GE'den Çek
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                     <div className="md:col-span-3">
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kompozisyon</label>
                        <input type="text" value={formData.composition} onChange={e => setFormData({...formData, composition: e.target.value})} placeholder="%100 Pamuk vb." className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ağırlık</label>
                        <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="150 gr/m2" className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">En</label>
                        <input type="text" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} placeholder="150 cm" className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">GTİP No</label>
                        <input type="text" value={formData.gtipNo} onChange={e => setFormData({...formData, gtipNo: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all font-mono" />
                     </div>
                  </div>

                  {/* PRICING & MOQ */}
                  <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-2 mb-4 flex justify-between items-center">
                     <span>Fiyat Sınıfları & Sipariş Limitleri</span>
                     <label className="flex items-center text-xs font-medium text-slate-300 bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                       <input type="checkbox" checked={autoCalc} onChange={e => setAutoCalc(e.target.checked)} className="mr-1.5 focus:ring-emerald-500 text-emerald-600 rounded" />
                       {config?.baseTier || "T2"}'den Otomatik EUR/GBP Hesapla
                     </label>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                     <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="block text-[11px] font-bold text-rose-700 uppercase tracking-wide">Maliyet ($)</label>
                           <button type="button" onClick={handleAutoCostPricing} className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold hover:bg-rose-700 shadow-sm transition" title="T1, T2, T3 ve Kurları otomatik doldur">⚡ Hesapla</button>
                        </div>
                        <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full bg-slate-800 border border-rose-500/30 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono text-sm" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis" title="Tier-1 (500-1000)">T1 (500-1K) $</label>
                        <input type="number" step="0.01" value={formData.priceTier1} onChange={e => handleTierChange("priceTier1", e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis" title="Tier-2 (1000-5000)">T2 (1K-5K) $</label>
                        <input type="number" step="0.01" value={formData.priceTier2} onChange={e => handleTierChange("priceTier2", e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis" title="Tier-3 (5000-10000 FOB)">T3 (5K-10K) $</label>
                        <input type="number" step="0.01" value={formData.priceTier3} onChange={e => handleTierChange("priceTier3", e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis flex justify-between" title="Pound Price CIF">
                           <span>GBP (£)</span>
                        </label>
                        <input type="number" step="0.001" value={formData.poundPrice} onChange={e => setFormData({...formData, poundPrice: e.target.value})} className={`w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm ${autoCalc ? 'bg-blue-50/50' : ''}`} />
                     </div>
                     <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis flex justify-between" title="Euro Price CIF">
                           <span>EURO (€)</span>
                        </label>
                        <input type="number" step="0.001" value={formData.euroPrice} onChange={e => setFormData({...formData, euroPrice: e.target.value})} className={`w-full bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm ${autoCalc ? 'bg-blue-50/50' : ''}`} />
                     </div>
                  </div>
                  
                  <div className="mb-5 bg-slate-50 border border-slate-700 rounded-lg p-3">
                     <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fiyat Notu / Açıklama</label>
                     <textarea rows={2} value={formData.priceNote || ""} onChange={e => setFormData({...formData, priceNote: e.target.value})} placeholder="Örn: Excel yükleme tarihi veya özel bir not..." className="w-full bg-white border border-slate-200 text-slate-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none"></textarea>
                     {formData.priceUpdatedAt && (
                        <div className="text-right text-[10px] font-semibold text-slate-400 mt-1">
                           Son Fiyat Güncellemesi: {new Date(formData.priceUpdatedAt).toLocaleDateString('tr-TR')}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-3 gap-5 mb-6">
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Total MOQ</label>
                        <input type="number" step="0.01" value={formData.tMoq} onChange={e => setFormData({...formData, tMoq: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Renk MOQ (MCQ)</label>
                        <input type="number" step="0.01" value={formData.mcq} onChange={e => setFormData({...formData, mcq: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-slate-800 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Eski MOQ</label>
                        <input type="number" step="0.01" value={formData.minOrderQty} onChange={e => setFormData({...formData, minOrderQty: parseFloat(e.target.value) || 0})} className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 outline-none" />
                     </div>
                  </div>
                  

               </form>
             </div>
             <div className="flex justify-end gap-3 p-5 border-t border-slate-700 bg-slate-800 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Kapat</button>
                <button type="submit" form="productForm" disabled={isSubmitting} className="px-8 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-md">
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden transform transition-all">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <h3 className="text-xl font-bold text-slate-800">Excel'den İçe Aktar</h3>
               </div>
               <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-300 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <div className="p-6">
                <p className="text-sm text-slate-300 mb-6">
                   Lütfen güncel <strong>FİYAT LİSTESİ</strong> veya <strong>KOLLEKSİYON LİST ÜR-GE</strong> formatlı Excel (xlsx, xls) dosyanızı seçin. Sistem otomatik olarak tabloyu okuyup veritabanını senkronize edecektir.
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
                            <div className="text-sm text-slate-300"><span className="text-blue-500 font-bold hover:underline">Dosya Yükle</span> seçimi yapmak için tıklayın</div>
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
                    <div className={`p-3 rounded-lg text-sm font-semibold border ${importStatus.includes("Hata") ? "bg-red-50 text-red-600 border-red-200" : importStatus.includes("Başarılı") ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-400 border-blue-200"}`}>
                      {importStatus}
                    </div>
                  )}
                  
                  <div className="pt-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fiyat Notu / Açıklama (Opsiyonel)</label>
                      <input type="text" value={importNote} onChange={e => setImportNote(e.target.value)} placeholder="Excel içeriği için genel bir not (Yüklenme tarihi vb.)" className="w-full bg-white border border-slate-200 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                   </div>

                 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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

      {/* RND SEARCH MODAL */}
      {isRndModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">Ar-Ge Kütüphanesinde Ara</h3>
               <button onClick={() => setIsRndModalOpen(false)} className="text-slate-400 hover:text-slate-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             
             <div className="p-6">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Kalite Adı veya Kodu yazın (örn: ZOE)" 
                  value={rndSearchTerm} 
                  onChange={(e) => searchRnD(e.target.value)} 
                  className="w-full bg-white border-2 border-slate-200 text-slate-200 rounded-lg px-4 py-3 outline-none focus:ring-0 focus:border-blue-500 transition-colors font-medium mb-4" 
                />
                
                <div className="bg-slate-50 rounded-lg border border-slate-200 h-64 overflow-y-auto">
                   {isRndSearching ? (
                      <div className="p-4 text-center text-slate-500 animate-pulse">Aranıyor...</div>
                   ) : rndResults.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                          {rndSearchTerm.length < 2 ? "Aramak için en az 2 harf yazın." : "Kayıt bulunamadı. Lütfen yeni ÜR-GE tablosu yüklediğinizden emin olun."}
                      </div>
                   ) : (
                      <ul className="divide-y divide-slate-200">
                         {rndResults.map((item, idx) => (
                            <li key={idx}>
                               <button type="button" onClick={() => handleSelectRndItem(item)} className="w-full text-left px-4 py-3 hover:bg-white focus:bg-blue-50 transition-colors group flex justify-between items-center">
                                  <div>
                                     <div className="font-bold text-slate-800">{item.name}</div>
                                     <div className="text-xs font-mono text-slate-500 truncate mt-0.5">{item.code || "-"}</div>
                                  </div>
                                  <div className="text-xs text-slate-400 group-hover:text-blue-600 font-medium">Seç &rarr;</div>
                               </button>
                            </li>
                         ))}
                      </ul>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
      {/* BULK CINSLE MODAL */}
      {isBulkTypeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">Toplu Cins Atama ({selectedProductIds.length} Ürün)</h3>
               <button onClick={() => setIsBulkTypeModalOpen(false)} className="text-slate-400 hover:text-slate-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6">
                <div className="mb-6">
                     <label className="block text-[12px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Ürün Cinsi Seçimi</label>
                     <div className="flex flex-wrap gap-3">
                        {[
                           { label: "DOKUMA", val: "W" }, { label: "ÖRME", val: "K" }, { label: "İPLİK", val: "Y" },
                           { label: "MAMÜL", val: "FP" }, { label: "PFD", val: "PFD" }, { label: "HAM", val: "GR" },
                           { label: "BASKILI", val: "PRT" }
                        ].map(type => (
                           <label key={type.val} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition border ${bulkTypes.includes(type.val) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                              <input 
                                 type="checkbox" 
                                 checked={bulkTypes.includes(type.val)}
                                 onChange={(e) => {
                                    if(e.target.checked) setBulkTypes([...bulkTypes, type.val]);
                                    else setBulkTypes(bulkTypes.filter(t => t !== type.val));
                                 }}
                                 className="rounded border-slate-300 text-blue-500 focus:ring-indigo-600 w-4 h-4"
                              />
                              <span className={`text-xs font-bold ${bulkTypes.includes(type.val) ? 'text-indigo-800' : 'text-slate-300'}`}>{type.label} ({type.val})</span>
                           </label>
                        ))}
                     </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsBulkTypeModalOpen(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">İptal</button>
                  <button type="button" onClick={handleBulkTypeSave} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md">
                    Toplu Uygula
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
