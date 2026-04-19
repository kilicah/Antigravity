import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BankInfosPage() {
  const bankInfos = await prisma.bankInfo.findMany({
    orderBy: { bankName: "asc" },
    include: {
      company: true,
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banka Hesapları</h1>
        <Link 
          href="/bank-infos/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Hesap Ekle
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Firma</th>
              <th className="py-3 px-4 font-medium">Banka & Şube</th>
              <th className="py-3 px-4 font-medium">Para Birimi</th>
              <th className="py-3 px-4 font-medium">IBAN</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {bankInfos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Henüz kayıtlı banka hesabı bulunmuyor.
                </td>
              </tr>
            ) : (
              bankInfos.map((bank) => (
                <tr key={bank.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-blue-900">{bank.company.name}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-medium">{bank.bankName}</div>
                    <div className="text-xs text-slate-500">{bank.branch || "-"}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      bank.currency === 'USD' ? 'bg-green-100 text-green-800' :
                      bank.currency === 'EUR' ? 'bg-blue-100 text-blue-800' :
                      bank.currency === 'GBP' ? 'bg-purple-100 text-purple-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {bank.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm font-mono">{bank.iban || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/bank-infos/${bank.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
