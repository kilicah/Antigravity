"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [config, setConfig] = useState<any>({
    commissionRate: 1.05,
    freightCost: 0.20,
    usdToGbpRate: 1.25,
    usdToEurRate: 1.08,
    baseTier: "T2",
    usdToTryRate: 50.00,
    usdFreight: 0.0,
    gbpFreight: 0.20,
    eurFreight: 0.25,
    tryFreight: 0.0,
    usdCommission: 0.0,
    gbpCommission: 5.0,
    eurCommission: 0.0,
    tryCommission: 0.0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);
  const [recalcTypes, setRecalcTypes] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [rawInput, setRawInput] = useState("");
  const [calcMode, setCalcMode] = useState<"COST" | "T3">("COST");

  const [t1Percent, setT1Percent] = useState("38");
  const [t2Percent, setT2Percent] = useState("32");
  const [t3Percent, setT3Percent] = useState("23");

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchMatrixProduct, setSearchMatrixProduct] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const parsedInput = parseFloat(rawInput) || 0;
  const t3Multiplier = 1 + (parseFloat(t3Percent) || 0) / 100;
  const M = calcMode === "COST" ? parsedInput : (parsedInput / t3Multiplier);

  const displayCost = calcMode === "COST" ? rawInput : (M > 0 ? M.toFixed(2) : "");
  const displayT3 = calcMode === "T3" ? rawInput : (M > 0 ? (M * t3Multiplier).toFixed(2) : "");

  const getRowData = (pPercent: string) => {
     if (M === 0) return { usd: "-", tl: "-", gbp: "-", eur: "-" };
     const multiplier = 1 + (parseFloat(pPercent) || 0) / 100;
     const tierValue = M * multiplier; // FOB USD
     const tlValue = tierValue * (config.usdToTryRate ? parseFloat(String(config.usdToTryRate)) : 50); // FOB TL
     
     // GBP CIF
     const gbpBase = tierValue / (config.usdToGbpRate || 1.30);
     const gbpCif = (gbpBase * (1 + (config.gbpCommission || 0) / 100)) + (config.gbpFreight || 0);

     // EUR CIF
     const eurBase = tierValue / (config.usdToEurRate || 1.10);
     const eurCif = (eurBase * (1 + (config.eurCommission || 0) / 100)) + (config.eurFreight || 0);
     
     return {
        usd: tierValue.toFixed(2),
        tl: tlValue.toFixed(2),
        gbp: gbpCif.toFixed(2),
        eur: eurCif.toFixed(2)
     };
  };


  useEffect(() => {
    fetch("/api/system-config")
      .then(res => res.json())
      .then(data => {
         if(data.data) {
            setConfig(data.data);
         }
      })
      .catch(console.error);

    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setAllProducts(data);
         setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleApplyMatrix = async () => {
    if (selectedProductIds.length === 0) return alert("Lütfen matrisin işleneceği en az bir ürün seçin.");
    if (M === 0) return alert("Lütfen maliyet veya T3 girerek hesaplama tablosunu doldurun.");
    
    if (!window.confirm(`Seçilen ${selectedProductIds.length} adet ürünün fiyatları tablodaki özel matris değerleri ile değiştirilecektir. Onaylıyor musunuz (Geri alınamaz)?`)) return;

    setIsApplying(true);
    
    const t1Data = getRowData(t1Percent);
    const t2Data = getRowData(t2Percent);
    const t3Data = getRowData(t3Percent);
    
    const baseRow = config.baseTier === "T1" ? t1Data : (config.baseTier === "T3" ? t3Data : t2Data);

    const updates = {
      costPrice: M,
      priceTier1: parseFloat(t1Data.usd),
      priceTier2: parseFloat(t2Data.usd),
      priceTier3: parseFloat(t3Data.usd),
      poundPrice: parseFloat(baseRow.gbp),
      euroPrice: parseFloat(baseRow.eur),
    };

    try {
      const res = await fetch("/api/system-config/apply-custom-matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProductIds, updates })
      });
      if (res.ok) alert(`Matris başarıyla ${selectedProductIds.length} ürüne uygulandı!`);
      else alert("Güncelleme sırasında hata oluştu.");
    } catch {
      alert("Sunucu hatası.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/system-config", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(config)
      });
      if(res.ok) {
         setMessage("Ayarlar başarıyla kaydedildi!");
      } else {
         setMessage("Kaydedilirken bir hata oluştu.");
      }
    } catch(err) {
      setMessage("Sunucu hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerRecalculate = () => {
     if (recalcTypes.length === 0) {
        alert("Lütfen en az bir cins seçimi yapınız. Hiçbir cins seçilmeden güncelleme yapılamaz.");
        return;
     }

     if (!window.confirm(`Seçtiğiniz ${recalcTypes.length} cins ( ${recalcTypes.join(", ")} ) ürünlerin GBP ve EURO fiyatları şu anki ayarlarınıza göre hesaplanacak. Onaylıyor musunuz?`)) return;

     setIsRecalcModalOpen(false);
     handleBulkRecalculate(recalcTypes);
  };

  const handleBulkRecalculate = async (types: string[]) => {
     setIsRecalculating(true);
     setMessage("");
     try {
       const res = await fetch("/api/system-config/bulk-recalculate", { 
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ types }) 
       });
       const data = await res.json();
       if(res.ok) {
         setMessage(`Başarılı! Toplam ${data.count} ürünün fiyatı güncellendi.`);
       } else {
         setMessage("Hesaplama sırasında bir hata oluştu.");
       }
     } catch(err) {
       setMessage("Sunucu hatası.");
     } finally {
       setIsRecalculating(false);
       setRecalcTypes([]);
     }
  };
   const filteredMatrixProducts = allProducts.filter(p => 
      p.name?.toLowerCase().includes(searchMatrixProduct.toLowerCase()) || 
      p.code?.toLowerCase().includes(searchMatrixProduct.toLowerCase())
   );

   if(isLoading) return <div className="p-8">Yükleniyor...</div>;

   return (
     <>
     <div className="w-full max-w-2xl mx-auto mt-10">
       <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
           <h2 className="text-xl font-bold flex items-center text-slate-800">
              <span className="mr-2">⚙️</span> Yönetim Paneli - Fiyat Yerleştirme
           </h2>
           <p className="text-sm text-slate-500 mt-1">Bu ayarlar, ürünlerdeki fiyat formüllerini (GBP/EURO hesaplamalarını) etkiler.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
           {message && (
             <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${message.includes("başarıyla") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
               {message}
             </div>
           )}

           {/* 1. Hesaplama Temeli */}
           <div className="mb-6">
              <label className="block text-lg font-bold text-slate-700 mb-2 border-b pb-2">Lütfen Hesaplama Temelini Seçin</label>
              <div className="max-w-xs">
                 <select value={config.baseTier || "T2"} onChange={e => setConfig({...config, baseTier: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 text-lg">
                    <option value="T1">T1 - (500 - 1K)</option>
                    <option value="T2">T2 - (1K - 5K)</option>
                    <option value="T3">T3 - (5K - 10K)</option>
                 </select>
              </div>
           </div>

           {/* 2. Döviz Kurları */}
           <div className="mb-8">
              <label className="block text-lg font-bold text-slate-700 mb-2 border-b pb-2">Lütfen Döviz Kurlarını Giriniz</label>
              <div className="flex gap-4">
                 <div className="w-32">
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">GBP / USD</label>
                    <input type="number" step="any" value={config.usdToGbpRate || ""} onChange={e => setConfig({...config, usdToGbpRate: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="w-32">
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">EUR / USD</label>
                    <input type="number" step="any" value={config.usdToEurRate || ""} onChange={e => setConfig({...config, usdToEurRate: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="w-32">
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">USD / TRY</label>
                    <input type="number" step="any" value={config.usdToTryRate || ""} onChange={e => setConfig({...config, usdToTryRate: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
              </div>
           </div>

           {/* 3. Navlun */}
           <div className="mb-8">
              <div className="flex items-center gap-4 mb-2 border-b pb-2">
                 <label className="block text-lg font-bold text-slate-700">Lütfen Navlun Bedelini Giriniz</label>
                 <span className="text-xs text-slate-400">Manuel</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-semibold">Fiyatlar navlun Bedeli Girilirse CIF, Girilmez ise FOB kalacaktır.</p>
              <div className="grid grid-cols-4 gap-4 max-w-2xl">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">USD</label>
                    <input type="number" step="any" value={config.usdFreight || ""} onChange={e => setConfig({...config, usdFreight: e.target.value})} className="w-full text-center bg-slate-100 border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" disabled placeholder="-" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">GBP</label>
                    <input type="number" step="any" value={config.gbpFreight !== undefined ? config.gbpFreight : ""} onChange={e => setConfig({...config, gbpFreight: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">EUR</label>
                    <input type="number" step="any" value={config.eurFreight !== undefined ? config.eurFreight : ""} onChange={e => setConfig({...config, eurFreight: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">TL</label>
                    <input type="number" step="any" value={config.tryFreight || ""} onChange={e => setConfig({...config, tryFreight: e.target.value})} className="w-full text-center bg-slate-100 border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" disabled placeholder="-" />
                 </div>
              </div>
           </div>

           {/* 4. Satış Komisyonu */}
           <div className="mb-8">
              <div className="flex items-center gap-4 mb-2 border-b pb-2">
                 <label className="block text-lg font-bold text-slate-700">Lütfen Satış Komisyonu Giriniz</label>
                 <span className="text-xs text-slate-400">Manuel</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-semibold">Satış Komisyonu Girilirse CIF(IC) olacaktır Fiyat</p>
              <div className="grid grid-cols-4 gap-4 max-w-2xl">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">USD</label>
                    <div className="relative">
                       <input type="number" step="any" value={config.usdCommission || ""} onChange={e => setConfig({...config, usdCommission: e.target.value})} className="w-full text-center bg-slate-100 border border-slate-300 rounded px-2 py-1 outline-none" disabled />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">GBP</label>
                    <div className="relative">
                       <input type="number" step="any" value={config.gbpCommission !== undefined ? config.gbpCommission : ""} onChange={e => setConfig({...config, gbpCommission: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">EUR</label>
                    <div className="relative">
                       <input type="number" step="any" value={config.eurCommission !== undefined ? config.eurCommission : ""} onChange={e => setConfig({...config, eurCommission: e.target.value})} className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500" />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 text-center mb-1">TL</label>
                    <div className="relative">
                       <input type="number" step="any" value={config.tryCommission || ""} onChange={e => setConfig({...config, tryCommission: e.target.value})} className="w-full text-center bg-slate-100 border border-slate-300 rounded px-2 py-1 outline-none" disabled />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-8 mb-8 bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm text-sm text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                 <strong className="text-slate-800">Uygulanan Formül (Para Birimine Özel):</strong> <br/>
                 <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block mt-2 border border-emerald-100 font-mono">
                    ( ({config.baseTier || "T2"} USD Fiyatı / İlgili Kur) * (1 + İlgili Komisyon %) ) + İlgili Navlun
                 </code>
              </div>
           </div>

           <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-end items-center gap-4">
              <button disabled={isSaving} type="submit" className="w-full md:w-auto px-8 py-3 bg-slate-600 text-white font-bold rounded shadow hover:bg-slate-700 transition-all disabled:bg-slate-400">
                 {isSaving ? "KAYDEDİLİYOR..." : "AYARLARI KAYDET"}
              </button>
              <button 
                 type="button" 
                 onClick={() => setIsRecalcModalOpen(true)}
                 disabled={isRecalculating}
                 className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition disabled:bg-red-300"
              >
                 {isRecalculating ? "HESAPLANIYOR..." : "HEMEN YERLEŞTİR."}
              </button>
           </div>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
         <div className="bg-blue-50 px-6 py-4 border-b border-blue-200 flex flex-col md:flex-row md:items-center justify-between">
            <div>
               <h2 className="text-lg font-bold text-blue-900 flex items-center">
                  <span className="mr-2">🧮</span> Hızlı Fiyat Matrisi
               </h2>
               <p className="text-xs text-blue-700 mt-1">Bu kısım özel hesaplama alanıdır genel güncellemeyi etkilemez.</p>
            </div>
         </div>
         <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200">
               <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Lütfen Hesaplama Temelini Giriniz <span className="text-xs font-normal text-slate-400">| Manuel</span></h3>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 text-center">T1</label>
                        <div className="relative">
                           <input type="number" value={t1Percent} onChange={e => setT1Percent(e.target.value)} className="w-full text-center border border-slate-300 rounded px-2 py-1.5 font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                           <span className="absolute right-2 top-1.5 text-slate-400 font-bold">%</span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 text-center">T2</label>
                        <div className="relative">
                           <input type="number" value={t2Percent} onChange={e => setT2Percent(e.target.value)} className="w-full text-center border border-slate-300 rounded px-2 py-1.5 font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                           <span className="absolute right-2 top-1.5 text-slate-400 font-bold">%</span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 text-center">T3</label>
                        <div className="relative">
                           <input type="number" value={t3Percent} onChange={e => setT3Percent(e.target.value)} className="w-full text-center border border-slate-300 rounded px-2 py-1.5 font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                           <span className="absolute right-2 top-1.5 text-slate-400 font-bold">%</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Lütfen Maliyet veya T3 Fiyatı Giriniz <span className="text-xs font-normal text-slate-400">| Manuel</span></h3>
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 text-center">Maliyet</label>
                        <input type="number" step="any" value={displayCost} onChange={e => {setCalcMode("COST"); setRawInput(e.target.value);}} className={`w-full text-center border ${calcMode === "COST" ? "border-rose-400 bg-rose-50 ring-1 ring-rose-300" : "border-slate-300 text-slate-500 bg-slate-50/50"} rounded px-2 py-1.5 font-bold outline-none transition-all`} />
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 text-center">T3</label>
                        <input type="number" step="any" value={displayT3} onChange={e => {setCalcMode("T3"); setRawInput(e.target.value);}} className={`w-full text-center border ${calcMode === "T3" ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300" : "border-slate-300 text-slate-500 bg-slate-50/50"} rounded px-2 py-1.5 font-bold outline-none transition-all`} />
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-slate-600 mb-6 border border-slate-200">
                  <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                     <tr>
                        <th className="px-4 py-3 border-r border-slate-200">Katman</th>
                        <th className="px-4 py-3 bg-slate-100 border-r border-slate-200 text-center">USD (FOB)</th>
                        <th className="px-4 py-3 bg-slate-100 border-r border-slate-200 text-center">TL (FOB)</th>
                        <th className="px-4 py-3 text-emerald-700 bg-emerald-50/50 border-r border-emerald-100 text-center">
                           GBP ({(config?.gbpCommission && config.gbpCommission > 0) ? "CIF-IC" : ((config?.gbpFreight && config.gbpFreight > 0) ? "CIF" : "FOB")})
                        </th>
                        <th className="px-4 py-3 text-blue-700 bg-blue-50/50 text-center">
                           EUR ({(config?.eurCommission && config.eurCommission > 0) ? "CIF-IC" : ((config?.eurFreight && config.eurFreight > 0) ? "CIF" : "FOB")})
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200 font-bold text-slate-700 flex flex-col items-start leading-tight">
                           <span>T1</span>
                           <span className="text-[10px] text-slate-400 font-normal">(M×{1 + (parseFloat(t1Percent) || 0) / 100})</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold bg-slate-50 border-r border-slate-200 text-center">{getRowData(t1Percent).usd}</td>
                        <td className="px-4 py-3 font-mono bg-slate-50 border-r border-slate-200 text-center">{getRowData(t1Percent).tl} ₺</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700 bg-emerald-50/50 border-r border-emerald-100 text-center">{getRowData(t1Percent).gbp} £</td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 bg-blue-50/50 text-center">{getRowData(t1Percent).eur} €</td>
                     </tr>
                     <tr className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200 font-bold text-slate-700 flex flex-col items-start leading-tight">
                           <span>T2</span>
                           <span className="text-[10px] text-slate-400 font-normal">(M×{1 + (parseFloat(t2Percent) || 0) / 100})</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold bg-slate-50 border-r border-slate-200 text-center">{getRowData(t2Percent).usd}</td>
                        <td className="px-4 py-3 font-mono bg-slate-50 border-r border-slate-200 text-center">{getRowData(t2Percent).tl} ₺</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700 bg-emerald-50/50 border-r border-emerald-100 text-center">{getRowData(t2Percent).gbp} £</td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 bg-blue-50/50 text-center">{getRowData(t2Percent).eur} €</td>
                     </tr>
                     <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 border-r border-slate-200 font-bold text-slate-700 flex flex-col items-start leading-tight">
                           <span>T3</span>
                           <span className="text-[10px] text-slate-400 font-normal">(M×{1 + (parseFloat(t3Percent) || 0) / 100})</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold bg-slate-50 border-r border-slate-200 text-center">{getRowData(t3Percent).usd}</td>
                        <td className="px-4 py-3 font-mono bg-slate-50 border-r border-slate-200 text-center">{getRowData(t3Percent).tl} ₺</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700 bg-emerald-50/50 border-r border-emerald-100 text-center">{getRowData(t3Percent).gbp} £</td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-700 bg-blue-50/50 text-center">{getRowData(t3Percent).eur} €</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Ürün Seç ve Uygula */}
            <div className="bg-slate-100/50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-end gap-4">
               <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                     <label className="block text-xs font-bold text-slate-500">🔍 Ürün Seçimi (Çoklu Seçim Yapabilirsiniz)</label>
                     <span className="text-xs font-bold text-red-500">{selectedProductIds.length} Ürün Seçildi</span>
                  </div>
                  <input 
                     type="text" 
                     placeholder="Aramak için Kodu veya Adı yazın..." 
                     value={searchMatrixProduct}
                     onChange={e => setSearchMatrixProduct(e.target.value)}
                     className="w-full border border-slate-300 rounded-t px-3 py-2 text-slate-700 text-sm font-semibold outline-none focus:bg-white bg-slate-50 transition-colors"
                  />
                  <div className="w-full border border-t-0 border-slate-300 rounded-b bg-white overflow-y-auto" style={{ maxHeight: '200px' }}>
                     {filteredMatrixProducts.length === 0 ? (
                        <div className="p-3 text-sm text-slate-400 italic text-center">Eşleşen ürün bulunamadı.</div>
                     ) : (
                        filteredMatrixProducts.map(p => (
                           <label key={p.id} className="flex items-center px-3 py-2 border-b border-slate-50 hover:bg-blue-50 cursor-pointer transition-colors">
                              <input 
                                 type="checkbox" 
                                 checked={selectedProductIds.includes(p.id)} 
                                 onChange={e => {
                                    if(e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                    else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                                 }} 
                                 className="mr-3 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                              />
                              <span className="text-sm font-semibold text-slate-700 select-none">
                                 {p.code ? <span className="text-slate-500 mr-1">{p.code} -</span> : ''}{p.name}
                              </span>
                           </label>
                        ))
                     )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">* Arama kısmını kullanarak filtreleme yapabilir, listeden yanındaki kutucukları işaretleyerek çoklu ürün seçebilirsiniz.</p>
               </div>
               <button 
                  type="button"
                  onClick={handleApplyMatrix}
                  disabled={isApplying || selectedProductIds.length === 0}
                  className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition disabled:bg-slate-300 disabled:text-slate-500 flex-shrink-0 uppercase"
               >
                  {isApplying ? "İşleniyor..." : "Seçilenlere Yerleştir."}
               </button>
            </div>
         </div>
      </div>
    </div>

       {isRecalcModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-slate-800">Cins Seçimi</h3>
                <button onClick={() => setIsRecalcModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-200 hover:bg-slate-300 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                   ✖
                </button>
              </div>
              <div className="p-6">
                 <p className="text-sm text-slate-500 mb-4 font-semibold">Sadece seçtiğiniz cinslerdeki ürünlerin fiyatlarını güncelleyebilirsiniz. İşleme devam etmek için lütfen en az 1 cins seçin.</p>
                 <div className="flex flex-wrap gap-3 mb-6">
                    {[
                       { label: "DOKUMA", val: "W" },
                       { label: "ÖRME", val: "K" },
                       { label: "İPLİK", val: "Y" },
                       { label: "MAMÜL", val: "FP" },
                       { label: "PFD", val: "PFD" },
                       { label: "HAM", val: "GR" },
                       { label: "BASKILI", val: "PRT" }
                    ].map(type => (
                       <label key={type.val} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition border ${recalcTypes.includes(type.val) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                          <input 
                             type="checkbox" 
                             checked={recalcTypes.includes(type.val)}
                             onChange={(e) => {
                                if(e.target.checked) setRecalcTypes([...recalcTypes, type.val]);
                                else setRecalcTypes(recalcTypes.filter(t => t !== type.val));
                             }}
                             className="rounded border-slate-300 text-blue-500 focus:ring-indigo-600 w-4 h-4"
                          />
                          <span className={`text-xs font-bold ${recalcTypes.includes(type.val) ? 'text-indigo-800' : 'text-slate-500'}`}>{type.label} ({type.val})</span>
                       </label>
                    ))}
                 </div>
                 <div className="flex justify-end border-t border-slate-100 pt-5">
                    <button 
                       type="button" 
                       onClick={triggerRecalculate}
                       className="px-8 py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition"
                    >
                       UYGULA VE HESAPLA
                    </button>
                 </div>
              </div>
           </div>
         </div>
       )}
     </>
  );
}
