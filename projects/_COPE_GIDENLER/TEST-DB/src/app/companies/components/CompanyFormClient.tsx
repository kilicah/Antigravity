"use client";

import { useState } from "react";
import Link from "next/link";
import { createCompany, updateCompany } from "../actions";

export default function CompanyFormClient({ initialData }: { initialData?: any }) {
  const isEditing = !!initialData?.id;
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive !== false : true);

  const [deliveryAddresses, setDeliveryAddresses] = useState(
    initialData?.deliveryAddressesJson
      ? JSON.parse(initialData.deliveryAddressesJson)
      : []
  );

  const [reps, setReps] = useState(
    initialData?.repsJson
      ? JSON.parse(initialData.repsJson)
      : []
  );

  const initialPhones = initialData?.phone ? initialData.phone.split(",").map((p: string) => p.trim()) : [""];
  const [phones, setPhones] = useState<string[]>(initialPhones);
  const addPhone = () => setPhones([...phones, ""]);
  const updatePhone = (index: number, val: string) => {
    const newP = [...phones];
    newP[index] = val;
    setPhones(newP);
  };
  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const addAddress = () => {
    setDeliveryAddresses([
      ...deliveryAddresses,
      { title: "", titleEn: "", address: "", addressEn: "", district: "", districtEn: "", city: "", cityEn: "", country: "", countryEn: "", zipCode: "", contactPerson: "", contactPersonEn: "", contactPhone: "", contactEmail: "" }
    ]);
  };

  const removeAddress = (index: number) => {
    setDeliveryAddresses(deliveryAddresses.filter((_: any, i: number) => i !== index));
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const newAddrs = [...deliveryAddresses];
    if (field === 'contactEmail') {
      newAddrs[index][field] = value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
    } else if (field === 'contactPhone' || field === 'zipCode') {
      newAddrs[index][field] = value;
    } else {
      newAddrs[index][field] = value.toLocaleUpperCase("tr-TR");
      newAddrs[index][`${field}En`] = formatEnglishField(value);
    }
    setDeliveryAddresses(newAddrs);
  };

  const addRep = () => {
    if (reps.length >= 10) return;
    setReps([...reps, { name: "", nameEn: "", title: "", titleEn: "", phone: "", email: "" }]);
  };

  const removeRep = (index: number) => {
    setReps(reps.filter((_: any, i: number) => i !== index));
  };

  const handleRepChange = (index: number, field: string, value: string) => {
    const newReps = [...reps];
    if (field === 'email') {
      newReps[index][field] = value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
    } else if (field === 'phone') {
      newReps[index][field] = value;
    } else if (field === 'name') {
      newReps[index][field] = value.toLocaleUpperCase("tr-TR");
      newReps[index]['nameEn'] = formatEnglishField(value);
    } else {
      newReps[index][field] = value.toLocaleUpperCase("tr-TR");
    }
    setReps(newReps);
  };

  const formatEnglishField = (text: string) => {
    if (!text) return "";
    let str = text;
    // Replace Turkish chars (both lower and upper)
    const trMap: Record<string, string> = { 
      'ç': 'C', 'ğ': 'G', 'ş': 'S', 'ö': 'O', 'ü': 'U', 'ı': 'I', 'i': 'I',
      'Ç': 'C', 'Ğ': 'G', 'Ş': 'S', 'Ö': 'O', 'Ü': 'U', 'İ': 'I', 'I': 'I'
    };
    str = str.replace(/[çğşöüıiÇĞŞÖÜİI]/g, m => trMap[m] || m).toUpperCase();
    
    // Address abbreviation rules
    str = str.replace(/\bMAHALLE(?:S[İI])?\b|\bMAH\.?/gi, 'MH.');
    str = str.replace(/\bCADDE(?:S[İI])?\b|\bCAD\.?/gi, 'CD.');
    str = str.replace(/\bSTREET\b|\bSTR\.?/gi, 'ST.');
    // Numara representations to NO.
    str = str.replace(/\bNUMARA\b|\bNUMBER\b|\bNO\s*[:\.]?/gi, 'NO.');
    
    // Fix spacing issues like "NO. 49" to "NO.49"
    str = str.replace(/NO\.\s+/g, 'NO.');

    return str;
  };

  const handleSyncField = (fieldName: string, value: string) => {
    const form = document.getElementById("company-form") as HTMLFormElement;
    if (!form) return;
    const target = form.elements.namedItem(`${fieldName}En`) as HTMLInputElement | HTMLTextAreaElement;
    if (target) {
      target.value = formatEnglishField(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("deliveryAddressesJson", JSON.stringify(deliveryAddresses));
    formData.append("repsJson", JSON.stringify(reps));
    
    if (isEditing) {
      await updateCompany(initialData.id, formData);
    } else {
      await createCompany(formData);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Roles */}
        <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
          
         <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between transition-colors ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <span className={`font-bold uppercase tracking-wider text-sm ${isActive ? 'text-emerald-700' : 'text-red-700'}`}>Firma Durumu:</span>
            <div className="flex gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="isActive_ui" value="true" className="peer sr-only" checked={isActive} 
                  onChange={() => { setIsActive(true); const el = document.getElementById("hidden_isActive") as HTMLInputElement | null; if(el) el.checked = true; }} />
                <div className="px-5 py-2 rounded-md border text-sm font-bold transition-all peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-700 bg-white text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm">
                  Aktif ✅
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="isActive_ui" value="false" className="peer sr-only" checked={!isActive} 
                  onChange={() => { setIsActive(false); const el = document.getElementById("hidden_isActive") as HTMLInputElement | null; if(el) el.checked = false; }} />
                <div className="px-5 py-2 rounded-md border text-sm font-bold transition-all peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-700 bg-white text-slate-600 border-slate-300 hover:bg-slate-50 shadow-sm">
                  Pasif ❌
                </div>
              </label>
            </div>
            {/* The actual hidden input we send to action.ts based on radio state */}
            <input type="checkbox" id="hidden_isActive" name="isActive" className="hidden" defaultChecked={isActive} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isSeller" defaultChecked={initialData?.isSeller} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Satıcı Firma</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isBuyer" defaultChecked={initialData ? initialData.isBuyer : true} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Alıcı Firma</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isShipTo" defaultChecked={initialData?.isShipTo} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Sevk Alıcısı Firma</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isBrand" defaultChecked={initialData?.isBrand} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Marka Firması</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isCustoms" defaultChecked={initialData?.isCustoms} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Gümrükleme Firması</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isLogistics" defaultChecked={initialData?.isLogistics} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Lojistik Firması</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isInsurance" defaultChecked={initialData?.isInsurance} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Sigorta Firması</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isAgency" defaultChecked={initialData?.isAgency} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Acenta Firması</span>
            </label>
          </div>
        </div>

        {/* Top Info (Firma Kodu) */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="w-1/3 md:w-1/4 mb-4">
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Firma Kodu📟</label>
            <input type="text" name="code" defaultValue={initialData?.code || ""} maxLength={10} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" placeholder="KOD (Max 10)" />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Firma Ünvanı <span className="text-red-500">*</span></label>
              <input type="text" name="name" defaultValue={initialData?.name} onChange={(e) => handleSyncField('name', e.target.value)} required className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" placeholder="YSK PAZARLAMA A.Ş." />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Adres 📫</label>
              <textarea name="address" defaultValue={initialData?.address || ""} onChange={(e) => handleSyncField('address', e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" placeholder="ADRES DETAYLARI"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">İlçe</label>
                <input type="text" name="district" defaultValue={initialData?.district || ""} onChange={(e) => handleSyncField('district', e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">İl</label>
                <input type="text" name="city" defaultValue={initialData?.city || ""} onChange={(e) => handleSyncField('city', e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Ülke</label>
                <input type="text" name="country" defaultValue={initialData?.country || ""} onChange={(e) => handleSyncField('country', e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Vergi Dairesi 🧾</label>
              <input type="text" name="taxOffice" defaultValue={initialData?.taxOffice || ""} onChange={(e) => handleSyncField('taxOffice', e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                COMPANY NAME
                <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">
                  ⚡EN
                </span>
              </label>
              <input type="text" name="nameEn" defaultValue={initialData?.nameEn || ""} readOnly className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" placeholder="YSK MARKETING INC." />
            </div>
            <div>
              <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                ADDRESS 📫
                <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">
                  ⚡EN
                </span>
              </label>
              <textarea name="addressEn" defaultValue={initialData?.addressEn || ""} readOnly rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" placeholder="ADDRESS DETAILS"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  DISTRICT
                  <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">⚡EN</span>
                </label>
                <input type="text" name="districtEn" defaultValue={initialData?.districtEn || ""} readOnly className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
              </div>
              <div>
                <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  CITY
                  <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">⚡EN</span>
                </label>
                <input type="text" name="cityEn" defaultValue={initialData?.cityEn || ""} readOnly className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
              </div>
              <div>
                <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                  COUNTRY
                  <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">⚡EN</span>
                </label>
                <input type="text" name="countryEn" defaultValue={initialData?.countryEn || ""} readOnly className="w-full px-3 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
              </div>
            </div>
            <div>
              <label className="flex items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
                TAX OFFICE 🧾
                <span className="ml-2 text-[8px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1 rounded border border-emerald-200">⚡EN</span>
              </label>
              <input type="text" name="taxOfficeEn" defaultValue={initialData?.taxOfficeEn || ""} readOnly className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
            </div>
          </div>
        </div>

        {/* Formalities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white border-b border-slate-200 pb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Vergi No 📇</label>
              <input type="text" name="taxNo" defaultValue={initialData?.taxNo || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Ticaret Sicil No</label>
              <input type="text" name="registrationNo" defaultValue={initialData?.registrationNo || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
            </div>
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Posta Kodu 🪧</label>
              <input type="text" name="zipCode" defaultValue={initialData?.zipCode || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-md uppercase text-base" />
            </div>
            <div className="col-span-3">
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">Firma E-Posta 📧</label>
              <input type="email" name="email" defaultValue={initialData?.email || ""} className="w-full px-4 py-2.5 border border-slate-300 rounded-md lowercase text-base" placeholder="info@firma.com" />
            </div>
          </div>
          <div>
            <label className="flex justify-between items-center text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              <span>Telefon ☎️</span>
              <button type="button" onClick={addPhone} className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors uppercase">
                + Yeni Telefon Ekle ☎️
              </button>
            </label>
            <div className="space-y-2">
              {phones.map((p, i) => (
                <div key={i} className="flex gap-2 relative">
                  <input type="tel" name="phone" value={p} onChange={e => updatePhone(i, e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-md text-base" placeholder="Örn: +90 555 5555555" />
                  {phones.length > 1 && (
                    <button type="button" onClick={() => removePhone(i)} className="px-3 text-red-500 hover:text-red-700 bg-red-50 border border-red-200 rounded-md absolute right-0 top-0 bottom-0 m-1">
                      Sil
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Teslimat / Depo Adresleri 📬</h2>
            <button type="button" onClick={addAddress} className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-4 rounded border border-indigo-200 transition-colors">
              + Sevk Adresi Ekle
            </button>
          </div>
          {deliveryAddresses.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Kayıtlı teslimat adresi bulunmuyor (Alıcı firmalar için sevk adresi olarak seçilebilir).</p>
          ) : (
            <div className="space-y-4">
              {deliveryAddresses.map((addr: any, index: number) => (
                <div key={index} className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-lg relative">
                  <button type="button" onClick={() => removeAddress(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1">
                    Sil
                  </button>
                  <h3 className="font-bold text-slate-500 text-xs mb-3 uppercase border-b border-indigo-200/50 pb-1">📩 - {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Turkish */}
                    <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Adres Başlığı</label>
                         <input type="text" required value={addr.title || ""} onChange={(e) => handleAddressChange(index, 'title', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" placeholder="Örn: Çorlu Depo" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Sevk Adresi 📦</label>
                         <textarea required value={addr.address || ""} onChange={(e) => handleAddressChange(index, 'address', e.target.value)} rows={2} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase"></textarea>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İlçe</label>
                          <input type="text" value={addr.district || ""} onChange={(e) => handleAddressChange(index, 'district', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İl</label>
                          <input type="text" value={addr.city || ""} onChange={(e) => handleAddressChange(index, 'city', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Ülke</label>
                          <input type="text" value={addr.country || ""} onChange={(e) => handleAddressChange(index, 'country', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İrtibat Kişisi 🙋🏿</label>
                        <input type="text" value={addr.contactPerson || ""} onChange={(e) => handleAddressChange(index, 'contactPerson', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" placeholder="İsim Soyisim" />
                      </div>
                    </div>

                    {/* Right: English Auto */}
                    <div className="space-y-4">
                      <div>
                         <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                           ADDRESS TITLE
                           <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                             ⚡EN
                           </span>
                         </label>
                         <input type="text" readOnly value={addr.titleEn || ""} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                      </div>
                      <div>
                         <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                           SHIPPING ADDRESS 📦
                           <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                             ⚡EN
                           </span>
                         </label>
                         <textarea readOnly value={addr.addressEn || ""} rows={2} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0"></textarea>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                            DISTRICT
                            <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                              ⚡EN
                            </span>
                          </label>
                          <input type="text" readOnly value={addr.districtEn || ""} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                        </div>
                        <div>
                          <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                            CITY
                            <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                              ⚡EN
                            </span>
                          </label>
                          <input type="text" readOnly value={addr.cityEn || ""} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                        </div>
                        <div>
                          <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                            COUNTRY
                            <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                              ⚡EN
                            </span>
                          </label>
                          <input type="text" readOnly value={addr.countryEn || ""} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                          CONTACT PERSON 🙋🏿
                          <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                            ⚡EN
                          </span>
                        </label>
                        <input type="text" readOnly value={addr.contactPersonEn || ""} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                      </div>
                    </div>
                  </div>

                   {/* Bottom Global Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-indigo-200/50">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Posta Kodu 🪧</label>
                      <input type="text" value={addr.zipCode || ""} onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Telefon 📱</label>
                      <input type="tel" value={addr.contactPhone || ""} onChange={(e) => handleAddressChange(index, 'contactPhone', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md uppercase" placeholder="Örn: +90 555 5555555" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">E-Posta 📧</label>
                      <input type="email" value={addr.contactEmail || ""} onChange={(e) => handleAddressChange(index, 'contactEmail', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md lowercase" placeholder="mail@ornek.com" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Representatives */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Firma Yetkilileri 🗿</h2>
            <button type="button" onClick={addRep} className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-4 rounded border border-indigo-200 transition-colors">
              + Yeni Yetkili Ekle
            </button>
          </div>
          {reps.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Kayıtlı yetkili bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {reps.map((r: any, index: number) => (
                <div key={index} className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-lg relative">
                  <button type="button" onClick={() => removeRep(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1">
                    Sil
                  </button>
                  <h3 className="font-bold text-slate-500 text-xs mb-3 uppercase border-b border-indigo-200/50 pb-1">🪪 - {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Turkish */}
                    <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Adı ve Soyadı</label>
                         <input type="text" required value={r.name || ""} onChange={(e) => handleRepChange(index, 'name', e.target.value)} className="w-full px-3 py-2 text-base border border-slate-300 rounded-md uppercase" placeholder="Örn: Ahmet Yılmaz" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Ünvanı / Departmanı 👔</label>
                         <input type="text" value={r.title || ""} onChange={(e) => handleRepChange(index, 'title', e.target.value)} className="w-full px-3 py-2 text-base border border-slate-300 rounded-md uppercase" placeholder="Örn: Finans Müdürü" />
                       </div>
                    </div>

                    {/* Right: English Auto & Notes */}
                    <div className="space-y-4">
                       <div>
                         <label className="flex items-center text-xs font-bold text-slate-600 mb-1 uppercase">
                           Name & Surname
                           <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 font-bold py-0.5 px-1.5 rounded border border-emerald-200">
                             ⚡EN
                           </span>
                         </label>
                         <input type="text" readOnly value={r.nameEn || ""} className="w-full px-3 py-2 text-base border border-slate-300 rounded-md uppercase bg-slate-50 text-slate-500 cursor-not-allowed focus:ring-0" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Özel Not 🗒️</label>
                         <input type="text" value={r.titleEn || ""} onChange={(e) => handleRepChange(index, 'titleEn', e.target.value)} className="w-full px-3 py-2 text-base border border-slate-300 rounded-md uppercase" placeholder="Örn: VIP Müşteri, Öncelikli İletişim..." />
                       </div>
                    </div>
                  </div>

                  {/* Bottom Global Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-indigo-200/50">
                     <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Telefon 📱</label>
                       <input type="tel" value={r.phone || ""} onChange={(e) => handleRepChange(index, 'phone', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md" placeholder="Örn: +90 555 5555555" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">E-Posta 📧</label>
                       <input type="email" value={r.email || ""} onChange={(e) => handleRepChange(index, 'email', e.target.value)} className="w-full px-3 py-2.5 text-base border border-slate-300 rounded-md lowercase" placeholder="mail@ornek.com" />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition-all shadow-md">
            Firmayı Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
