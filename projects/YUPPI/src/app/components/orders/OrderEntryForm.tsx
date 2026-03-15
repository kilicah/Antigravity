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

export default function OrderEntryForm({ companies, representatives, initialData }: any) {
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
    deliveryDestination: "",
    paymentTerms: "",
    transporter: "",
    currency: "USD",
    unit: "MT",
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

  const [itemToDelete, setItemToDelete] = useState<number | null>(null);


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
        deliveryDestination: initialData.deliveryDestination || "",
        
        // Production Order
        packingInstructions: initialData.productionOrder?.packingInstructions || "",
        fabricDirection: initialData.productionOrder?.fabricDirection || "",
        partialShipmentAllowed: initialData.productionOrder?.partialShipmentAllowed || false,
        
        // Order and Invoice
        unit: initialData.unit || "MT",
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
    ldRequest: "WAIT",
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
    exmd: "",
    etd: "",
    fds: "WAIT",
    cs: "WAIT",
    csSentDate: "",
    csApprovalDate: "",
    ldSentDate: "",
    ldApprovalDate: "",
    bsad: "",
    pl: false,
    fabricType: "",
    apQuantity: ""
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
      exmd: "",
      pl: false,
      fabricType: "",
      apQuantity: ""
    }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItemToDelete(index);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      const newItems = items.filter((_: any, i: number) => i !== itemToDelete);
      setItems(newItems);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
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
    <>
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* GENEL BİLGİLER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200">
          {formData.language === 'ENG' ? 'ORDER GENERAL INFORMATION' : 'SIPARIS GENEL BILGILERI'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'DATE' : 'TARIH'} <span className="text-red-500">*</span>
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
              {formData.language === 'ENG' ? 'BUYER PO NO' : 'ALICI PO NO'}
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
              {formData.language === 'ENG' ? 'CONTRACT LANGUAGE' : 'SOZLESME DILI'} <span className="text-red-500">*</span>
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
                  {formData.language === 'ENG' ? 'SELLER' : 'SATICI'} <span className="text-red-500">*</span>
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
                  {formData.language === 'ENG' ? 'SELLER REPRESENTATIVE' : 'SATICI TEMSILCISI'}
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
                  {formData.language === 'ENG' ? 'BUYER' : 'ALICI'} <span className="text-red-500">*</span>
                </label>
                <select 
                  name="buyerId" 
                  required
                  value={formData.buyerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                   <option value="">-- Firma Seç --</option>
                   {companies
                     .filter((c: any) => c.isBuyer)
                     .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)
                   }
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.language === 'ENG' ? 'BUYER REPRESENTATIVE' : 'ALICI TEMSILCISI'}
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
                  {formData.language === 'ENG' ? 'SHIP TO' : 'SEVK ADRESI'}
                </label>
                <select 
                  name="shipToId" 
                  value={formData.shipToId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- (Alıcı Firma İle Aynı) --</option>
                  {companies
                    .filter((c: any) => c.isBuyer || c.isLogistics)
                    .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {formData.language === 'ENG' ? 'RELATED BRAND' : 'ILGILI MARKA'}
                </label>
                <select 
                  name="brandId" 
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Marka Seç --</option>
                  {companies
                    .filter((c: any) => c.isBrand)
                    .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-200 mt-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              BİRİM <span className="text-red-500">*</span>
            </label>
            <select 
              name="unit" 
              required
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="MT">MT</option>
              <option value="YD">YARDA</option>
              <option value="KG">KG</option>
              <option value="AD">ADET</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'CURRENCY' : 'PARA BIRIMI'} <span className="text-red-500">*</span>
            </label>
            <select 
              name="currency" 
              required
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="TRY">TRY (₺)</option>
            </select>
          </div>
          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'PAYMENT TERMS' : 'ODEME SEKLI'}
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'TOLERANCE' : 'TOLERANS'}
            </label>
            <select
              name="tolerance"
              value={formData.tolerance}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={`${num}%`}>{num}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'DELIVERY TERMS' : 'TESLIM SEKLI'}
            </label>
            <div className="space-y-3">
              <select
                name="deliveryTerms"
                value={formData.deliveryTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">-- Seçiniz --</option>
                {Object.keys(DELIVERY_TERMS_INFO).map((term) => (
                  <option key={term} value={term}>{term.split('|')[0]}</option>
                ))}
              </select>
              
              {formData.deliveryTerms && DELIVERY_TERMS_INFO[formData.deliveryTerms] && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="font-semibold block mb-0.5">Piyasa Kullanımı: {DELIVERY_TERMS_INFO[formData.deliveryTerms].market}</span>
                  {DELIVERY_TERMS_INFO[formData.deliveryTerms].desc}
                </div>
              )}
              
              {(formData.deliveryTerms?.startsWith("EXW") || formData.deliveryTerms?.startsWith("FOB") || formData.deliveryTerms?.startsWith("CPT") || formData.deliveryTerms?.startsWith("DAP") || formData.deliveryTerms?.startsWith("FCA") || formData.deliveryTerms?.startsWith("CIF")) && (
                <div className="animate-in fade-in slide-in-from-top-1 bg-blue-50/50 p-3 rounded-md border border-blue-200">
                  <label className="block text-xs font-semibold text-blue-800 mb-1.5 uppercase tracking-wide">
                    {(formData.deliveryTerms?.startsWith("FCA") || formData.deliveryTerms?.startsWith("CIF")) ? "Yükleme Limanı" : "Varış Şehri"} <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="deliveryDestination" 
                    value={formData.deliveryDestination}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder-slate-400 font-medium uppercase text-sm"
                    placeholder={(formData.deliveryTerms?.startsWith("FCA") || formData.deliveryTerms?.startsWith("CIF")) ? "Örn: AMBARLI LİMANI, TR" : "Örn: LONDRA, UK"}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'TRANSPORTER' : 'NAKLIYECI'}
            </label>
            <input 
              type="text" 
              name="transporter" 
              value={formData.transporter}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Örn: DHL, UPS..."
            />
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
            {formData.language === 'ENG' ? 'SPECIAL REQUESTS AND INSTRUCTIONS' : 'OZEL TALEPLER VE TALIMATLAR'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 border rounded-lg transition-colors ${formData.specialDocsRequest ? 'border-rose-400 bg-rose-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="specialDocsRequest" 
                checked={formData.specialDocsRequest} 
                onChange={handleInputChange}
                className="w-5 h-5 text-rose-600 rounded cursor-pointer" 
              />
              <span className="font-medium text-slate-700">
                {formData.language === 'ENG' ? 'SPECIAL DOCUMENTS REQUEST' : 'OZEL EVRAK TALEBI'}
              </span>
              </label>
              {formData.specialDocsRequest && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input type="text" name="specialDocsDetail" value={formData.specialDocsDetail} onChange={handleInputChange} placeholder="Özel Evrak Detayını Açıklayınız..." className="w-full px-3 py-2 text-sm border border-rose-200 rounded-md focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white placeholder-slate-400" />
              </div>
              )}
            </div>

            <div className={`p-4 border rounded-lg transition-colors ${formData.specialLoadingRequest ? 'border-orange-400 bg-orange-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="specialLoadingRequest" 
                checked={formData.specialLoadingRequest} 
                onChange={handleInputChange}
                className="w-5 h-5 text-orange-600 rounded cursor-pointer" 
              />
              <span className="font-medium text-slate-700">
                {formData.language === 'ENG' ? 'SPECIAL LOADING REQUEST' : 'OZEL YUKLEME TALEBI'}
              </span>
              </label>
              {formData.specialLoadingRequest && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input type="text" name="specialLoadingDetail" value={formData.specialLoadingDetail} onChange={handleInputChange} placeholder="Özel Yükleme Detayını Açıklayınız..." className="w-full px-3 py-2 text-sm border border-orange-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white placeholder-slate-400" />
              </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {formData.language === 'ENG' ? 'SPECIAL PACKING INSTRUCTIONS' : 'OZEL PAKETLEME TALIMATI'}
            </label>
            <textarea 
              name="packingInstructions" 
              value={formData.packingInstructions}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400"
              placeholder="Örn: Naylon poşet içine, her 50 adette bir ayraç konacak..."
            />
          </div>
        </div>
      </div>

      {/* ÜRÜN KALEMLERİ */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-lg text-slate-700 border border-slate-200">
            {formData.language === 'ENG' ? 'ORDER ITEMS' : 'SIPARIS URUNLERI'}
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
            <thead className="bg-slate-800 text-slate-200 text-xs whitespace-nowrap sticky top-0 z-10 shadow-md">
              <tr className="border-b-2 border-slate-900">
                <th className="p-3 font-semibold w-28 min-w-[100px] text-left border-r border-slate-700">
                  {formData.language === 'ENG' ? 'BUYER MODEL' : 'ALICI MODEL'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'QUALITY NAME' : 'KALITE ISMI'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'QUALITY CODE' : 'KALITE KODU'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'COLOR CODE' : 'RENK KODU'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'COMPOSITION' : 'KOMPOZISYON'}
                </th>
                <th className="p-3 font-semibold w-[90px] border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'WEIGHT' : 'GRAMAJ'}
                </th>
                <th className="p-3 font-semibold w-[90px] border-r border-slate-700 text-left">
                  {formData.language === 'ENG' ? 'WIDTH' : 'EN'}
                </th>
                <th className="p-3 font-semibold w-40 border-r border-slate-700 text-center">
                  {formData.language === 'ENG' ? 'DELIVERY' : 'TERMIN'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-right text-emerald-300">
                  {formData.language === 'ENG' ? 'QUANTITY' : 'MIKTAR'} ({formData.unit})
                </th>
                <th className="p-3 font-semibold w-[90px] text-right bg-slate-700">
                  {formData.language === 'ENG' ? 'UNIT PRICE' : 'B. FIYAT'}
                </th>
                <th className="p-3 font-bold w-32 bg-slate-900 text-emerald-400 border-r border-slate-700 text-right">
                  {formData.language === 'ENG' ? 'AMOUNT' : 'TUTAR'}
                </th>
                <th className="p-3 font-semibold w-36 min-w-[140px] border-r border-slate-700 text-center text-blue-300">
                  {formData.language === 'ENG' ? 'REQUEST-1' : 'ISTEK-1'}
                </th>
                <th className="p-3 font-semibold w-36 min-w-[140px] border-r border-slate-700 text-center text-blue-300">
                  {formData.language === 'ENG' ? 'REQUEST-2' : 'ISTEK-2'}
                </th>
                <th className="p-3 font-semibold w-36 min-w-[140px] border-r border-slate-700 text-center text-blue-300">
                  {formData.language === 'ENG' ? 'REQUEST-3' : 'ISTEK-3'}
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-center cursor-help" title="Bulk Sample Delivery Date">B/S-DD</th>
                <th className="p-3 font-semibold w-[90px] border-r border-slate-700 text-right cursor-help text-emerald-300" title="Bulk Sample Quantity">B/S-Q</th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-center cursor-help" title="Ex-Mill Date">ExMD</th>
                <th className="p-3 font-semibold w-12 text-center border-r border-slate-700 text-red-400">
                  {formData.language === 'ENG' ? 'DEL' : 'SIL'}
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-l-2 border-r border-sky-600 bg-sky-900/50 text-sky-300 text-center" title="Estimated Date of Departure">ETD</th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="FDS Form Sent?">FDS</th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Counter Sample Apply?">C/S</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Counter Sample Sent Date">C/S-SD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Counter Sample Approval Date">C/S-AD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Lab Dip Sent Date">L/D-SD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Lab Dip Sample Approval Date">L/D-AD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Bulk Sent Date">B/S-SD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center" title="Bulk Approval Date">B/S-AD</th>
                <th className="p-3 font-semibold min-w-[90px] border-l-2 border-r border-green-600 bg-green-900/50 text-green-400 text-center" title="Mill Production Approval">M.PA</th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Designer Production Approval">D.PA</th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Reference Sample">R/S</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Reference Sample Sent Mill">R/S-MS</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Buyer's Reference Sample Sent Mill">B.S-MS</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Buyer's Laboratory Test Received Date">B.LT-RD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Buyer's Laboratory Test Mill Sent">B.LT-MS</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Buyer's Laboratory Test Mill Approved">B.LT-MA</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Laboratory Test Approved">LT-AD</th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Buyer's Shipment Approval Date">B.SAD</th>
                <th className="p-3 font-semibold min-w-[70px] border-r border-green-800 bg-green-900/50 text-green-400 text-center" title="Packing List">PL</th>
                <th className="p-3 font-semibold min-w-[140px] border-l-2 border-r border-rose-600 bg-rose-900/50 text-rose-300 text-center" title="Fabric Type">
                  {formData.language === 'ENG' ? 'FABRIC TYPE' : 'URUN CINSI'}
                </th>
                <th className="p-3 font-semibold min-w-[120px] border-r border-rose-800 bg-rose-900/50 text-rose-300 text-center" title="After Production Quantity">
                  {formData.language === 'ENG' ? 'AP. QUANTITY' : 'US. MIKTAR'}
                </th>
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
                      placeholder={formData.unit === 'YD' ? 'oz/yd2' : formData.unit === 'AD' ? 'gr/pc' : 'gr/m2'}
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400" 
                    />
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      value={item.width || ''} 
                      onChange={(e) => handleItemChange(index, "width", e.target.value)} 
                      placeholder={formData.unit === 'YD' ? 'inch' : formData.unit === 'AD' ? 'x' : 'cm'}
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
                      className="w-full px-2 py-1.5 min-w-[70px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                  </td>
                  <td className="p-1.5 bg-slate-50 border-x border-slate-200">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.unitPrice || ''} 
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[90px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono font-semibold" 
                    />
                  </td>
                  <td className="p-1.5 bg-emerald-50 min-w-[130px] border-r border-emerald-200 font-mono text-right font-bold text-emerald-700">
                    {item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 align-top min-w-[140px] border-r border-slate-200">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.bsRequest || false} onChange={(e) => handleItemChange(index, "bsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Buyer's Sample" className="cursor-help border-b border-dotted border-slate-400">B.S</span>
                      </label>
                      <div className="flex flex-col gap-1 items-start mt-1 mb-1 border-t border-slate-200 pt-1 pb-1">
                        <span title="Lab Dip" className="cursor-help border-b border-dotted border-slate-400 font-medium text-blue-800">L/D</span>
                        <select 
                          value={item.ldRequest || 'WAIT'} 
                          onChange={(e) => handleItemChange(index, "ldRequest", e.target.value)}
                          className={`w-full px-1 py-1 rounded text-xs font-bold border ${
                            item.ldRequest === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                            item.ldRequest === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="YES">YES</option>
                          <option value="WAIT">WAIT</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.ppsRequest || false} onChange={(e) => handleItemChange(index, "ppsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Pre-Production Sample" className="cursor-help border-b border-dotted border-slate-400">PPS</span>
                      </label>
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top min-w-[140px]">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.topsRequest || false} onChange={(e) => handleItemChange(index, "topsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Top of Production Sample" className="cursor-help border-b border-dotted border-slate-400">TOPS</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.srlRequest || false} onChange={(e) => handleItemChange(index, "srlRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Specific Roll Label" className="cursor-help border-b border-dotted border-slate-400">SRL</span>
                      </label>
                      {item.srlRequest && (
                        <input type="text" value={item.srlDetail || ''} onChange={(e) => handleItemChange(index, "srlDetail", e.target.value)} placeholder="SRL Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs" />
                      )}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.fdRequest || false} onChange={(e) => handleItemChange(index, "fdRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Fabric Direction" className="cursor-help border-b border-dotted border-slate-400">FD</span>
                      </label>
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top min-w-[140px]">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.pshpRequest || false} onChange={(e) => handleItemChange(index, "pshpRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Partial Shipment" className="cursor-help border-b border-dotted border-slate-400">PSHP</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.susRequest || false} onChange={(e) => handleItemChange(index, "susRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Sustainability" className="cursor-help border-b border-dotted border-slate-400">SUS</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.ltRequest || false} onChange={(e) => handleItemChange(index, "ltRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Labrotory Test" className="cursor-help border-b border-dotted border-slate-400">LT</span>
                      </label>
                      {item.ltRequest && (
                        <input type="text" value={item.ltDetail || ''} onChange={(e) => handleItemChange(index, "ltDetail", e.target.value)} placeholder="LT Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs" />
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    <input 
                      type="date" 
                      value={item.bsdd || ''} 
                      onChange={(e) => handleItemChange(index, "bsdd", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.bsq || ''} 
                      onChange={(e) => handleItemChange(index, "bsq", e.target.value)} 
                      className="w-full px-1 py-1.5 min-w-[50px] text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    <input 
                      type="date" 
                      value={item.exmd || ''} 
                      onChange={(e) => handleItemChange(index, "exmd", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </td>
                  <td className="p-1.5 text-center border-r border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => removeItemRow(index)}
                      className={`text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 ${items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={items.length === 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                  <td className="p-1.5 border-l-2 border-r border-sky-300 bg-sky-50">
                    <input 
                      type="date" 
                      value={item.etd || ''} 
                      onChange={(e) => handleItemChange(index, "etd", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50 text-center">
                    <select 
                      value={item.fds || 'WAIT'} 
                      onChange={(e) => handleItemChange(index, "fds", e.target.value)}
                      className={`w-full px-1 py-1 rounded text-xs font-bold border ${
                        item.fds === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                        item.fds === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                        'bg-rose-100 text-rose-700 border-rose-300'
                      }`}
                    >
                      <option value="YES">YES</option>
                      <option value="WAIT">WAIT</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50 text-center">
                    <select 
                      value={item.cs || 'WAIT'} 
                      onChange={(e) => handleItemChange(index, "cs", e.target.value)}
                      className={`w-full px-1 py-1 rounded text-xs font-bold border ${
                        item.cs === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                        item.cs === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                        'bg-rose-100 text-rose-700 border-rose-300'
                      }`}
                    >
                      <option value="YES">YES</option>
                      <option value="WAIT">WAIT</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={item.cs === 'NO'}
                      value={item.csSentDate || ''} 
                      onChange={(e) => handleItemChange(index, "csSentDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={item.cs === 'NO'}
                      value={item.csApprovalDate || ''} 
                      onChange={(e) => handleItemChange(index, "csApprovalDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={item.ldRequest === 'NO'}
                      value={item.ldSentDate || ''} 
                      onChange={(e) => handleItemChange(index, "ldSentDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={item.ldRequest === 'NO'}
                      value={item.ldApprovalDate || ''} 
                      onChange={(e) => handleItemChange(index, "ldApprovalDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={Number(item.bq) === 0 || !item.bq}
                      value={item.bsSentDate || ''} 
                      onChange={(e) => handleItemChange(index, "bsSentDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-sky-200 bg-sky-50">
                    <input 
                      type="date" 
                      disabled={Number(item.bq) === 0 || !item.bq}
                      value={item.bsApprovalDate || ''} 
                      onChange={(e) => handleItemChange(index, "bsApprovalDate", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-sky-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-l-2 border-r border-green-300 bg-green-50 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.mpa || false} 
                      onChange={(e) => handleItemChange(index, "mpa", e.target.checked as boolean)} 
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.dpa || false} 
                      onChange={(e) => handleItemChange(index, "dpa", e.target.checked as boolean)} 
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50 text-center">
                    <select 
                      value={item.rs || 'WAIT'} 
                      onChange={(e) => handleItemChange(index, "rs", e.target.value)}
                      className={`w-full px-1 py-1 rounded text-xs font-bold border ${
                        item.rs === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                        item.rs === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                        'bg-rose-100 text-rose-700 border-rose-300'
                      }`}
                    >
                      <option value="YES">YES</option>
                      <option value="WAIT">WAIT</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={item.rs === 'NO'}
                      value={item.rsMs || ''} 
                      onChange={(e) => handleItemChange(index, "rsMs", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={!item.bsRequest}
                      value={item.bsMs || ''} 
                      onChange={(e) => handleItemChange(index, "bsMs", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={!item.ltRequest}
                      value={item.bltRd || ''} 
                      onChange={(e) => handleItemChange(index, "bltRd", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={!item.ltRequest}
                      value={item.bltMs || ''} 
                      onChange={(e) => handleItemChange(index, "bltMs", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={!item.ltRequest}
                      value={item.bltMa || ''} 
                      onChange={(e) => handleItemChange(index, "bltMa", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      disabled={!item.ltRequest}
                      value={item.ltAd || ''} 
                      onChange={(e) => handleItemChange(index, "ltAd", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50">
                    <input 
                      type="date" 
                      value={item.bsad || ''} 
                      onChange={(e) => handleItemChange(index, "bsad", e.target.value)} 
                      className="w-full px-1 py-1.5 text-xs font-mono border border-green-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-green-200 bg-green-50 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.pl || false} 
                      onChange={(e) => handleItemChange(index, "pl", e.target.checked as boolean)} 
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500" 
                    />
                  </td>
                  <td className="p-1.5 border-l-2 border-r border-rose-300 bg-rose-50">
                    <input 
                      type="text" 
                      value={item.fabricType || ''} 
                      onChange={(e) => handleItemChange(index, "fabricType", e.target.value)} 
                      className="w-full px-2 py-1.5 text-xs border border-rose-200 rounded focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none uppercase font-semibold text-slate-700 bg-white" 
                    />
                  </td>
                  <td className="p-1.5 border-r border-rose-200 bg-rose-50">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.apQuantity || ''} 
                      onChange={(e) => handleItemChange(index, "apQuantity", e.target.value)} 
                      className="w-full px-2 py-1.5 text-sm border border-rose-200 rounded focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-right font-mono bg-white font-bold text-rose-700" 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
              <tfoot>
               <tr className="bg-slate-500 text-white font-bold text-sm">
                 <td colSpan={10} className="p-2 text-right tracking-wider">
                   GENEL TOPLAM ({formData.currency}):
                 </td>
                 <td className="p-2 text-right font-mono text-base bg-slate-400">
                   {orderTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </td>
                  <td colSpan={7} className="bg-slate-200 border-l border-slate-300"></td>
                  <td colSpan={10} className="bg-blue-100 border-l-4 border-blue-400"></td>
                  <td colSpan={10} className="bg-green-100 border-l-4 border-green-500"></td>
               </tr>
             </tfoot>
          </table>
        </div>
      </div>

      {/* FATURA BİLGİLERİ */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200 flex items-center justify-between">
          <span>{formData.language === 'ENG' ? 'INVOICE INFORMATION' : 'FATURA BİLGİLERİ'}</span>
          <span className="text-sm font-normal text-slate-500">(İsteğe Bağlı)</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'INVOICE NO' : 'FATURA NO'}
            </label>
            <input 
              type="text" 
              name="invoiceNo"
              value={formData.invoiceNo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase font-mono"
              placeholder="Örn: YUP-2026-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {formData.language === 'ENG' ? 'INVOICE DATE' : 'FATURA TARİHİ'}
            </label>
            <input 
              type="date" 
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-inner">
            <label className="block text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">
              {formData.language === 'ENG' ? 'TOTAL GROSS WEIGHT (KG)' : 'TOPLAM BRÜT KG'}
            </label>
            <input 
              type="number" 
              step="0.01"
              name="grossKg"
              value={formData.grossKg}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right font-mono"
            />
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-inner">
            <label className="block text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">
              {formData.language === 'ENG' ? 'TOTAL NET WEIGHT (KG)' : 'TOPLAM NET KG'}
            </label>
            <input 
              type="number" 
              step="0.01"
              name="netKg"
              value={formData.netKg}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right font-mono"
            />
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-inner">
            <label className="block text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">
              {formData.language === 'ENG' ? 'TOTAL SACKS' : 'TOPLAM ÇUVAL'}
            </label>
            <input 
              type="number" 
              name="sackCount"
              value={formData.sackCount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right font-mono"
            />
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-inner">
            <label className="block text-xs font-bold text-red-800 mb-2 uppercase tracking-wider">
              {formData.language === 'ENG' ? 'TOTAL ROLLS' : 'TOPLAM TOP'}
            </label>
            <input 
              type="number" 
              name="rollCount"
              value={formData.rollCount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 text-right font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12 mt-6 border-t border-slate-200">
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

    {itemToDelete !== null && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 mt-[-10vh]">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Emin misin Sahip?</h3>
            <p className="text-slate-500 mb-8 text-sm">Bu sipariş ürününü sildiğinizde geri alamazsınız.</p>
            
            <div className="flex gap-4 w-full">
               <button 
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors border border-slate-300"
               >
                 NEIN (Vazgeç)
               </button>
               <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors"
               >
                 YAVOL (Sil)
               </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
