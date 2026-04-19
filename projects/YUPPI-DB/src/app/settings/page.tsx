"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    commissionRate: 1.05,
    freightCost: 0.20,
    usdToGbpRate: 1.25,
    usdToEurRate: 1.08,
    baseTier: "T2"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/system-config")
      .then(res => res.json())
      .then(data => {
         if(data.data) {
            setConfig(data.data);
         }
         setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

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

  const handleBulkRecalculate = async () => {
     if(!window.confirm("Bütün ürünlerin GBP ve EURO fiyatları şu anki ayarlarınıza göre sil baştan hesaplanacak. Onaylıyor musunuz?")) return;
     
     setIsRecalculating(true);
     setMessage("");
     try {
       const res = await fetch("/api/system-config/bulk-recalculate", { method: "POST" });
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
     }
  };

  if(isLoading) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
           <h2 className="text-xl font-bold flex items-center text-slate-800">
              <span className="mr-2">⚙️</span> Yönetim Paneli - Sistem Ayarları
           </h2>
           <p className="text-sm text-slate-500 mt-1">Bu ayarlar, ürünlerdeki fiyat formüllerini (GBP/EURO hesaplamalarını) etkiler.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
           {message && (
             <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${message.includes("başarıyla") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
               {message}
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 col-span-1 md:col-span-2 lg:col-span-3">
                 <label className="block text-sm font-bold text-slate-700 mb-1">Hesaplama Temeli (Hangi Fiyattan Hesaplansın?)</label>
                 <select value={config.baseTier} onChange={e => setConfig({...config, baseTier: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700">
                    <option value="T1">T1 (500-1K) Fiyatından Hesapla</option>
                    <option value="T2">T2 (1K-5K) Fiyatından Hesapla</option>
                    <option value="T3">T3 (5K-10K) Fiyatından Hesapla</option>
                 </select>
                 <p className="text-xs text-emerald-700 mt-1 font-medium">Bu seçim, ürün ekleme ekranında otomatik kur hesaplamasının hangi kutuya göre baz alınacağını belirler.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <label className="block text-sm font-bold text-slate-700 mb-1">Komisyon Çarpanı (Varsayılan: 1.05)</label>
                 <input type="number" step="0.01" value={config.commissionRate} onChange={e => setConfig({...config, commissionRate: parseFloat(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <label className="block text-sm font-bold text-slate-700 mb-1">Navlun Ücreti ($) (Varsayılan: 0.20)</label>
                 <input type="number" step="0.01" value={config.freightCost} onChange={e => setConfig({...config, freightCost: parseFloat(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                 <label className="block text-sm font-bold text-slate-700 mb-1">USD / GBP Kuru</label>
                 <input type="number" step="0.0001" value={config.usdToGbpRate} onChange={e => setConfig({...config, usdToGbpRate: parseFloat(e.target.value)})} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
                 <p className="text-xs text-blue-600 mt-1 font-medium">Örn: 1.25 ise GBP hesabı ona bölünür.</p>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                 <label className="block text-sm font-bold text-slate-700 mb-1">USD / EURO Kuru</label>
                 <input type="number" step="0.0001" value={config.usdToEurRate} onChange={e => setConfig({...config, usdToEurRate: parseFloat(e.target.value)})} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" required />
                 <p className="text-xs text-blue-600 mt-1 font-medium">Örn: 1.08 ise EUR hesabı ona bölünür.</p>
              </div>
           </div>

           <div className="border-t border-slate-200 pt-5 flex justify-end">
              <button disabled={isSaving} type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-md disabled:bg-slate-400">
                 {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>
           </div>
        </form>
      </div>
      
      <div className="mt-6 bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm text-sm text-slate-600 flex flex-col md:flex-row justify-between items-start md:items-center">
         <div>
            <strong className="text-slate-800">Uygulanan Formül:</strong> <br/>
            <code className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block mt-2 border border-emerald-100 font-mono">
               (({config.baseTier} Fiyatı * Komisyon Çarpanı) + Navlun) / Kur
            </code>
         </div>
         <div className="mt-4 md:mt-0 text-right">
            <p className="text-xs text-rose-600 font-bold mb-2">Mevcut tüm ürünlere bu ayarları uygula:</p>
            <button 
               type="button" 
               onClick={handleBulkRecalculate}
               disabled={isRecalculating}
               className="px-4 py-2 bg-rose-600 text-white font-bold rounded shadow hover:bg-rose-700 transition disabled:bg-rose-300"
            >
               {isRecalculating ? "Hesaplanıyor..." : "Tüm Fiyatları Yeniden Hesapla"}
            </button>
         </div>
      </div>
    </div>
  );
}
