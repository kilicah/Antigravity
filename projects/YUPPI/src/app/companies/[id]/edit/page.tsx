import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      representatives: true,
    }
  });

  if (!company) {
    notFound();
  }

  async function updateCompany(formData: FormData) {
    "use server";
    
    const name = (formData.get("name") as string)?.toLocaleUpperCase("tr-TR");
    const address = (formData.get("address") as string)?.toLocaleUpperCase("tr-TR");
    const district = (formData.get("district") as string)?.toLocaleUpperCase("tr-TR");
    const city = (formData.get("city") as string)?.toLocaleUpperCase("tr-TR");
    const country = (formData.get("country") as string)?.toLocaleUpperCase("tr-TR");
    const zipCode = (formData.get("zipCode") as string)?.toLocaleUpperCase("tr-TR");
    const taxOffice = (formData.get("taxOffice") as string)?.toLocaleUpperCase("tr-TR");
    const taxNo = formData.get("taxNo") as string;
    const registrationNo = (formData.get("registrationNo") as string)?.toLocaleUpperCase("tr-TR");
    const phone = formData.get("phone") as string;
    const isSeller = formData.get("isSeller") === "on";
    const isBuyer = formData.get("isBuyer") === "on";

    // Build Representatives array
    const representatives = [];
    for (let i = 1; i <= 3; i++) {
       const repName = (formData.get(`rep${i}_name`) as string)?.toLocaleUpperCase("tr-TR");
       const repTitle = (formData.get(`rep${i}_title`) as string)?.toLocaleUpperCase("tr-TR");
       const repPhone = formData.get(`rep${i}_phone`) as string;
       const repEmail = formData.get(`rep${i}_email`) as string;
       
       if (repName) {
         representatives.push({
            name: repName,
            title: repTitle || null,
            phone: repPhone || null,
            email: repEmail || null,
         });
       }
    }

    await prisma.company.update({
      where: { id },
      data: {
        name,
        address,
        district,
        city,
        country,
        zipCode,
        taxOffice,
        taxNo,
        registrationNo,
        phone,
        isSeller,
        isBuyer,
        representatives: {
          deleteMany: {}, // Clear old reps and insert new ones
          create: representatives
        }
      },
    });

    redirect("/companies");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Firma Düzenle: {company.name}</h1>
        <Link 
          href="/companies"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form action={updateCompany} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Firma Adı <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={company.name}
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>

          <div className="flex gap-6 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isBuyer" defaultChecked={company.isBuyer} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Bu bir Müşteri (Alıcı) firmasıdır.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isSeller" defaultChecked={company.isSeller} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Bu bir Tedarikçi/Satıcı firmasıdır.</span>
            </label>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
              Adres
            </label>
            <textarea 
              id="address" 
              name="address" 
              rows={3}
              defaultValue={company.address || ""}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-slate-700 mb-1">
                İlçe
              </label>
              <input 
                type="text" 
                id="district" 
                name="district" 
                defaultValue={company.district || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                İl
              </label>
              <input 
                type="text" 
                id="city" 
                name="city" 
                defaultValue={company.city || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                Ülke
              </label>
              <input 
                type="text" 
                id="country" 
                name="country" 
                defaultValue={company.country || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 mb-1">
                Posta Kodu
              </label>
              <input 
                type="text" 
                id="zipCode" 
                name="zipCode" 
                defaultValue={company.zipCode || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="taxOffice" className="block text-sm font-medium text-slate-700 mb-1">
                Vergi Dairesi
              </label>
              <input 
                type="text" 
                id="taxOffice" 
                name="taxOffice" 
                defaultValue={company.taxOffice || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="taxNo" className="block text-sm font-medium text-slate-700 mb-1">
                Vergi No / T.C. Kimlik
              </label>
              <input 
                type="text" 
                id="taxNo" 
                name="taxNo" 
                defaultValue={company.taxNo || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
            <div>
              <label htmlFor="registrationNo" className="block text-sm font-medium text-slate-700 mb-1">
                Ticaret Sicil No
              </label>
              <input 
                type="text" 
                id="registrationNo" 
                name="registrationNo" 
                defaultValue={company.registrationNo || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Telefon Numarası
            </label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              defaultValue={company.phone || ""}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Firma Yetkilileri</h2>
            
            {[1, 2, 3].map((index) => {
              const rep = company.representatives[index - 1]; // Array is 0-indexed
              return (
                <div key={index} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-700 mb-3 border-b border-slate-200 pb-1">Yetkili {index}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ad Soyad</label>
                      <input 
                        type="text" 
                        name={`rep${index}_name`} 
                        defaultValue={rep?.name || ""}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 uppercase"
                        placeholder="Örn: AHMET YILMAZ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Görevi</label>
                      <input 
                        type="text" 
                        name={`rep${index}_title`} 
                        defaultValue={rep?.title || ""}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 uppercase"
                        placeholder="Örn: SATIN ALMA MÜDÜRÜ"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Telefon</label>
                      <input 
                        type="tel" 
                        name={`rep${index}_phone`} 
                        defaultValue={rep?.phone || ""}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+90 555 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">E-posta</label>
                      <input 
                        type="email" 
                        name={`rep${index}_email`} 
                        defaultValue={rep?.email || ""}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ahmet@firma.com"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
