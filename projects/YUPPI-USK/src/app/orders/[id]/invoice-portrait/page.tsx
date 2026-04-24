import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommercialInvoicePortrait from "@/components/orders/CommercialInvoicePortrait";

export default async function InvoiceViewPage({
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
      productionOrder: true,
    }
  });

  if (!order) notFound();

  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  

  // Fetch default bank info
  const bankInfo = await prisma.bankInfo.findFirst({
    where: {
      companyId: order.sellerId,
      currency: order.currency
    },
    orderBy: {
      isDefault: 'desc'
    }
  });

  return (
    <div className="max-w-[1020px] mx-auto space-y-6">
      
      {/* BAŞLIK & BUTONLAR */}
      <div className="flex justify-between items-center print:hidden mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Invoice Document / Fatura</h1>
          <p className="text-slate-500">Ref: {order.contractNo}</p>
        </div>
        <div className="space-x-4 flex">
          <Link 
            href="/orders" 
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            &larr; Geri Dön
          </Link>
          <Link 
            href={`/orders/${order.id}/edit`}
            className="px-4 py-2 text-blue-600 bg-white border border-blue-300 shadow-sm rounded hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Düzenle
          </Link>
          <button 
            type="button"
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded shadow flex items-center gap-2 transition-colors print:hidden"
            // We can't use onClick directly in a Server Component natively without "use client".
            // Since this page is a RSC, we'll embed an inline script for the print button or we make the print button a tiny client component.
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span dangerouslySetInnerHTML={{ __html: `<a href="javascript:window.print()">Yazdır / PDF Al</a>` }} />
          </button>
        </div>
      </div>

      {/* YAZDIRILABİLİR YENİ TABLO ALANI */}
      <div className="bg-white shadow-2xl print:shadow-none flex justify-center pb-12 print:pb-0">
         <CommercialInvoicePortrait order={order} bankInfo={bankInfo}  />
      </div>

    </div>
  );
}
