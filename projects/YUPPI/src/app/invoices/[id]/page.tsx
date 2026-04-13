import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommercialInvoiceDocument from "@/components/orders/CommercialInvoiceDocument";
import PackingListManager from "../components/PackingListManager";

export default async function SelectedInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      buyer: true,
      customsCompany: true,
      logisticsCompany: true,
      insuranceCompany: true,
      packingList: true,
      items: {
        include: {
          orderItem: {
             include: {
                order: {
                   include: {
                      seller: true,
                      shipTo: true
                   }
                }
             }
          }
        }
      }
    }
  });

  if (!invoice) notFound();

  // Pick seller and currency from the first item since multiple orders could theoretically be from different sellers
  // though realistically they are from USK.
  const firstOrder = invoice.items[0]?.orderItem.order;

  // We need to shape the data so CommercialInvoiceDocument doesn't crash since it expects a single `order` object!
  // Alternatively, we pass `invoice` to the Document component instead of `order` and rewrite the component.
  // For now, I will create a hybrid object that mimics an order but has combined items, to temporarily render it.
  // Later we will refactor the PDF component to take native `invoice` prop.
  
  const hybridOrderData = {
     id: firstOrder?.id,
     contractNo: Array.from(new Set(invoice.items.map(i => i.orderItem.order.contractNo))).join(', '),
     buyer: invoice.buyer,
     seller: firstOrder?.seller,
     shipTo: firstOrder?.shipTo || invoice.buyer,
     currency: firstOrder?.currency || "USD",
     unit: firstOrder?.unit || "MT", 
     contractDate: invoice.invoiceDate || firstOrder?.contractDate,
     paymentTerms: firstOrder?.paymentTerms,
     deliveryTerms: firstOrder?.deliveryTerms,
     deliveryDestination: firstOrder?.deliveryDestination,
     transporter: invoice.logisticsCompany?.name || firstOrder?.transporter,
     buyerPoNo: Array.from(new Set(invoice.items.map(i => i.orderItem.order.buyerPoNo).filter(Boolean))).join(', '),
     invoice: invoice, // Embed the invoice data inside
     items: invoice.items.map(i => ({
        ...i.orderItem,
        id: i.id, // override id for keys
        quantity: i.quantity,
        totalAmount: i.totalAmount,
     }))
  };

  const bankInfo = await prisma.bankInfo.findFirst({
    where: {
      companyId: firstOrder?.sellerId,
      currency: firstOrder?.currency
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
        </div>
        <div className="space-x-4 flex">
          <Link 
            href="/invoices" 
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            &larr; Faturalara Dön
          </Link>
          <Link
            href={`/invoices/${id}/bol`}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors print:hidden text-sm"
          >
            Konşimento PDF
          </Link>
          {invoice.packingList && (
            <Link
              href={`/invoices/${id}/packing-list`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition-colors print:hidden text-sm"
            >
              Çeki Listesi PDF
            </Link>
          )}
          <button 
            type="button"
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded shadow flex items-center gap-2 transition-colors print:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span dangerouslySetInnerHTML={{ __html: `<a href="javascript:window.print()">Yazdır / PDF Al</a>` }} />
          </button>
        </div>
      </div>

      <PackingListManager invoiceId={id} />

      <div className="bg-white shadow-2xl print:shadow-none flex justify-center pb-12 print:pb-0">
         <CommercialInvoiceDocument order={hybridOrderData as any} bankInfo={bankInfo} />
      </div>

    </div>
  );
}
