import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      order: {
        include: {
          buyer: true,
          seller: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Faturalar</h1>
        <Link 
          href="/invoices/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Fatura Kes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Fatura No</th>
              <th className="py-3 px-4 font-medium">Sözleşme No</th>
              <th className="py-3 px-4 font-medium">Alıcı (Buyer)</th>
              <th className="py-3 px-4 font-medium">Fatura Tarihi</th>
              <th className="py-3 px-4 font-medium text-right">Net KG</th>
              <th className="py-3 px-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Sistemde henüz kesilmiş fatura bulunmuyor.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-indigo-700">{inv.invoiceNo || "-"}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono tracking-wider">{inv.order.contractNo}</td>
                  <td className="py-3 px-4 text-slate-700">{inv.order.buyer.name}</td>
                  <td className="py-3 px-4">
                    {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('tr-TR') : "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {inv.netKg ? `${inv.netKg.toLocaleString('tr-TR')} kg` : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Görüntüle
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
