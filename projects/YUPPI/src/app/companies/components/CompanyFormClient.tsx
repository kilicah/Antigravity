"use client";

import { useState } from "react";
import Link from "next/link";
import { createCompany, updateCompany } from "../actions";

export default function CompanyFormClient({ initialData }: { initialData?: any }) {
  const isEditing = !!initialData?.id;

  const [deliveryAddresses, setDeliveryAddresses] = useState(
    initialData?.deliveryAddressesJson
      ? JSON.parse(initialData.deliveryAddressesJson)
      : []
  );

  const addAddress = () => {
    setDeliveryAddresses([
      ...deliveryAddresses,
      { title: "", address: "", district: "", city: "", country: "", zipCode: "", contactPerson: "", contactPhone: "", contactEmail: "" }
    ]);
  };

  const removeAddress = (index: number) => {
    setDeliveryAddresses(deliveryAddresses.filter((_: any, i: number) => i !== index));
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const newAddrs = [...deliveryAddresses];
    newAddrs[index][field] = value.toLocaleUpperCase("tr-TR");
    setDeliveryAddresses(newAddrs);
  };

  const copyTurkishToEnglish = () => {
    const form = document.getElementById("company-form") as HTMLFormElement;
    if (!form) return;
    
    const fields = ["name", "address", "district", "city", "country", "taxOffice"];
    fields.forEach((f) => {
      const src = form.elements.namedItem(f) as HTMLInputElement;
      const target = form.elements.namedItem(`${f}En`) as HTMLInputElement;
      if (src && target) {
        target.value = src.value.toUpperCase();
      }
    });

    // Manually trigger a UI flash or alert to confirm optionally
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("deliveryAddressesJson", JSON.stringify(deliveryAddresses));
    
    if (isEditing) {
      await updateCompany(initialData.id, formData);
    } else {
      await createCompany(formData);
    }
  };

  const reps = initialData?.repsJson ? JSON.parse(initialData.repsJson) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Roles */}
        <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Firma Rolleri</h2>
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

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Türkçe Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Firma Kodu</label>
                <input type="text" name="code" defaultValue={initialData?.code || ""} maxLength={10} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" placeholder="KOD (Max 10)" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Firma Adı <span className="text-red-500">*</span></label>
                <input type="text" name="name" defaultValue={initialData?.name} required className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" placeholder="YSK PAZARLAMA A.Ş." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
              <textarea name="address" defaultValue={initialData?.address || ""} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" placeholder="ADRES DETAYLARI"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                <input type="text" name="district" defaultValue={initialData?.district || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
                <input type="text" name="city" defaultValue={initialData?.city || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ülke</label>
                <input type="text" name="country" defaultValue={initialData?.country || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Dairesi</label>
              <input type="text" name="taxOffice" defaultValue={initialData?.taxOffice || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h2 className="text-lg font-bold text-slate-800">English Info (İngilizce)</h2>
              <button 
                type="button" 
                onClick={copyTurkishToEnglish}
                className="text-xs bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold py-1 px-3 rounded border border-slate-200 transition-colors flex items-center gap-1"
              >
                <span>🇹🇷</span> Türkçe Bilgilerini Kopyala
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input type="text" name="nameEn" defaultValue={initialData?.nameEn || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" placeholder="YSK MARKETING INC." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea name="addressEn" defaultValue={initialData?.addressEn || ""} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" placeholder="ADDRESS DETAILS"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <input type="text" name="districtEn" defaultValue={initialData?.districtEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input type="text" name="cityEn" defaultValue={initialData?.cityEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input type="text" name="countryEn" defaultValue={initialData?.countryEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax Office</label>
              <input type="text" name="taxOfficeEn" defaultValue={initialData?.taxOfficeEn || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
            </div>
          </div>
        </div>

        {/* Formalities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-white">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Num. / VAT No</label>
              <input type="text" name="taxNo" defaultValue={initialData?.taxNo || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ticaret Sicil No</label>
              <input type="text" name="registrationNo" defaultValue={initialData?.registrationNo || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu / Zip</label>
              <input type="text" name="zipCode" defaultValue={initialData?.zipCode || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon / Phone</label>
              <input type="tel" name="phone" defaultValue={initialData?.phone || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md" placeholder="+90 555 123 4567" />
            </div>
        </div>

        {/* Delivery Addresses */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Teslimat / Depo Adresleri</h2>
            <button type="button" onClick={addAddress} className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-4 rounded border border-indigo-200 transition-colors">
              + Yeni Adres Ekle
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Adres Başlığı (Örn: Çorlu Depo)</label>
                       <input type="text" required value={addr.title} onChange={(e) => handleAddressChange(index, 'title', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Açık Adres</label>
                       <textarea required value={addr.address} onChange={(e) => handleAddressChange(index, 'address', e.target.value)} rows={2} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase"></textarea>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:col-span-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İlçe</label>
                        <input type="text" value={addr.district} onChange={(e) => handleAddressChange(index, 'district', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İl</label>
                        <input type="text" value={addr.city} onChange={(e) => handleAddressChange(index, 'city', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Ülke</label>
                        <input type="text" value={addr.country} onChange={(e) => handleAddressChange(index, 'country', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Posta Kodu</label>
                        <input type="text" value={addr.zipCode || ""} onChange={(e) => handleAddressChange(index, 'zipCode', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:col-span-2 pt-2 border-t border-indigo-200/50 mt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">İrtibat Kişisi (Yetkili)</label>
                        <input type="text" value={addr.contactPerson || ""} onChange={(e) => handleAddressChange(index, 'contactPerson', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" placeholder="İsim Soyisim" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Telefon</label>
                        <input type="tel" value={addr.contactPhone || ""} onChange={(e) => handleAddressChange(index, 'contactPhone', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md uppercase" placeholder="Örn: 0555..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">E-Posta</label>
                        <input type="email" value={addr.contactEmail || ""} onChange={(e) => handleAddressChange(index, 'contactEmail', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md lowercase" placeholder="mail@ornek.com" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Representatives */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Firma Yetkilileri (Maks 10 Kişi)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(10)].map((_, i) => {
                const r = reps[i] || {};
                return (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-slate-500 text-xs mb-2 uppercase">Yetkili {i + 1}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name={`rep${i+1}_name`} defaultValue={r.name || ""} className="w-full px-2 py-1 text-sm border rounded uppercase" placeholder="Ad Soyad (TR)" />
                    <input type="text" name={`rep${i+1}_nameEn`} defaultValue={r.nameEn || ""} className="w-full px-2 py-1 text-sm border rounded uppercase" placeholder="Name Surname (EN)" />
                    <input type="text" name={`rep${i+1}_title`} defaultValue={r.title || ""} className="w-full px-2 py-1 text-sm border rounded uppercase" placeholder="Görevi" />
                    <input type="tel" name={`rep${i+1}_phone`} defaultValue={r.phone || ""} className="w-full px-2 py-1 text-sm border rounded" placeholder="Telefon" />
                    <input type="email" name={`rep${i+1}_email`} defaultValue={r.email || ""} className="w-full px-2 py-1 text-sm border rounded lowercase md:col-span-2" placeholder="E-posta" />
                  </div>
                </div>
              )})}
          </div>
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
