"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function InvoiceFormClient({ orders, buyer, logisticsCompanies, customsCompanies, insuranceCompanies, initialData, isEdit }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<number, string>>({});

  // Initialize state with all items checked and default quantities
  const [itemsState, setItemsState] = useState<Record<number, any>>(() => {
    const initialState: Record<number, any> = {};
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const existingInvItem = initialData?.items?.find((ii: any) => ii.orderItemId === item.id);
        
        initialState[item.id] = {
          selected: initialData ? !!existingInvItem : true,
          quantity: existingInvItem ? existingInvItem.quantity : item.quantity,
          unitPrice: existingInvItem ? existingInvItem.unitPrice : item.unitPrice,
          rolls: existingInvItem ? existingInvItem.rolls : [],
          gtipNo: item.gtipNo || "",
          typeOfGoods: item.typeOfGoods || ""
        };
      });
    });
    return initialState;
  });

  const handleCheckbox = (itemId: number) => {
    setItemsState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], selected: !prev[itemId].selected }
    }));
  };

  const handleGtip = (itemId: number, val: string) => {
    setItemsState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], gtipNo: val }
    }));
  };

  const handleTypeOfGoods = (itemId: number, val: string) => {
    setItemsState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], typeOfGoods: val }
    }));
  };

  const handleQuantity = (itemId: number, val: string) => {
    const qty = parseFloat(val) || 0;
    setItemsState(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: qty }
    }));
  };

  const [meta, setMeta] = useState({
    invoiceNo: initialData?.invoiceNo || "",
    invoiceDate: initialData?.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    grossKg: initialData?.grossKg?.toString() || "",
    netKg: initialData?.netKg?.toString() || "",
    rollCount: initialData?.rollCount?.toString() || "",
    sackCount: initialData?.sackCount?.toString() || "",
    logisticsCompanyId: initialData?.logisticsCompanyId?.toString() || "",
    customsCompanyId: initialData?.customsCompanyId?.toString() || "",
    insuranceCompanyId: initialData?.insuranceCompanyId?.toString() || ""
  });

  const aggregateRollsAndSyncMeta = (newState: Record<number, any>) => {
    let tGross = 0;
    let tNet = 0;
    let tRolls = 0;

    Object.values(newState).forEach(s => {
      if (s.rolls && s.rolls.length > 0) {
        tRolls += s.rolls.length;
        tGross += s.rolls.reduce((sum: number, r: any) => sum + r.grossKg, 0);
        tNet += s.rolls.reduce((sum: number, r: any) => sum + r.netKg, 0);
      }
    });

    if (tRolls > 0) {
      setMeta(prev => ({
        ...prev,
        grossKg: tGross.toFixed(2),
        netKg: tNet.toFixed(2),
        rollCount: tRolls.toString()
      }));
    }
  };

  const handleFileUpload = (itemId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileErrors(prev => ({ ...prev, [itemId]: "" }));
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws);
        
        const parsedRolls = data.reduce((acc: any[], row: any, index: number) => {
          // Eğer satır verilerinden herhangi birinde toplam ifadesi geçiyorsa bu satırı atla
          const isTotalRow = Object.values(row).some(v => 
            typeof v === 'string' && (v.toLowerCase().includes('toplam') || v.toLowerCase().includes('total') || v.toLowerCase().includes('genel'))
          );
          if (isTotalRow) return acc;
          const getVal = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => k && keys.some(search => k.toLowerCase().trim().includes(search.toLowerCase())));
            return foundKey ? row[foundKey] : null;
          };

          const rawNetKg = parseFloat(getVal(['kilo', 'net', 'kg'])?.toString().replace(',','.') || "0") || 0;
          const grossKg = rawNetKg > 0 ? rawNetKg + 0.50 : 0;
          const rawQuantity = parseFloat(getVal(['metre', 'metraj', 'quantity', 'miktar', 'adet', 'uzunluk'])?.toString().replace(',','.') || "0") || 0;

          acc.push({
            id: `temp-${index}`,
            rollNo: getVal(['top', 'cuval', 'no', 'sıra', 'roll', 'kutu'])?.toString() || (index + 1).toString(),
            barcode: getVal(['barno', 'barkod', 'barcode', 'lot', 'parti'])?.toString() || "-",
            quantity: rawQuantity,
            grossKg: grossKg,
            netKg: rawNetKg,
            lotNo: getVal(['parti', 'lot'])?.toString() || "",
          });
          return acc;
        }, []);

        const validRolls = parsedRolls.filter(r => r.quantity > 0 || r.grossKg > 0);
        
        if (validRolls.length === 0) {
          setFileErrors(prev => ({ ...prev, [itemId]: "Hata: Top/KG sütunları bulunamadı." }));
        } else {
          const totalQty = validRolls.reduce((sum, r) => sum + r.quantity, 0);
          
          setItemsState(prev => {
            const nextState = {
              ...prev,
              [itemId]: {
                ...prev[itemId],
                rolls: validRolls,
                quantity: totalQty
              }
            };
            aggregateRollsAndSyncMeta(nextState);
            return nextState;
          });
        }
      } catch (err) {
        setFileErrors(prev => ({ ...prev, [itemId]: "Okuma hatası." }));
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const selectedItems = [];
    for (const order of orders) {
      for (const item of order.items) {
        const state = itemsState[item.id];
        if (state && state.selected && state.quantity > 0) {
          selectedItems.push({
            orderItemId: item.id,
            gtipNo: state.gtipNo,
            typeOfGoods: state.typeOfGoods,
            quantity: state.quantity,
            unitPrice: state.unitPrice,
            totalAmount: state.quantity * state.unitPrice,
            rolls: state.rolls || []
          });
        }
      }
    }

    if (selectedItems.length === 0) {
      alert("Lütfen faturaya eklenecek en az bir kalem seçin.");
      setLoading(false);
      return;
    }

    for (const s of selectedItems) {
      if (s.gtipNo && s.gtipNo.length > 0 && s.gtipNo.length < 8) {
        alert("Hata: Girilen GTİP NO en az 8 haneli olmalıdır.");
        setLoading(false);
        return;
      }
    }

    try {
      const url = isEdit ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: buyer.id,
          items: selectedItems,
          ...meta
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/invoices/${data.id}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Hata: ${errorData.error || 'Bilinmeyen bir hata oluştu!'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Sistemsel hata!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Gümrük & Nakliye Detayları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fatura & Çeki No</label>
            <input type="text" value={meta.invoiceNo} onChange={e => setMeta({...meta, invoiceNo: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="#INV-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tarih</label>
            <input type="date" value={meta.invoiceDate} onChange={e => setMeta({...meta, invoiceDate: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nakliyeci</label>
            <select value={meta.logisticsCompanyId} onChange={e => setMeta({...meta, logisticsCompanyId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Seçiniz...</option>
              {logisticsCompanies?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gümrük Firması</label>
            <select value={meta.customsCompanyId} onChange={e => setMeta({...meta, customsCompanyId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Seçiniz...</option>
              {customsCompanies?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sigorta Firması</label>
            <select value={meta.insuranceCompanyId} onChange={e => setMeta({...meta, insuranceCompanyId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Seçiniz...</option>
              {insuranceCompanies?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Sipariş Kalemleri</h2>
        <p className="text-sm text-slate-500 mb-6">Lütfen faturaya eklemek istediğiniz kalemleri işaretleyin ve sevk edilecek miktarları girin.</p>
        
        {orders.map((order: any) => (
          <div key={order.id} className="mb-8 border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700">Sipariş #{order.contractNo}</span>
              <span className="text-sm text-slate-500">{new Date(order.contractDate).toLocaleDateString("tr-TR")}</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2 px-4 w-10 text-center">Ekle</th>
                  <th className="py-2 px-4">Kalem (Model / Kalite)</th>
                  <th className="py-2 px-4 w-32 text-center">TYPE OF GOODS</th>
                  <th className="py-2 px-4 w-32 text-center">GTİP NO</th>
                  <th className="py-2 px-4 w-32 text-center">Çeki Listesi</th>
                  <th className="py-2 px-4 text-right">Sipariş Mik.</th>
                  <th className="py-2 px-4 text-right w-40">Faturaya Eklenecek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item: any) => {
                  const iState = itemsState[item.id] || {};
                  const rollsCount = iState.rolls?.length || 0;
                  
                  return (
                    <tr key={item.id} className={!iState.selected ? "bg-slate-50 opacity-50 transition-opacity" : "transition-opacity"}>
                      <td className="py-2 px-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300" 
                          checked={iState.selected || false}
                          onChange={() => handleCheckbox(item.id)}
                        />
                      </td>
                      <td className="py-2 px-4">
                        <div className="font-semibold text-slate-800">{item.buyerModelName || 'Model Yok'}</div>
                        <div className="text-xs text-slate-500">{item.qualityName || 'Kalite Yok'}</div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="text"
                          value={iState.typeOfGoods || ""}
                          onChange={(e) => handleTypeOfGoods(item.id, e.target.value)}
                          disabled={!iState.selected}
                          placeholder="Örn: WOVEN FAB."
                          className="w-full text-center p-1.5 border border-slate-200 rounded text-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="text"
                          value={iState.gtipNo || ""}
                          onChange={(e) => handleGtip(item.id, e.target.value)}
                          disabled={!iState.selected}
                          placeholder="Örn: 1223.45.67"
                          className="w-full text-center p-1.5 border border-slate-200 rounded text-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <label className={`cursor-pointer ${rollsCount > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"} border px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 text-[11px] shadow-sm whitespace-nowrap`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            {rollsCount > 0 ? "Yeniden Yükle" : "Excel Yükle"}
                            <input type="file" accept=".xlsx, .xls" className="hidden" disabled={!iState.selected} onChange={(e) => handleFileUpload(item.id, e)} />
                          </label>
                          {rollsCount > 0 && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-1.5 rounded-full">{rollsCount} Top/Kutu</span>}
                          {fileErrors[item.id] && <span className="text-[10px] text-red-600 font-bold max-w-[120px] text-center">{fileErrors[item.id]}</span>}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right font-mono text-slate-600">
                        {item.quantity.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-4">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={iState.quantity || 0} 
                            onChange={(e) => handleQuantity(item.id, e.target.value)}
                            disabled={!iState.selected}
                            className={`w-full text-right p-1.5 border ${rollsCount > 0 ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200"} rounded text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        
        <div className="flex justify-end mt-8">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Faturayı ve Çeki Listesini Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
