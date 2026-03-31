import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import ProductionOrderDocument from "@/components/orders/ProductionOrderDocument";

export default async function ProductionOrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      seller: true,
      buyer: true,
      shipTo: true,
      brand: true,
      items: true,
      productionOrder: true
    }
  });

  if (!order) notFound();

  const isEng = order.language === "ENG";

  // Teslim Şekli Ayrıştırma
  let displayDeliveryTerms = order.deliveryTerms || "-";
  if (order.deliveryTerms && order.deliveryTerms.includes('|')) {
    const parts = order.deliveryTerms.split('|');
    displayDeliveryTerms = isEng ? (parts[1] || parts[0]).trim() : parts[0].trim();
  }

  // Hesaplamalar
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* BAŞLIK & BUTONLAR */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{isEng ? 'Production Order Details' : 'Üretim Siparişi Detayı'}</h1>
          <p className="text-slate-500">Ref: {order.contractNo}</p>
        </div>
        <div className="space-x-4 flex">
          <Link 
            href="/orders" 
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            &larr; {isEng ? 'Back to Orders' : 'Geri Dön'}
          </Link>
          <Link 
            href={`/orders/${order.id}/edit`}
            className="px-4 py-2 text-blue-600 bg-white border border-blue-300 shadow-sm rounded hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Düzenle
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* YAZDIRILABİLİR SÖZLEŞME ALANI (A4 ORANI) */}
      <div className="w-full overflow-x-auto print:overflow-visible flex justify-center pb-20">
         <ProductionOrderDocument order={order} />
      </div>
    </div>
  );
}
