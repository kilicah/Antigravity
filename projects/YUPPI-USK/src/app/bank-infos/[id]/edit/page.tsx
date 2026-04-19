import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditBankInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const [bankInfo, companies] = await Promise.all([
    prisma.bankInfo.findUnique({ where: { id } }),
    prisma.company.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!bankInfo) {
    notFound();
  }

  async function updateBankInfo(formData: FormData) {
    "use server";
    
    const companyId = parseInt(formData.get("companyId") as string, 10);
    const currency = formData.get("currency") as string;
    const bankName = formData.get("bankName") as string;
    const branch = formData.get("branch") as string;
    const accountNo = formData.get("accountNo") as string;
    const iban = formData.get("iban") as string;
    const swift = formData.get("swift") as string;
    const isDefault = formData.get("isDefault") === "on";

    // If this is set as default, we need to unset any existing default for this company + currency
    if (isDefault) {
      await prisma.bankInfo.updateMany({
        where: {
          companyId,
          currency,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        }
      });
    }

    await prisma.bankInfo.update({
      where: { id },
      data: {
        companyId,
        currency,
        bankName,
        branch,
        accountNo,
        iban,
        swift,
        isDefault,
      },
    });

    redirect("/bank-infos");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banka Hesabı Düzenle</h1>
        <Link 
          href="/bank-infos"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form action={updateBankInfo} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-slate-700 mb-1">
                Firma <span className="text-red-500">*</span>
              </label>
              <select 
                id="companyId" 
                name="companyId" 
                defaultValue={bankInfo.companyId}
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Firma Seçiniz --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">
                Para Birimi <span className="text-red-500">*</span>
              </label>
              <select 
                id="currency" 
                name="currency" 
                defaultValue={bankInfo.currency}
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="TRY">TRY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 mb-1">
                Banka Adı <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="bankName" 
                name="bankName" 
                defaultValue={bankInfo.bankName}
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-slate-700 mb-1">
                Şube
              </label>
              <input 
                type="text" 
                id="branch" 
                name="branch" 
                defaultValue={bankInfo.branch || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountNo" className="block text-sm font-medium text-slate-700 mb-1">
                Hesap Numarası
              </label>
              <input 
                type="text" 
                id="accountNo" 
                name="accountNo" 
                defaultValue={bankInfo.accountNo || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="swift" className="block text-sm font-medium text-slate-700 mb-1">
                SWIFT Kodu
              </label>
              <input 
                type="text" 
                id="swift" 
                name="swift" 
                defaultValue={bankInfo.swift || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label htmlFor="iban" className="block text-sm font-medium text-slate-700 mb-1">
              IBAN
            </label>
            <input 
              type="text" 
              id="iban" 
              name="iban" 
              defaultValue={bankInfo.iban || ""}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase font-mono tracking-wider"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              defaultChecked={bankInfo.isDefault}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-slate-700">
              Bu hesabı seçili para birimi için <strong>Varsayılan / Tercih Edilen Hesap</strong> olarak ayarla.
            </label>
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
