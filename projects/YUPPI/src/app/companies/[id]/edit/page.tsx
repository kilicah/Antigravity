import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    notFound();
  }

  // Parse reps JSON
  let loadedReps: any[] = [];
  try {
    if (company.repsJson) {
      loadedReps = JSON.parse(company.repsJson);
    }
  } catch (e) {
    loadedReps = [];
  }

  async function updateCompany(formData: FormData) {
    "use server";
    
    // Turkish Fields
    const name = (formData.get("name") as string)?.toLocaleUpperCase("tr-TR");
    const address = (formData.get("address") as string)?.toLocaleUpperCase("tr-TR");
    const district = (formData.get("district") as string)?.toLocaleUpperCase("tr-TR");
    const city = (formData.get("city") as string)?.toLocaleUpperCase("tr-TR");
    const country = (formData.get("country") as string)?.toLocaleUpperCase("tr-TR");
    const taxOffice = (formData.get("taxOffice") as string)?.toLocaleUpperCase("tr-TR");
    
    // English Fields
    const nameEn = (formData.get("nameEn") as string)?.toUpperCase();
    const addressEn = (formData.get("addressEn") as string)?.toUpperCase();
    const districtEn = (formData.get("districtEn") as string)?.toUpperCase();
    const cityEn = (formData.get("cityEn") as string)?.toUpperCase();
    const countryEn = (formData.get("countryEn") as string)?.toUpperCase();
    const taxOfficeEn = (formData.get("taxOfficeEn") as string)?.toUpperCase();

    // Universal
    const zipCode = formData.get("zipCode") as string;
    const taxNo = formData.get("taxNo") as string;
    const registrationNo = (formData.get("registrationNo") as string)?.toLocaleUpperCase("tr-TR");
    const phone = formData.get("phone") as string;
    
    // Roles
    const isSeller = formData.get("isSeller") === "on";
    const isBuyer = formData.get("isBuyer") === "on";
    const isShipTo = formData.get("isShipTo") === "on";
    const isBrand = formData.get("isBrand") === "on";
    const isCustoms = formData.get("isCustoms") === "on";
    const isLogistics = formData.get("isLogistics") === "on";
    const isInsurance = formData.get("isInsurance") === "on";

    // Build 10 Representatives array
    const representatives = [];
    for (let i = 1; i <= 10; i++) {
       const repName = (formData.get(`rep${i}_name`) as string)?.toLocaleUpperCase("tr-TR");
       const repTitle = (formData.get(`rep${i}_title`) as string)?.toLocaleUpperCase("tr-TR");
       const repPhone = formData.get(`rep${i}_phone`) as string;
       const repEmail = formData.get(`rep${i}_email`) as string;
       
       if (repName || repTitle || repPhone || repEmail) {
         representatives.push({
            name: repName || "",
            title: repTitle || "",
            phone: repPhone || "",
            email: repEmail || "",
         });
       }
    }
    const repsJson = JSON.stringify(representatives);

    await prisma.company.update({
      where: { id },
      data: {
        name,
        nameEn: nameEn || null,
        address,
        addressEn: addressEn || null,
        district,
        districtEn: districtEn || null,
        city,
        cityEn: cityEn || null,
        country,
        countryEn: countryEn || null,
        zipCode,
        taxOffice,
        taxOfficeEn: taxOfficeEn || null,
        taxNo,
        registrationNo,
        phone,
        isSeller,
        isBuyer,
        isShipTo,
        isBrand,
        isCustoms,
        isLogistics,
        isInsurance,
        repsJson,
      },
    });

    redirect("/companies");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Düzenle: {company.name}</h1>
        <Link 
          href="/companies"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form action={updateCompany} className="space-y-6">
          
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Firma Rolleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isSeller" defaultChecked={company.isSeller} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Satıcı Firma</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isBuyer" defaultChecked={company.isBuyer} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Alıcı Firma</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isShipTo" defaultChecked={company.isShipTo} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Sevk Alıcısı Firma</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isBrand" defaultChecked={company.isBrand} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Marka Firması</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isCustoms" defaultChecked={company.isCustoms} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Gümrükleme Firması</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isLogistics" defaultChecked={company.isLogistics} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Lojistik Firması</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isInsurance" defaultChecked={company.isInsurance} className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-slate-700">Sigorta Firması</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Türkçe Bilgiler</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firma Adı <span className="text-red-500">*</span></label>
                <input type="text" name="name" defaultValue={company.name} required className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                <textarea name="address" defaultValue={company.address || ""} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                  <input type="text" name="district" defaultValue={company.district || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İl</label>
                  <input type="text" name="city" defaultValue={company.city || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ülke</label>
                  <input type="text" name="country" defaultValue={company.country || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Dairesi</label>
                <input type="text" name="taxOffice" defaultValue={company.taxOffice || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">English Info (İngilizce)</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input type="text" name="nameEn" defaultValue={company.nameEn || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea name="addressEn" defaultValue={company.addressEn || ""} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <input type="text" name="districtEn" defaultValue={company.districtEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input type="text" name="cityEn" defaultValue={company.cityEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input type="text" name="countryEn" defaultValue={company.countryEn || ""} className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax Office</label>
                <input type="text" name="taxOfficeEn" defaultValue={company.taxOfficeEn || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-white">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vergi Num. / VAT No</label>
                <input type="text" name="taxNo" defaultValue={company.taxNo || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ticaret Sicil No</label>
                <input type="text" name="registrationNo" defaultValue={company.registrationNo || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu / Zip</label>
                <input type="text" name="zipCode" defaultValue={company.zipCode || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md uppercase" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon / Phone</label>
                <input type="tel" name="phone" defaultValue={company.phone || ""} className="w-full px-4 py-2 border border-slate-300 rounded-md" />
             </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Firma Yetkilileri (Maks 10 Kişi)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[...Array(10)].map((_, i) => (
                 <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                   <h3 className="font-bold text-slate-500 text-xs mb-2 uppercase">Yetkili {i + 1}</h3>
                   <div className="grid grid-cols-2 gap-2">
                     <input type="text" name={`rep${i+1}_name`} defaultValue={loadedReps[i]?.name || ""} className="w-full px-2 py-1 text-sm border rounded uppercase" placeholder="Ad Soyad" />
                     <input type="text" name={`rep${i+1}_title`} defaultValue={loadedReps[i]?.title || ""} className="w-full px-2 py-1 text-sm border rounded uppercase" placeholder="Görevi" />
                     <input type="tel" name={`rep${i+1}_phone`} defaultValue={loadedReps[i]?.phone || ""} className="w-full px-2 py-1 text-sm border rounded" placeholder="Telefon" />
                     <input type="email" name={`rep${i+1}_email`} defaultValue={loadedReps[i]?.email || ""} className="w-full px-2 py-1 text-sm border rounded lowercase" placeholder="E-posta" />
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition-all shadow-md">
              Mevcut Firmayı Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
