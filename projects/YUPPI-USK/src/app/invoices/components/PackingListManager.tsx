"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

export default function PackingListManager({ invoiceId }: { invoiceId: number }) {
  const router = useRouter();
  const [rolls, setRolls] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of objects
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Try to map to standard Roll structure based on common Turkish textile headers
        const parsedRolls = data.map((row: any, index: number) => {
          // Flexible key matching
          const getVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => k && keys.some(search => k.toLowerCase().trim().includes(search.toLowerCase())));
            return foundKey ? row[foundKey] : null;
          };

          const rawNetKg = parseFloat(getVal(['kilo', 'net', 'kg'])?.toString().replace(',','.') || "0") || 0;
          const grossKg = rawNetKg > 0 ? rawNetKg + 0.50 : 0; // Default +500g tare per roll
          const rawQuantity = parseFloat(getVal(['metre', 'metraj', 'quantity', 'miktar', 'adet', 'uzunluk'])?.toString().replace(',','.') || "0") || 0;

          return {
            id: `temp-${index}`,
            rollNo: getVal(['top', 'cuval', 'no', 'sıra', 'roll', 'kutu'])?.toString() || (index + 1).toString(),
            barcode: getVal(['barno', 'barkod', 'barcode', 'lot', 'parti'])?.toString() || "-",
            quantity: rawQuantity,
            grossKg: grossKg,
            netKg: rawNetKg,
            lotNo: getVal(['parti', 'lot'])?.toString() || "",
          };
        });

        // Filter out completely empty rows
        const validRolls = parsedRolls.filter(r => r.quantity > 0 || r.grossKg > 0);
        
        if (validRolls.length === 0) {
          setError("Yüklenen Excel dosyasında geçerli bir veri bulunamadı. Lütfen sütun başlıklarını kontrol edin (örn: 'Top No', 'Metraj', 'Brüt Kg').");
        } else {
          setRolls(validRolls);
        }
      } catch (err) {
        console.error(err);
        setError("Excel dosyası okunurken bir hata oluştu.");
      }
    };
    
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    if (rolls.length === 0) return;
    setIsUploading(true);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/packing-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolls })
      });

      if (!response.ok) throw new Error("Kayıt başarısız");

      alert("Çeki Listesi başarıyla kaydedildi!");
      router.refresh();
      // Reset after save
      setRolls([]);
    } catch (err) {
      console.error(err);
      setError("Sunucuya kaydedilirken hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Çeki Listesi Yükleme (Paket/Top Detayları)</h2>
          <p className="text-sm text-slate-500 mt-1">İşletmeden gelen Excel dosyasını seçerek otomatik aktarım yapın.</p>
        </div>
        
        <div>
          <label className="cursor-pointer bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Excel Yükle
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {rolls.length > 0 && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 flex gap-6 text-sm font-medium">
            <div className="text-slate-600">Toplam Top/Kutu: <span className="text-slate-900 font-bold">{rolls.length}</span></div>
            <div className="text-slate-600">Toplam Miktar: <span className="text-slate-900 font-bold">{rolls.reduce((sum, r) => sum + r.quantity, 0).toLocaleString()}</span></div>
            <div className="text-slate-600">Toplam Brüt: <span className="text-slate-900 font-bold">{rolls.reduce((sum, r) => sum + r.grossKg, 0).toLocaleString()} KG</span></div>
            <div className="text-slate-600">Toplam Net: <span className="text-slate-900 font-bold">{rolls.reduce((sum, r) => sum + r.netKg, 0).toLocaleString()} KG</span></div>
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="py-2 px-4 font-semibold text-slate-700">Top/Sıra No</th>
                  <th className="py-2 px-4 font-semibold text-slate-700">Barkod</th>
                  <th className="py-2 px-4 font-semibold text-slate-700 text-right">Metraj/Adet</th>
                  <th className="py-2 px-4 font-semibold text-slate-700 text-right">Brüt (KG)</th>
                  <th className="py-2 px-4 font-semibold text-slate-700 text-right">Net (KG)</th>
                  <th className="py-2 px-4 font-semibold text-slate-700">Parti/Lot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolls.map((roll, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-4">{roll.rollNo}</td>
                    <td className="py-2 px-4 font-mono text-slate-600">{roll.barcode}</td>
                    <td className="py-2 px-4 text-right font-medium">{roll.quantity}</td>
                    <td className="py-2 px-4 text-right">{roll.grossKg}</td>
                    <td className="py-2 px-4 text-right">{roll.netKg}</td>
                    <td className="py-2 px-4">{roll.lotNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isUploading ? "Kaydediliyor..." : "Çeki Listesini Faturaya Ekle"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
