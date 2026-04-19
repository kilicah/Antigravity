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

export default function OrderEntryForm({ companies, products = [], initialData }: any) {
  const router = useRouter();
  
  const defaultFormState = {
    contractNo: "",
    contractDate: new Date().toISOString().split('T')[0],
    buyerPoNo: "",
    sellerId: "",
    buyerId: "",
    shipToId: "",
    brandId: "",
    agencyId: "",
    commission: "",
    sellerRep: "",
    buyerRep: "",
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
    accountingNotes: "",
    fabricDirection: "",
    partialShipmentAllowed: false,
    
    // Invoice details
    invoiceNo: "",
    invoiceDate: "",
    grossKg: "",
    netKg: "",
    rollCount: "",
    sackCount: "",
    customsCompanyId: "",
    logisticsCompanyId: "",
    insuranceCompanyId: "",
  };

  // Safely initialize form data, replacing nulls with empty strings to prevent React input errors
  const [formData, setFormData] = useState(() => {
    if (!initialData) return defaultFormState;
    const sanitized: any = { ...initialData };
    for (const key in defaultFormState) {
      if (sanitized[key] === null || sanitized[key] === undefined) {
        sanitized[key] = defaultFormState[key as keyof typeof defaultFormState];
      }
    }
    return sanitized;
  });

  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [contractPrefix, setContractPrefix] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [buyerVariants, setBuyerVariants] = useState<any[]>([]);

  useEffect(() => {
    if (formData.buyerId) {
      fetch(`/api/companies/${formData.buyerId}/variants`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBuyerVariants(data);
        })
        .catch(err => console.error("Variants fetch error:", err));
    } else {
      setBuyerVariants([]);
    }
  }, [formData.buyerId]);


  // Ensure dates from DB are properly formatted for inputs if editing
  useEffect(() => {
    if (initialData) {
      if (initialData.contractNo) {
        setContractPrefix(initialData.contractNo.slice(0, -5));
      }
      setFormData((prev: any) => ({
        ...prev,
        // Parse Dates
        contractNo: initialData.contractNo ? initialData.contractNo.slice(-5) : prev.contractNo,
        contractDate: initialData.contractDate ? new Date(initialData.contractDate).toISOString().split('T')[0] : prev.contractDate,
        agencyId: initialData.agencyId?.toString() || "",
        commission: initialData.commission || "",
        tolerance: initialData.tolerance || "5%",
        exMillDate: initialData.productionOrder?.exMillDate ? new Date(initialData.productionOrder.exMillDate).toISOString().split('T')[0] : prev.exMillDate,
        bulkDate: initialData.productionOrder?.bulkDate ? new Date(initialData.productionOrder.bulkDate).toISOString().split('T')[0] : prev.bulkDate,
        invoiceDate: initialData.invoice?.invoiceDate ? new Date(initialData.invoice.invoiceDate).toISOString().split('T')[0] : prev.invoiceDate,
        language: initialData.language || "TR",
        deliveryDestination: initialData.deliveryDestination || "",
        
        // Production Order
        packingInstructions: initialData.productionOrder?.packingInstructions || "",
        accountingNotes: initialData.accountingNotes || "",
        fabricDirection: initialData.productionOrder?.fabricDirection || "",
        partialShipmentAllowed: initialData.productionOrder?.partialShipmentAllowed || false,
        
        // Order and Invoice
        unit: initialData.unit || "MT",
        invoiceNo: initialData.invoice?.invoiceNo || "",
        grossKg: initialData.invoice?.grossKg?.toString() || "",
        netKg: initialData.invoice?.netKg?.toString() || "",
        rollCount: initialData.invoice?.rollCount?.toString() || "",
        sackCount: initialData.invoice?.sackCount?.toString() || "",
        customsCompanyId: initialData.invoice?.customsCompanyId?.toString() || "",
        logisticsCompanyId: initialData.invoice?.logisticsCompanyId?.toString() || "",
        insuranceCompanyId: initialData.invoice?.insuranceCompanyId?.toString() || "",
      }));
    } else {
      // IF NEW ORDER -> Fetch User Initials + Next No
      (async () => {
        try {
          const meRes = await fetch('/api/auth/me');
          let prefix = "";
          if (meRes.ok) {
            const data = await meRes.json();
            if (data?.user) {
               if (data.user.initials) {
                 prefix = data.user.initials;
               } else if (data.user.fullName) {
                 prefix = data.user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase() + '.';
               }
            }
          }
          
          setContractPrefix(prefix);
          
          const nextRes = await fetch(`/api/orders/next-no?prefix=${encodeURIComponent(prefix)}`);
          let nextNo = "00001";
          if (nextRes.ok) {
             const nData = await nextRes.json();
             if (nData.nextNo) nextNo = nData.nextNo;
          }
          
          setFormData((prev: any) => ({ ...prev, contractNo: nextNo }));
        } catch(e) {}
      })();
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
    ldDetail: "",
    ppsRequest: false,
    topsRequest: false,
    srlRequest: "WAIT",
    srlDetail: "",
    fdRequest: false,
    pshpRequest: false,
    susRequest: false,
    ltRequest: "WAIT",
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

    // Her metin alanı için otomatik büyük harf (Türkçe kurallarına göre)
    let finalValue = value;
    if (typeof value === 'string' && type !== 'date' && type !== 'number' && name !== 'language' && name !== 'currency' && name !== 'unit') {
      finalValue = value.toLocaleUpperCase('tr-TR');
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items];
    
    let finalValue = value;
    if (typeof value === 'string' && !['quantity', 'unitPrice', 'weight', 'width', 'apQuantity'].includes(field)) {
      finalValue = value.toLocaleUpperCase('tr-TR');
    }
    
    newItems[index] = { ...newItems[index], [field]: finalValue };
    
    // Auto calculate total amount
    if (field === 'quantity' || field === 'unitPrice') {
      const gty = field === 'quantity' ? Number(value) : Number(newItems[index].quantity);
      const price = field === 'unitPrice' ? Number(value) : Number(newItems[index].unitPrice);
      newItems[index].totalAmount = gty * price;
    }

    // Auto-fill from buyer variants
    if (field === 'buyerModelName' || field === 'colorCode' || field === 'qualityName') {
      const qN = newItems[index].qualityName;
      const bM = newItems[index].buyerModelName;
      const cC = newItems[index].colorCode;

      if (qN) {
        let match = buyerVariants.find((v: any) => v.qualityName === qN && v.buyerModelName === bM && v.colorCode === cC);
        
        if (!match && field === 'buyerModelName' && bM) {
           match = buyerVariants.find((v: any) => v.qualityName === qN && v.buyerModelName === bM);
        }
        
        if (match) {
          if (match.colorCode && field !== 'colorCode') newItems[index].colorCode = match.colorCode;
          if (match.composition) newItems[index].composition = match.composition;
          if (match.weight) newItems[index].weight = match.weight;
          if (match.width) newItems[index].width = match.width;
        }
      }
    }
    
    setItems(newItems);
  };

  const handleProductAutoFill = (index: number, productName: string) => {
    const newItems = [...items];
    let finalValue = productName.toLocaleUpperCase('tr-TR');
    newItems[index] = { ...newItems[index], qualityName: finalValue };

    const foundProduct = products?.find((p: any) => p.name.toLocaleUpperCase('tr-TR') === finalValue);
    if (foundProduct) {
      if(foundProduct.code) newItems[index].qualityCode = foundProduct.code;
      if(foundProduct.composition) newItems[index].composition = foundProduct.composition.toLocaleUpperCase('tr-TR');
      if(foundProduct.weight) newItems[index].weight = foundProduct.weight;
      if(foundProduct.width) newItems[index].width = foundProduct.width;
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
      srlRequest: 'WAIT',
      srlDetail: "",
      fdRequest: false,
      pshpRequest: false,
      susRequest: false,
      ltRequest: 'WAIT',
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
          contractNo: contractPrefix + formData.contractNo,
          // Convert empty dates to null if needed
          sellerId: parseInt(formData.sellerId),
          buyerId: parseInt(formData.buyerId),
          shipToId: formData.shipToId ? parseInt(formData.shipToId) : null,
          brandId: formData.brandId ? parseInt(formData.brandId) : null,
          agencyId: formData.agencyId ? parseInt(formData.agencyId) : null,
          commission: formData.commission || null,
          sellerRep: formData.sellerRep || null,
          buyerRep: formData.buyerRep || null,
          tolerance: formData.tolerance || null,
          accountingNotes: formData.accountingNotes || null,
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
             customsCompanyId: formData.customsCompanyId ? parseInt(formData.customsCompanyId) : null,
             logisticsCompanyId: formData.logisticsCompanyId ? parseInt(formData.logisticsCompanyId) : null,
             insuranceCompanyId: formData.insuranceCompanyId ? parseInt(formData.insuranceCompanyId) : null,
          }
        })
      });

      if (response.ok) {
        router.push('/orders');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorModalMsg(errorData.error || `Sistem Hatası: Kod ${response.status}`);
        setErrorModalOpen(true);
      }
    } catch (error: any) {
      console.error(error);
      setErrorModalMsg(error.message || "Sistem hatası meydana geldi.");
      setErrorModalOpen(true);
    }
  };

  const orderTotal = items.reduce((sum: number, item: any) => sum + item.totalAmount, 0);

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
      {/* GENEL BİLGİLER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold bg-slate-100 p-3 rounded-lg text-slate-700 mb-6 border border-slate-200">
          {formData.language === 'ENG' ? 'ORDER GENERAL INFORMATION' : 'SIPARIS GENEL BILGILERI'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-[11px] uppercase font-bold text-indigo-500 tracking-wider mb-1.5">
              {formData.language === 'ENG' ? 'ORDER NO' : 'SİPARİŞ NO'} <span className="text-red-500">*</span>
            </label>
            <div className="flex w-full ring-2 ring-indigo-200 rounded-md focus-within:ring-indigo-500 overflow-hidden text-base">
              <div className="flex items-center justify-center bg-indigo-50 px-3 text-indigo-700 font-bold border-r border-indigo-200 whitespace-nowrap">
                {contractPrefix || "..."}
              </div>
              <input 
                type="text" 
                name="contractNo" 
                required
                maxLength={5}
                value={formData.contractNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 focus:outline-none font-bold text-slate-800 bg-white placeholder-slate-300 tracking-widest text-center"
                placeholder="00001"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              {formData.language === 'ENG' ? 'DATE' : 'TARIH'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="contractDate" 
              required
              value={formData.contractDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
           <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              {formData.language === 'ENG' ? 'BUYER PO NO' : 'ALICI PO NO'}
            </label>
            <input 
              type="text" 
              name="buyerPoNo" 
              value={formData.buyerPoNo}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase text-base"
              placeholder="Eğer Varsa"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'SELLER' : 'SATICI'} <span className="text-red-500">*</span>
                </label>
                 <select 
                  name="sellerId" 
                  required
                  value={formData.sellerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                  <option value="">-- Firma Seç --</option>
                  {companies
                    .filter((c: any) => c.isSeller)
                    .map((c: any) => <option key={c.id} value={c.id}>{formData.language === 'ENG' && c.nameEn ? c.nameEn : c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'SELLER REPRESENTATIVE' : 'SATICI TEMSILCISI'}
                </label>
                <select 
                  name="sellerRep" 
                  value={formData.sellerRep}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                  <option value="">-- Temsilci Seç --</option>
                  {(() => {
                    const comp = companies.find((c: any) => c.id.toString() === formData.sellerId?.toString());
                    if (!comp || !comp.repsJson) return null;
                    try {
                      const reps = JSON.parse(comp.repsJson);
                      return reps.map((r: any, idx: number) => {
                        const rawName = r.name || "";
                        const nameTr = rawName.includes('|') ? rawName.split('|')[0] : rawName;
                        const defaultEn = rawName.includes('|') ? rawName.split('|')[1] : "";
                        const nameEn = r.nameEn || defaultEn || nameTr;
                        const val = nameEn ? `${nameTr}|${nameEn}` : nameTr;
                        const display = (formData.language === 'ENG' && nameEn) ? nameEn : nameTr;
                        return <option key={idx} value={val}>{display}</option>;
                      });
                    } catch(e) { return null; }
                  })()}
                </select>
             </div>
          </div>
          
          <div className="space-y-4">
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'BUYER' : 'ALICI'} <span className="text-red-500">*</span>
                </label>
                <select 
                  name="buyerId" 
                  required
                  value={formData.buyerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                   <option value="">-- Firma Seç --</option>
                   {companies
                     .filter((c: any) => c.isBuyer)
                     .map((c: any) => <option key={c.id} value={c.id}>{formData.language === 'ENG' && c.nameEn ? c.nameEn : c.name}</option>)
                   }
                </select>
             </div>
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'BUYER REPRESENTATIVE' : 'ALICI TEMSILCISI'}
                </label>
                <select 
                  name="buyerRep" 
                  value={formData.buyerRep}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                   <option value="">-- Temsilci Seç --</option>
                  {(() => {
                    const comp = companies.find((c: any) => c.id.toString() === formData.buyerId?.toString());
                    if (!comp || !comp.repsJson) return null;
                    try {
                      const reps = JSON.parse(comp.repsJson);
                      return reps.map((r: any, idx: number) => {
                        const rawName = r.name || "";
                        const nameTr = rawName.includes('|') ? rawName.split('|')[0] : rawName;
                        const defaultEn = rawName.includes('|') ? rawName.split('|')[1] : "";
                        const nameEn = r.nameEn || defaultEn || nameTr;
                        const val = nameEn ? `${nameTr}|${nameEn}` : nameTr;
                        const display = (formData.language === 'ENG' && nameEn) ? nameEn : nameTr;
                        return <option key={idx} value={val}>{display}</option>;
                      });
                    } catch(e) { return null; }
                  })()}
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'SHIP TO' : 'SEVK ADRESI'}
                </label>
                <select 
                  name="shipToId" 
                  value={formData.shipToId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                  <option value="">-- (Alıcı Firma İle Aynı) --</option>
                  {companies
                    .filter((c: any) => c.isShipTo || c.isBuyer || c.isLogistics)
                    .map((c: any) => <option key={c.id} value={c.id}>{formData.language === 'ENG' && c.nameEn ? c.nameEn : c.name}</option>)
                  }
                </select>
             </div>
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'RELATED BRAND' : 'ILGILI MARKA'}
                </label>
                <select 
                  name="brandId" 
                  value={formData.brandId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                  <option value="">-- Marka Seç --</option>
                  {companies
                    .filter((c: any) => c.isBrand)
                    .map((c: any) => <option key={c.id} value={c.id}>{formData.language === 'ENG' && c.nameEn ? c.nameEn : c.name}</option>)
                  }
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  {formData.language === 'ENG' ? 'RELATED AGENCY' : 'İLGİLİ ACENTA'}
                </label>
                <select 
                  name="agencyId" 
                  value={formData.agencyId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-base"
                >
                  <option value="">-- Acenta Seç --</option>
                  {companies
                    .filter((c: any) => c.isAgency)
                    .map((c: any) => <option key={c.id} value={c.id}>{formData.language === 'ENG' && c.nameEn ? c.nameEn : c.name}</option>)
                  }
                </select>
             </div>
             
             {formData.agencyId && (
               <div className="animate-in fade-in duration-300">
                  <label className="block text-[11px] uppercase font-bold text-fuchsia-700 tracking-wider mb-1.5">
                    {formData.language === 'ENG' ? 'SALES COMMISSION' : 'SATIŞ KOMİSYONU'}
                  </label>
                  <input 
                    type="text" 
                    name="commission"
                    value={formData.commission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-fuchsia-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-fuchsia-50/30 text-base"
                    placeholder={formData.language === 'ENG' ? 'e.g. 5% or 1000 USD' : 'Örn: %5 veya 1000 USD'}
                  />
               </div>
             )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-200 mt-6">
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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
                <div className="animate-in fade-in slide-in-from-top-1 bg-blue-50/50 p-3 rounded-md border border-blue-200 space-y-3">
                  {(() => {
                    const shipCompanyId = formData.shipToId || formData.buyerId;
                    const shipCompany = companies.find((c: any) => c.id.toString() === shipCompanyId?.toString());
                    let addrs: any[] = [];
                    try {
                      if (shipCompany?.deliveryAddressesJson) {
                        addrs = JSON.parse(shipCompany.deliveryAddressesJson);
                      }
                    } catch(e) {}
                    
                    if (addrs.length > 0) {
                      return (
                        <div>
                          <label className="block text-xs font-semibold text-indigo-800 mb-1.5 uppercase tracking-wide">
                            Kayıtlı Adreslerden Seç (Opsiyonel)
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const selected = addrs[parseInt(e.target.value)];
                              if (selected) {
                                let parts = [`${selected.title} - ${selected.address} ${selected.district}/${selected.city} ${selected.country}`];
                                if (selected.zipCode) parts[0] += ` ${selected.zipCode}`;
                                
                                let contactParts = [];
                                if (selected.contactPerson) contactParts.push(`YETKİLİ: ${selected.contactPerson}`);
                                if (selected.contactPhone) contactParts.push(`TEL: ${selected.contactPhone}`);
                                if (selected.contactEmail) contactParts.push(`E-POSTA: ${selected.contactEmail}`);
                                
                                if (contactParts.length > 0) parts.push(contactParts.join(" | "));
                                
                                const fullAddr = parts.join("\n").toUpperCase();
                                setFormData({...formData, deliveryDestination: fullAddr});
                              }
                            }}
                          >
                            <option value="">-- Kayıtlı Depo/Adres Seç --</option>
                            {addrs.map((a, idx) => (
                              <option key={idx} value={idx}>{a.title} ({a.city})</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div>
                    <label className="block text-xs font-semibold text-blue-800 mb-1.5 uppercase tracking-wide">
                      {(formData.deliveryTerms?.startsWith("FCA") || formData.deliveryTerms?.startsWith("CIF")) ? "Yükleme Limanı" : "Varış Şehri / Açık Adres"} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="deliveryDestination" 
                      value={formData.deliveryDestination}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 placeholder-slate-400 font-medium uppercase text-sm"
                      placeholder={(formData.deliveryTerms?.startsWith("FCA") || formData.deliveryTerms?.startsWith("CIF")) ? "Örn: AMBARLI LİMANI, TR" : "Örn: LONDRA, UK veya AÇIK ADRES"}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
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

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {formData.language === 'ENG' ? 'ORDER NOTES' : 'SİPARİŞ NOTLARI'}
              </label>
              <textarea 
                name="packingInstructions" 
                value={formData.packingInstructions}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400"
                placeholder="Üretim, sevkiyat veya işlemler için sipariş notlarınızı girebilirsiniz..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-700 mb-2">
                {formData.language === 'ENG' ? 'ACCOUNTING NOTES' : 'MUHASEBE NOTLARI'}
              </label>
              <textarea 
                name="accountingNotes" 
                value={formData.accountingNotes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2.5 text-base border border-amber-300 bg-amber-50 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none placeholder-amber-400"
                placeholder="Muhasebe fişinde görünecek notları girebilirsiniz..."
              />
            </div>
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

        <datalist id="productsList">
           {products?.map((p: any) => (
             <option key={p.id} value={p.name} />
           ))}
        </datalist>

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
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-center ">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BULK SAMPLE DELIVERY DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B/S-DD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-[90px] border-r border-slate-700 text-right text-emerald-300">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BULK SAMPLE QUANTITY</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B/S-Q</span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-32 border-r border-slate-700 text-center ">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">EX-MILL DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">ExMD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold w-12 text-center border-r border-slate-700 text-red-400">
                  {formData.language === 'ENG' ? 'DEL' : 'SIL'}
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-l-2 border-r border-sky-600 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">ESTIMATED DATE OF DEPARTURE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">ETD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">FDS FORM SENT?</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">FDS</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">COUNTER SAMPLE APPLY?</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">C/S</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">COUNTER SAMPLE SENT DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">C/S-SD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">COUNTER SAMPLE APPROVAL DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">C/S-AD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">LAB DIP SENT DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">L/D-SD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">LAB DIP SAMPLE APPROVAL DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">L/D-AD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BULK SENT DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B/S-SD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-sky-800 bg-sky-900/50 text-sky-300 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BULK APPROVAL DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B/S-AD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[90px] border-l-2 border-r border-green-600 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">MILL PRODUCTION APPROVAL</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">M.PA</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">DESIGNER PRODUCTION APPROVAL</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">D.PA</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[90px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">REFERENCE SAMPLE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">R/S</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">REFERENCE SAMPLE SENT MILL</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">R/S-MS</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BUYER'S REFERENCE SAMPLE SENT MILL</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B.S-MS</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BUYER'S LABORATORY TEST RECEIVED DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B.LT-RD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BUYER'S LABORATORY TEST MILL SENT</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B.LT-MS</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BUYER'S LABORATORY TEST MILL APPROVED</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B.LT-MA</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">LABORATORY TEST APPROVED</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">LT-AD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[130px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">BUYER'S SHIPMENT APPROVAL DATE</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">B.SAD</span>
                  </div>
                </th>
                <th className="p-3 font-semibold min-w-[70px] border-r border-green-800 bg-green-900/50 text-green-400 text-center">
                  <div className="flex flex-col items-center justify-between h-full space-y-1">
                    <span className="text-[9px] font-bold opacity-100 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">PACKING LIST</span>
                    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">PL</span>
                  </div>
                </th>
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
                  <td className="p-1.5 focus-within:bg-blue-50 relative">
                    <input 
                      type="text" 
                      list={`buyerModelsList_${index}`}
                      value={item.buyerModelName || ''} 
                      onChange={(e) => handleItemChange(index, "buyerModelName", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[100px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <datalist id={`buyerModelsList_${index}`}>
                      {buyerVariants
                        .filter((v: any) => v.qualityName === item.qualityName && v.buyerModelName)
                        .map((v: any) => v.buyerModelName)
                        .filter((val, i, arr) => arr.indexOf(val) === i)
                        .map((val: string, i: number) => <option key={i} value={val} />)
                      }
                    </datalist>
                  </td>
                  <td className="p-1.5">
                    <input 
                      type="text" 
                      list="productsList"
                      value={item.qualityName || ''} 
                      onChange={(e) => handleProductAutoFill(index, e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Ürün Seç ve Yaz"
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
                  <td className="p-1.5 relative">
                    <input 
                      type="text" 
                      list={`colorCodesList_${index}`}
                      value={item.colorCode || ''} 
                      onChange={(e) => handleItemChange(index, "colorCode", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[130px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <datalist id={`colorCodesList_${index}`}>
                      {buyerVariants
                        .filter((v: any) => v.qualityName === item.qualityName && v.buyerModelName === item.buyerModelName && v.colorCode)
                        .map((v: any) => v.colorCode)
                        .filter((val, i, arr) => arr.indexOf(val) === i)
                        .map((val: string, i: number) => <option key={i} value={val} />)
                      }
                    </datalist>
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
                  <td className="p-1.5 border-l border-slate-200 relative group">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      value={item.quantity || ''} 
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)} 
                      className="w-full px-2 py-1.5 min-w-[70px] text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right font-mono" 
                    />
                    {(() => {
                       if(item.quantity && Number(item.quantity) > 0) {
                          const associatedProduct = products?.find((p:any) => p.name.toLocaleUpperCase('tr-TR') === (item.qualityName || '').toLocaleUpperCase('tr-TR'));
                          if(associatedProduct) {
                             const qty = Number(item.quantity);
                             let warning = null;
                             if(associatedProduct.tMoq > 0 && qty < associatedProduct.tMoq) {
                                warning = `T.MOQ Altında! (Min: ${associatedProduct.tMoq})`;
                             } else if(associatedProduct.mcq > 0 && qty < associatedProduct.mcq) {
                                warning = `K.MOQ (MCQ) Altında! (Min: ${associatedProduct.mcq})`;
                             } else if(associatedProduct.minOrderQty > 0 && qty < associatedProduct.minOrderQty && !associatedProduct.tMoq && !associatedProduct.mcq) {
                                warning = `MOQ Altında! (Min: ${associatedProduct.minOrderQty})`;
                             }
                             
                             if(warning) {
                               return (
                                 <div className="absolute top-full left-0 right-0 mt-0.5 z-20 text-[9px] text-red-600 font-bold leading-tight bg-red-50 p-1 rounded border border-red-200 whitespace-normal hidden group-hover:block transition-all shadow-md">
                                   ⚠️ {warning}
                                 </div>
                               );
                             }
                          }
                       }
                       return null;
                    })()}
                  </td>
                  <td className="p-1.5 bg-slate-50 border-x border-slate-200 relative group">
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
                      <label className="flex items-center gap-1 cursor-pointer border-t border-slate-200 pt-1">
                        <input type="checkbox" checked={item.ppsRequest || false} onChange={(e) => handleItemChange(index, "ppsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Pre-Production Sample" className="cursor-help border-b border-dotted border-slate-400">PPS</span>
                      </label>
                      <div className="flex flex-row gap-2 justify-between items-center mt-1 mb-0 border-t border-slate-200 pt-1 pb-1">
                        <span title="Lab Dip" className="cursor-help border-b border-dotted border-slate-400 font-medium text-blue-800">L/D</span>
                        <select 
                          value={item.ldRequest || 'WAIT'} 
                          onChange={(e) => handleItemChange(index, "ldRequest", e.target.value)}
                          className={`w-[65px] px-1 py-1 rounded text-[11px] font-bold border ${
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
                      {item.ldRequest === 'YES' && (
                        <input type="text" value={item.ldDetail || ''} onChange={(e) => handleItemChange(index, "ldDetail", e.target.value)} placeholder="L/D Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs mb-1" />
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top min-w-[140px]">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.topsRequest || false} onChange={(e) => handleItemChange(index, "topsRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Top of Production Sample" className="cursor-help border-b border-dotted border-slate-400">TOPS</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer border-t border-slate-200 pt-1">
                        <input type="checkbox" checked={item.fdRequest || false} onChange={(e) => handleItemChange(index, "fdRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Fabric Direction" className="cursor-help border-b border-dotted border-slate-400">FD</span>
                      </label>
                      <div className="flex flex-row gap-2 justify-between items-center mt-1 mb-0 border-t border-slate-200 pt-1 pb-1">
                        <span title="Specific Roll Label" className="cursor-help border-b border-dotted border-slate-400 font-medium text-blue-800">SRL</span>
                        <select 
                          value={item.srlRequest || 'WAIT'} 
                          onChange={(e) => handleItemChange(index, "srlRequest", e.target.value)}
                          className={`w-[65px] px-1 py-1 rounded text-[11px] font-bold border ${
                            item.srlRequest === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                            item.srlRequest === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="YES">YES</option>
                          <option value="WAIT">WAIT</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                      {item.srlRequest === 'YES' && (
                        <input type="text" value={item.srlDetail || ''} onChange={(e) => handleItemChange(index, "srlDetail", e.target.value)} placeholder="SRL Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs mb-1" />
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-l border-slate-200 align-top min-w-[140px]">
                    <div className="flex flex-col gap-1.5 text-xs text-slate-700">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={item.pshpRequest || false} onChange={(e) => handleItemChange(index, "pshpRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Partial Shipment" className="cursor-help border-b border-dotted border-slate-400">PSHP</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer border-t border-slate-200 pt-1">
                        <input type="checkbox" checked={item.susRequest || false} onChange={(e) => handleItemChange(index, "susRequest", e.target.checked as boolean)} className="rounded text-blue-600" />
                        <span title="Sustainability" className="cursor-help border-b border-dotted border-slate-400">SUS</span>
                      </label>
                      <div className="flex flex-row gap-2 justify-between items-center mt-1 mb-0 border-t border-slate-200 pt-1 pb-1">
                        <span title="Laboratory Test" className="cursor-help border-b border-dotted border-slate-400 font-medium text-blue-800">LT</span>
                        <select 
                          value={item.ltRequest || 'WAIT'} 
                          onChange={(e) => handleItemChange(index, "ltRequest", e.target.value)}
                          className={`w-[65px] px-1 py-1 rounded text-[11px] font-bold border ${
                            item.ltRequest === 'YES' ? 'bg-green-100 text-green-700 border-green-300' :
                            item.ltRequest === 'NO' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="YES">YES</option>
                          <option value="WAIT">WAIT</option>
                          <option value="NO">NO</option>
                        </select>
                      </div>
                      {item.ltRequest === 'YES' && (
                        <input type="text" value={item.ltDetail || ''} onChange={(e) => handleItemChange(index, "ltDetail", e.target.value)} placeholder="LT Açıklama..." className="w-full px-1 py-1 border border-slate-300 rounded text-xs mb-1" />
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

    {errorModalOpen && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Eyvah, Bir Sorun Var!</h3>
            <p className="text-slate-600 mb-6 bg-slate-50 border border-slate-200 w-full p-3 rounded-lg text-sm text-center break-words font-mono">
              {errorModalMsg}
            </p>
            <button 
              onClick={() => setErrorModalOpen(false)}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Tamam, Kapat
            </button>
          </div>
        </div>
      </div>
    )}

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
                className="flex-1 px-4 py-2.5.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors border border-slate-300 text-base"
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
