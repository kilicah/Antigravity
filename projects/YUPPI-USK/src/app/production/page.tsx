import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductionPage() {
  const productionOrders = await prisma.productionOrder.findMany({
    include: {
      order: {
        include: {
          buyer: true,
          brand: true,
          items: {
            include: {
              invoiceItems: {
                include: {
                  invoice: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  let grandTotalQuantity = 0;
  let grandTotalRemaining = 0;

  productionOrders.forEach(po => {
     po.order.items.forEach(item => {
        const itemQuantity = item.quantity;
        const invoicedQuantity = item.invoiceItems
           .filter(inv => inv.invoice?.isActive !== false)
           .reduce((sum, inv) => sum + inv.quantity, 0);
        
        grandTotalQuantity += itemQuantity;
        grandTotalRemaining += (itemQuantity - invoicedQuantity);
     });
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sipariş Durumu</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-h-[calc(100vh-140px)] flex flex-col">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
              <th className="py-3 px-4 font-medium">Sözleşme No</th>
              <th className="py-3 px-4 font-medium">Tarih</th>
              <th className="py-3 px-4 font-medium">Alıcı Firma</th>
              <th className="py-3 px-4 font-medium">Ürün Adı</th>
              <th className="py-3 px-4 font-medium">Exmil</th>
              <th className="py-3 px-4 font-medium">Sipariş Miktarı</th>
              <th className="py-3 px-4 font-medium">Kalan Miktar</th>
              <th className="py-3 px-4 font-medium text-right">Sipariş Takibi</th>
            </tr>
          </thead>
          <tbody>
            {productionOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Sistemde kayıtlı üretim siparişi bulunmuyor.
                </td>
              </tr>
            ) : (
              productionOrders.flatMap((po) => {
                return po.order.items.map((item, index) => {
                  const itemQuantity = item.quantity;
                  const invoicedQuantity = item.invoiceItems
                    .filter(inv => inv.invoice?.isActive !== false) // avoid deleted invoices
                    .reduce((sum, inv) => sum + inv.quantity, 0);

                  const remainingQuantity = itemQuantity - invoicedQuantity;
                  const isCompleted = remainingQuantity <= 0 && itemQuantity > 0;
                  const productName = item.qualityName || item.qualityCode || "İsimsiz Kalem";

                  return (
                   <tr key={`${po.id}-${item.id}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium whitespace-nowrap text-slate-700">
                      {po.order.contractNo} {po.order.items.length > 1 && <span className="text-slate-400 font-normal ml-1">#{index + 1}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                       {new Date(po.order.contractDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{po.order.buyer.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-[200px] truncate" title={productName}>
                       {productName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.exmd ? new Date(item.exmd).toLocaleDateString('tr-TR') : "-"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                       {itemQuantity.toLocaleString('tr-TR')} {po.order.unit}
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold ${remainingQuantity <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {remainingQuantity.toLocaleString('tr-TR')} {po.order.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold tracking-wide uppercase ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isCompleted ? "OK" : "Üretimde"}
                        </span>
                        <Link 
                          href={`/orders/${po.order.id}/tracking`}
                          className="text-white hover:text-white text-[13px] font-medium border border-blue-700 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors shadow-sm"
                        >
                          Takip
                        </Link>
                      </div>
                    </td>
                   </tr>
                  );
                });
              })
            )}
          </tbody>
          {productionOrders.length > 0 && (
            <tfoot className="bg-slate-200 text-slate-800 font-bold border-t-2 border-slate-300 sticky bottom-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <tr>
                <td colSpan={5} className="py-4 px-4 text-right text-sm uppercase tracking-wider text-slate-600">Genel Toplamlar:</td>
                <td className="py-4 px-4 font-mono text-base">{grandTotalQuantity.toLocaleString('tr-TR')}</td>
                <td className="py-4 px-4 font-mono text-base">{grandTotalRemaining.toLocaleString('tr-TR')}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>
    </div>
  );
}
