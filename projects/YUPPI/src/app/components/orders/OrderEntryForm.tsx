"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DELIVERY_TERMS_INFO: Record<string, { market: string, desc: string }> = {
  "EXW - FABRİKA TESLİM|EXW - EX WORKS": { market: "İç ve Dış Piyasa", desc: "Tüm masraf ve risk alıcıya aittir." },
  "FCA - TAŞIYICIYA TESLİM|FCA - FREE CARRIER": { market: "İç ve Dış Piyasa", desc: "Mal ambar veya nakliyeciye teslim edilir." },
  "FOB - GEMİDE TESLİM|FOB - FREE ON BOARD": { market: "Dış Piyasa", desc: "Limanda yükleme yapılana kadar risk sende." },
  "CPT - TAŞIMA ÖDENMİŞ (FRANCO)|CPT - CARRIAGE PAID TO": { market: "İç ve Dış Piyasa", desc: "Nakliyeyi sen ödersin ama risk alıcıda kalır." },
  "DAP - ADRESTE TESLİM|DAP - DELIVERED AT PLACE": { market: "Dış Piyasa", desc: "Malı müşterinin kapısına kadar sen götürürsün." },
  "CIF - SİGORTA & NAKLİYE DAHİL|CIF - COST, INSURANCE & FREIGHT": { market: "Dış Piyasa", desc: "Mal bedeli + Nakliye + Sigorta senin tarafında." }
};

export default function OrderEntryForm({ companies, brands, representatives, initialData }: any) {
  const router = useRouter();
  
  const [formData, setFormData] = useState(initialData || {
    contractDate: new Date().toISOString().split('T')[0],
    buyerPoNo: "",
    sellerId: "",
    buyerId: "",
    shipToId: "",
    brandId: "",
    sellerRepId: "",
    buyerRepId: "",
    deliveryTerms: "",
    paymentTerms: "",
    transporter: "",
    currency: "USD",
    language: "TR",
    tolerance: "5%",
    labDipRequest: false,
    labDipDetail: "",
    preProductionRequest: false,
    preProductionDetail: "",
    specialDocsRequest: false,
    specialDocsDetail: "",
    specialLoadingRequest: false,
    specialLoadingDetail: "",
    
    // Production details
    exMillDate: "",
    bulkDate: "",
    packingInstructions: "",
    fabricDirection: "",
    partialShipmentAllowed: false,
    
    // Invoice details
    invoiceNo: "",
    invoiceDate: "",
    grossKg: "",
    netKg: "",
    rollCount: "",
    sackCount: "",
  });

  // Ensure dates from DB are properly formatted for inputs if editing
  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...prev,
        // Parse Dates
        contractDate: initialData.contractDate ? new Date(initialData.contractDate).toISOString().split('T')[0] : prev.contractDate,
        tolerance: initialData.tolerance || "5%",
        exMillDate: initialData.productionOrder?.exMillDate ? new Date(initialData.productionOrder.exMillDate).toISOString().split('T')[0] : prev.exMillDate,
        bulkDate: initialData.productionOrder?.bulkDate ? new Date(initialData.productionOrder.bulkDate).toISOString().split('T')[0] : prev.bulkDate,
        invoiceDate: initialData.invoice?.invoiceDate ? new Date(initialData.invoice.invoiceDate).toISOString().split('T')[0] : prev.invoiceDate,
        language: initialData.language || "TR",
        
        // Production Order
        packingInstructions: initialData.productionOrder?.packingInstructions || "",
        fabricDirection: initialData.productionOrder?.fabricDirection || "",
        partialShipmentAllowed: initialData.productionOrder?.partialShipmentAllowed || false,
        
        // Invoice
        invoiceNo: initialData.invoice?.invoiceNo || "",
        grossKg: initialData.invoice?.grossKg?.toString() || "",
        netKg: initialData.invoice?.netKg?.toString() || "",
        rollCount: initialData.invoice?.rollCount?.toString() || "",
        sackCount: initialData.invoice?.sackCount?.toString() || "",
      }));
    }
  }, [initialData]);

  const [items, setItems] = useState(initialData?.items?.length > 0 ? initialData.items : [{
    buyerModelName: "",
    qualityName: "",
    qualityCode: "",
    colorCode: "",
    composition: "",
    weight: "",
    width: "",
    quantity: "",
    unitPrice: "",
    totalAmount: 0,
    deliveryDate: "",
    bsRequest: false,
    ldRequest: false,
    ldDetail: "",
    ppsRequest: false,
    topsRequest: false,
    srlRequest: false,
    srlDetail: "",
    fdRequest: false,
    pshpRequest: false,
    susRequest: false,
    ltRequest: false,
    ltDetail: "",
    bdd: "",
    bq: "",
    exmd: ""
  }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate total amount
    if (field === 'quantity' || field === 'unitPrice') {
      const gty = field === 'quantity' ? Number(value) : Number(newItems[index].quantity);
      const price = field === 'unitPrice' ? Number(value) : Number(newItems[index].unitPrice);
      newItems[index].totalAmount = gty * price;
    }
    
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, {
      buyerModelName: "",
      qualityName: "",
      qualityCode: "",
      colorCode: "",
      composition: "",
      weight: "",
      width: "",
      quantity: "",
      unitPrice: "",
      totalAmount: 0,
      deliveryDate: "",
      bsRequest: false,
      ldRequest: false,
      ldDetail: "",
      ppsRequest: false,
      topsRequest: false,
      srlRequest: false,
      srlDetail: "",
      fdRequest: false,
      pshpRequest: false,
      susRequest: false,
      ltRequest: false,
      ltDetail: "",
      bdd: "",
      bq: "",
      exmd: ""
    }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_: any, i: number) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isEditing = !!initialData?.id;
      const url = isEditing ? `/api/orders/${initialData.id}` : '/api/orders';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Convert empty dates to null if needed
          sellerId: parseInt(formData.sellerId),
          buyerId: parseInt(formData.buyerId),
          shipToId: formData.shipToId ? parseInt(formData.shipToId) : null,
          brandId: formData.brandId ? parseInt(formData.brandId) : null,
          sellerRepId: formData.sellerRepId ? parseInt(formData.sellerRepId) : null,
          buyerRepId: formData.buyerRepId ? parseInt(formData.buyerRepId) : null,
          tolerance: formData.tolerance || null,
          items: items.map((item: any) => ({
             ...item,
             quantity: Number(item.quantity) || 0,
             unitPrice: Number(item.unitPrice) || 0,
             totalAmount: Number(item.totalAmount) || 0,
             deliveryDate: item.deliveryDate || null
          })),
          productionOrder: {
             exMillDate: formData.exMillDate || null,
             bulkDate: formData.bulkDate || null,
             packingInstructions: formData.packingInstructions || null,
             fabricDirection: formData.fabricDirection || null,
             partialShipmentAllowed: formData.partialShipmentAllowed,
          },
          invoice: {
             invoiceNo: formData.invoiceNo || null,
             invoiceDate: formData.invoiceDate || null,
             grossKg: formData.grossKg ? Number(formData.grossKg) : null,
             netKg: formData.netKg ? Number(formData.netKg) : null,
             rollCount: formData.rollCount ? parseInt(formData.rollCount) : null,
             sackCount: formData.sackCount ? parseInt(formData.sackCount) : null,
          }
        })
      });

      if (response.ok) {
        router.push('/orders');
      } else {
        alert("Sipariş kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error(error);
      alert("Sistem hatası");
    }
  };

  const orderTotal = items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* GENEL BİLGİLER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200">
          Sipariş Genel Bilgileri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tarih <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="contractDate" 
              required
              value={formData.contractDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Alıcı PO No
            </label>
            <input 
              type="text" 
              name="buyerPoNo" 
              value={formData.buyerPoNo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="Eğer Varsa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sözleşme Dili <span className="text-red-500">*</span>
            </label>
            <select 
              name="language" 
              required
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="TR">Türkçe</option>
              <option value="ENG">İngilizce (English)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Satıcı (Seller) <span className="text-red-500">*</span>
                </label>
                 <select 
                  name="sellerId" 
                  required
                  value={formData.sellerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Firma Seç --</option>
                  {companies
                    .filter((c: any) => c.name.toUpperCase().includes('USK'))
                    .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Satıcı Temsilcisi
                </label>
                <select 
                  name="sellerRepId" 
                  value={formData.sellerRepId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Temsilci Seç --</option>
                  {representatives
                    .filter((r: any) => r.companyId.toString() === formData.sellerId.toString())
                    .map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name.includes('|') ? r.name.split('|')[0] : r.name}
                    </option>
                  ))}
                </select>
             </div>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alıcı (Buyer) <span className="text-red-500">*</span>
                </label>
                <select 
                  name="buyerId" 
                  required
                  value={formData.buyerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Firma Seç --</option>
                   {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alıcı Temsilcisi
                </label>
                <select 
                  name="buyerRepId" 
                  value={formData.buyerRepId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                   <option value="">-- Temsilci Seç --</option>
                  {representatives
                    .filter((r: any) => r.companyId.toString() === formData.buyerId.toString())
                    .map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name.includes('|') ? r.name.split('|')[0] : r.name}
                    </option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sevk Adresi (Ship To)
                </label>
                <select 
                  name="shipToId" 
                  value={formData.shipToId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- (Alıcı Firma İle Aynı) --</option>
                  {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  İlgili Marka
                </label>
                <select 
                  name="brandId" 
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Marka Seç --</option>
                  {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 pt-4 border-t border-slate-100 mt-6 md:divide-x divide-slate-100">
          <div className="px-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Para Birimi <span className="text-red-500">*</span>
            </label>
            <select 
              name="currency" 
              required
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="TRY">TRY (₺)</option>
            </select>
          </div>
          <div className="px-2 md:col-span-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ödeme Şekli
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">-- Seçiniz --</option>
              <option value="HAVALE / EFT|BANK TRANSFER / WIRE TRANSFER">HAVALE / EFT</option>
              <option value="KREDİ KARTI|CREDIT CARD">KREDİ KARTI</option>
              <option value="TESLİMAT ÖNCESİ ÖDEME|PREPAID / PAYMENT BEFORE DELIVERY">TESLİMAT ÖNCESİ ÖDEME</option>
              <option value="TESLİMATTA ÖDEME|CASH ON DELIVERY (COD)">TESLİMATTA ÖDEME</option>
              <option value="PEŞİN ÖDEME|CASH IN ADVANCE">PEŞİN ÖDEME</option>
              <option value="SONRADAN ÖDEME (VADELİ)|POSTPAID / DEFERRED PAYMENT">SONRADAN ÖDEME (VADELİ)</option>
              <option value="ÇEK İLE ÖDEME|PAYMENT BY CHEQUE">ÇEK İLE ÖDEME</option>
              <option value="30 GÜN ÇEK İLE ÖDEME|30 DAYS BY CHEQUE">30 GÜN ÇEK İLE ÖDEME</option>
              <option value="60 GÜN ÇEK İLE ÖDEME|60 DAYS BY CHEQUE">60 GÜN ÇEK İLE ÖDEME</option>
              <option value="90 GÜN ÇEK İLE ÖDEME|90 DAYS BY CHEQUE">90 GÜN ÇEK İLE ÖDEME</option>
              <option value="120 GÜN ÇEK İLE ÖDEME|120 DAYS BY CHEQUE">120 GÜN ÇEK İLE ÖDEME</option>
              <option value="150 GÜN ÇEK İLE ÖDEME|150 DAYS BY CHEQUE">150 GÜN ÇEK İLE ÖDEME</option>
              <option value="180 GÜN ÇEK İLE ÖDEME|180 DAYS BY CHEQUE">180 GÜN ÇEK İLE ÖDEME</option>
              <option value="210 GÜN ÇEK İLE ÖDEME|210 DAYS BY CHEQUE">210 GÜN ÇEK İLE ÖDEME</option>
              <option value="240 GÜN ÇEK İLE ÖDEME|240 DAYS BY CHEQUE">240 GÜN ÇEK İLE ÖDEME</option>
              <option value="270 GÜN ÇEK İLE ÖDEME|270 DAYS BY CHEQUE">270 GÜN ÇEK İLE ÖDEME</option>
              <option value="SENET İLE ÖDEME|PAYMENT BY PROMISSORY NOTE">SENET İLE ÖDEME</option>
              <option value="30 GÜN SENET İLE ÖDEME|30 DAYS BY PROMISSORY NOTE">30 GÜN SENET İLE ÖDEME</option>
              <option value="60 GÜN SENET İLE ÖDEME|60 DAYS BY PROMISSORY NOTE">60 GÜN SENET İLE ÖDEME</option>
              <option value="90 GÜN SENET İLE ÖDEME|90 DAYS BY PROMISSORY NOTE">90 GÜN SENET İLE ÖDEME</option>
              <option value="120 GÜN SENET İLE ÖDEME|120 DAYS BY PROMISSORY NOTE">120 GÜN SENET İLE ÖDEME</option>
              <option value="150 GÜN SENET İLE ÖDEME|150 DAYS BY PROMISSORY NOTE">150 GÜN SENET İLE ÖDEME</option>
              <option value="180 GÜN SENET İLE ÖDEME|180 DAYS BY PROMISSORY NOTE">180 GÜN SENET İLE ÖDEME</option>
              <option value="MAL MUKABİLİ|CASH AGAINST GOODS">MAL MUKABİLİ</option>
              <option value="VESAİK MUKABİLİ|CASH AGAINST DOCUMENTS (CAD)">VESAİK MUKABİLİ</option>
              <option value="PEŞİN AKREDİTİF|LETTER OF CREDIT SIGHT">PEŞİN AKREDİTİF</option>
              <option value="AKREDİTİF 30 GÜN|LETTER OF CREDIT 30 DAYS">AKREDİTİF 30 GÜN</option>
              <option value="AKREDİTİF 60 GÜN|LETTER OF CREDIT 60 DAYS">AKREDİTİF 60 GÜN</option>
              <option value="AKREDİTİF 90 GÜN|LETTER OF CREDIT 90 DAYS">AKREDİTİF 90 GÜN</option>
              <option value="AKREDİTİF 120 GÜN|LETTER OF CREDIT 120 DAYS">AKREDİTİF 120 GÜN</option>
              <option value="AKREDİTİF 150 GÜN|LETTER OF CREDIT 150 DAYS">AKREDİTİF 150 GÜN</option>
              <option value="AKREDİTİF 180 GÜN|LETTER OF CREDIT 180 DAYS">AKREDİTİF 180 GÜN</option>
              <option value="30 GÜN VADELİ|NET 30 DAYS">30 GÜN VADELİ</option>
              <option value="60 GÜN VADELİ|NET 60 DAYS">60 GÜN VADELİ</option>
              <option value="90 GÜN VADELİ|NET 90 DAYS">90 GÜN VADELİ</option>
              <option value="120 GÜN VADELİ|NET 120 DAYS">120 GÜN VADELİ</option>
              <option value="150 GÜN VADELİ|NET 150 DAYS">150 GÜN VADELİ</option>
              <option value="180 GÜN VADELİ|NET 180 DAYS">180 GÜN VADELİ</option>
              <option value="30 GÜN KUR TAKİPLİ|30 DAYS WITH EXCHANGE RATE">30 GÜN KUR TAKİPLİ</option>
              <option value="60 GÜN KUR TAKİPLİ|60 DAYS WITH EXCHANGE RATE">60 GÜN KUR TAKİPLİ</option>
              <option value="90 GÜN KUR TAKİPLİ|90 DAYS WITH EXCHANGE RATE">90 GÜN KUR TAKİPLİ</option>
              <option value="120 GÜN KUR TAKİPLİ|120 DAYS WITH EXCHANGE RATE">120 GÜN KUR TAKİPLİ</option>
              <option value="150 GÜN KUR TAKİPLİ|150 DAYS WITH EXCHANGE RATE">150 GÜN KUR TAKİPLİ</option>
              <option value="180 GÜN KUR TAKİPLİ|180 DAYS WITH EXCHANGE RATE">180 GÜN KUR TAKİPLİ</option>
              <option value="%100 PEŞİN AVANS (SİPARİŞ ANINDA)|100% ADVANCE PAYMENT (UPON ORDER)">%100 PEŞİN AVANS (SİPARİŞ ANINDA)</option>
              <option value="%20 PEŞİN AVANS, BAKİYE YÜKLEMEDE|20% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%20 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="%25 PEŞİN AVANS, BAKİYE YÜKLEMEDE|25% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%25 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="%30 PEŞİN AVANS, BAKİYE YÜKLEMEDE|30% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%30 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="%35 PEŞİN AVANS, BAKİYE YÜKLEMEDE|35% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%35 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="%40 PEŞİN AVANS, BAKİYE YÜKLEMEDE|40% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%40 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="%50 PEŞİN AVANS, BAKİYE YÜKLEMEDE|50% ADVANCE PAYMENT, BALANCE UPON SHIPMENT">%50 PEŞİN AVANS, BAKİYE YÜKLEMEDE</option>
              <option value="30 GÜN / FATURA TARİHİNDEKİ KUR|30 DAYS / EXCHANGE RATE ON INVOICE DATE">30 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="60 GÜN / FATURA TARİHİNDEKİ KUR|60 DAYS / EXCHANGE RATE ON INVOICE DATE">60 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="90 GÜN / FATURA TARİHİNDEKİ KUR|90 DAYS / EXCHANGE RATE ON INVOICE DATE">90 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="120 GÜN / FATURA TARİHİNDEKİ KUR|120 DAYS / EXCHANGE RATE ON INVOICE DATE">120 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="150 GÜN / FATURA TARİHİNDEKİ KUR|150 DAYS / EXCHANGE RATE ON INVOICE DATE">150 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="180 GÜN / FATURA TARİHİNDEKİ KUR|180 DAYS / EXCHANGE RATE ON INVOICE DATE">180 GÜN / FATURA TARİHİNDEKİ KUR</option>
              <option value="30 GÜN / SİPARİŞ TARİHİNDEKİ KUR|30 DAYS / EXCHANGE RATE ON ORDER DATE">30 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
              <option value="60 GÜN / SİPARİŞ TARİHİNDEKİ KUR|60 DAYS / EXCHANGE RATE ON ORDER DATE">60 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
              <option value="90 GÜN / SİPARİŞ TARİHİNDEKİ KUR|90 DAYS / EXCHANGE RATE ON ORDER DATE">90 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
              <option value="120 GÜN / SİPARİŞ TARİHİNDEKİ KUR|120 DAYS / EXCHANGE RATE ON ORDER DATE">120 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
              <option value="150 GÜN / SİPARİŞ TARİHİNDEKİ KUR|150 DAYS / EXCHANGE RATE ON ORDER DATE">150 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
              <option value="180 GÜN / SİPARİŞ TARİHİNDEKİ KUR|180 DAYS / EXCHANGE RATE ON ORDER DATE">180 GÜN / SİPARİŞ TARİHİNDEKİ KUR</option>
            </select>
          </div>
          <div className="px-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tolerans
            </label>
            <select
              name="tolerance"
              value={formData.tolerance}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={`${num}%`}>{num}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 mt-2">
          <div className="px-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teslim Şekli
            </label>
            <select
              name="deliveryTerms"
              value={formData.deliveryTerms}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">-- Seçiniz --</option>
              {Object.keys(DELIVERY_TERMS_INFO).map((term) => (
                <option key={term} value={term}>{term.split('|')[0]}</option>
              ))}
            </select>
            {formData.deliveryTerms && DELIVERY_TERMS_INFO[formData.deliveryTerms] && (
              <div className="mt-2 text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">
                <span className="font-semibold block mb-1">Piyasa Kullanımı: {DELIVERY_TERMS_INFO[formData.deliveryTerms].market}</span>
                {DELIVERY_TERMS_INFO[formData.deliveryTerms].desc}
              </div>
            )}
          </div>
          <div className="px-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nakliyeci
            </label>
            <input 
              type="text" 
              name="transporter" 
              value={formData.transporter}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-b border-slate-300 focus:border-blue-500 outline-none text-sm"
              placeholder="Örn: DHL"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className={`p-4 border rounded-lg transition-colors ${formData.specialDocsRequest ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
           <label className="flex items-center space-x-3 cursor-pointer mb-2">
            <input 
              type="checkbox" 
              name="specialDocsRequest" 
              checked={formData.specialDocsRequest} 
              onChange={handleInputChange}
              className="w-5 h-5 text-rose-600 rounded" 
            />
            <span className="font-medium text-slate-700">Özel Evrak Talebi Var</span>
           </label>
            {formData.specialDocsRequest && (
             <input type="text" name="specialDocsDetail" value={formData.specialDocsDetail} onChange={handleInputChange} placeholder="Özel Evrak Detayı..." className="w-full mt-2 px-3 py-2 text-sm border border-rose-200 rounded focus:border-rose-500 outline-none" />
           )}
          </div>

          <div className={`p-4 border rounded-lg transition-colors ${formData.specialLoadingRequest ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
           <label className="flex items-center space-x-3 cursor-pointer mb-2">
            <input 
              type="checkbox" 
              name="specialLoadingRequest" 
              checked={formData.specialLoadingRequest} 
              onChange={handleInputChange}
              className="w-5 h-5 text-orange-600 rounded" 
            />
            <span className="font-medium text-slate-700">Özel Yükleme Talebi Var</span>
           </label>
            {formData.specialLoadingRequest && (
             <input type="text" name="specialLoadingDetail" value={formData.specialLoadingDetail} onChange={handleInputChange} placeholder="Özel Yükleme Detayı..." className="w-full mt-2 px-3 py-2 text-sm border border-orange-200 rounded focus:border-orange-500 outline-none" />
           )}
          </div>
          <div className="md:col-span-2 mt-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Özel Paketleme Talimatı
            </label>
            <textarea 
              name="packingInstructions" 
              value={formData.packingInstructions}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Naylon poşet içine, her 50 adette bir ayraç konacak..."
            />
          </div>
        </div>
      </div>

      {/* FATURA VE ÇEKİ LİSTESİ DETAYLARI */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200">
          Fatura ve Çeki Listesi Detayları
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fatura Numarası
            </label>
            <input 
              type="text" 
              name="invoiceNo" 
              value={formData.invoiceNo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Fatura No"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fatura Tarihi
            </label>
            <input 
              type="date" 
              name="invoiceDate" 
              value={formData.invoiceDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Brüt Kg (Gross)
            </label>
            <input 
              type="number" 
              step="0.01"
              name="grossKg" 
              value={formData.grossKg}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Net Kg
            </label>
            <input 
              type="number" 
              step="0.01"
              name="netKg" 
              value={formData.netKg}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Top (Roll) Sayısı
            </label>
            <input 
              type="number" 
              name="rollCount" 
              value={formData.rollCount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Çuval (Sack) Sayısı
            </label>
            <input 
              type="number" 
              name="sackCount" 
              value={formData.sackCount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">* Fatura numarası ve ağırlık bilgileri sevkiyat onaylandıktan sonra doldurulabilir.</p>
      </div>

      {/* ÜRÜN KALEMLERİ */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-lg text-slate-700 border border-slate-200">
            Sipariş Ürünleri
          </h2>
          <button 
            type="button" 
            onClick={addItemRow}
            className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
             + Satır Ekle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-t border-slate-200 text-xs">
                <th className="p-2 font-medium border-l border-slate-200 flex-1">Alıcı Model Adı</th>
                <th className="p-2 font-medium w-32">Kalite İsim</th>
                <th className="p-2 font-medium w-32">Kalite Kodu</th>
                <th className="p-2 font-medium w-32">Renk Kodu</th>
                <th className="p-2 font-medium w-32">Kompozisyon</th>
                <th className="p-2 font-medium w-[90px]">Gramaj</th>
                <th className="p-2 font-medium w-[90px]">En</th>
                <th className="p-2 font-medium w-40 border-l border-slate-200">Termin</th>
                <th className="p-2 font-medium w-32 border-l border-slate-200 text-right">Miktar</th>
                <th className="p-2 font-medium w-[90px] text-right">B. Fiyat</th>
                <th className="p-2 font-medium w-32 bg-slate-200 border-l border-slate-300 text-right">Tutar</th>
                <th className="p-2 font-medium w-24 border-l border-slate-200 text-center">İstek-1</th>
                <th className="p-2 font-medium w-24 border-l border-slate-200 text-center">İstek-2</th>
                <th className="p-2 font-medium w-36 border-l border-slate-200 text-center">İstek-3</th>
                <th className="p-2 font-medium w-32 border-l border-slate-200">BDD</th>
                <th className="p-2 font-medium w-[90px] border-l border-slate-200 text-right">BQ</th>
                <th className="p-2 font-medium w-32 border-l border-slate-200">ExMD</th>
                <th className="p-2 font-medium w-12 text-center border-l border-slate-200">Sil</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
                <tr key={index} className="border-b border-slate-200 focus-within:bg-blue-50 transition-colors">
                  <td className="p-1.5 focus-within:bg-blue-50">
                    <input 
                      type="text" 
                      value={item.buyerModelName || ''} 
                      onChange={(e) => handleItemChange(index, "buyerModelName", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[100px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.qualityName || ''} 
                      onChange={(e) => handleItemChange(index, "qualityName", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.qualityCode || ''} 
                      onChange={(e) => handleItemChange(index, "qualityCode", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.colorCode || ''} 
                      onChange={(e) => handleItemChange(index, "colorCode", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.composition || ''} 
                      onChange={(e) => handleItemChange(index, "composition", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.weight || ''} 
                      onChange={(e) => handleItemChange(index, "weight", e.target.value)} 
                      placeholder="gr/m2"
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.width || ''} 
                      onChange={(e) => handleItemChange(index, "width", e.target.value)} 
                      placeholder="cm"
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" 
                    />
                  </td>
                  <td className="p-1.5 border-l border-slate-200">
                    <input 
                      type="text" 
                      value={item.deliveryDate || ''} 
                      onChange={(e) => handleItemChange(index, "deliveryDate", e.target.value)} 
                      placeholder="Örn: 3. Hafta"
                      className="w-full px-2 py-1.5 min-w-[100px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5 border-l border-slate-200">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.quantity || ''} 
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.unitPrice || ''} 
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                  </td>
                  <td className="p-1.5 bg-slate-100 min-w-[130px] border-l border-r border-slate-300 font-mono text-right font-bold text-slate-700">
                    {item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.bsRequest || false} onChange={(e) => handleItemChange(index, "bsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>B.S</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.ldRequest || false} onChange={(e) => handleItemChange(index, "ldRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>L/D</span>
                      </label>
                      {item.ldRequest && (
                        <input type="text" value={item.ldDetail || ''} onChange={(e) => handleItemChange(index, "ldDetail", e.target.value)} placeholder="L/D Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs" />
                      )}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.ppsRequest || false} onChange={(e) => handleItemChange(index, "ppsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>PPS</span>
                      </label>
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.topsRequest || false} onChange={(e) => handleItemChange(index, "topsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>TOPS</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.srlRequest || false} onChange={(e) => handleItemChange(index, "srlRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>SRL</span>
                      </label>
                      {item.srlRequest && (
                        <input type="text" value={item.srlDetail || ''} onChange={(e) => handleItemChange(index, "srlDetail", e.target.value)} placeholder="SRL Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs" />
                      )}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.fdRequest || false} onChange={(e) => handleItemChange(index, "fdRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>FD</span>
                      </label>
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.pshpRequest || false} onChange={(e) => handleItemChange(index, "pshpRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>PSHP</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.susRequest || false} onChange={(e) => handleItemChange(index, "susRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>SUS</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.ltRequest || false} onChange={(e) => handleItemChange(index, "ltRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span>LT</span>
                      </label>
                      {item.ltRequest && (
                        <input type="text" value={item.ltDetail || ''} onChange={(e) => handleItemChange(index, "ltDetail", e.target.value)} placeholder="LT Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs" />
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 bg-orange-50/30">
                    <input 
                      type="date" 
                      value={item.bdd || ''} 
                      onChange={(e) => handleItemChange(index, "bdd", e.target.value)} 
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5 border-l border-slate-200 bg-orange-50/30">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.bq || ''} 
                      onChange={(e) => handleItemChange(index, "bq", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                  </td>
                  <td className="p-1.5 border-l border-slate-200 bg-orange-50/30">
                    <input 
                      type="date" 
                      value={item.exmd || ''} 
                      onChange={(e) => handleItemChange(index, "exmd", e.target.value)} 
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => removeItemRow(index)}
                      className={`text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 ${items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={items.length === 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
              <tfoot>
               <tr className="bg-slate-800 text-white font-bold">
                 <td colSpan={13} className="p-4 text-right tracking-wider">
                   GENEL TOPLAM ({formData.currency}):
                 </td>
                 <td className="p-4 text-right font-mono text-lg">
                   {orderTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </td>
                 <td></td>
               </tr>
             </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12 border-t border-slate-200">
        <button 
          type="button"
          onClick={() => router.back()}
          className="mr-4 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          İptal
        </button>
        <button 
          type="submit"
          className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-bold shadow-md transition-colors text-lg"
        >
          {initialData ? 'Siparişi Güncelle' : 'Siparişi Sisteme Kaydet'}
        </button>
      </div>

    </form>
  );
}
