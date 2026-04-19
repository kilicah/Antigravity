import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceFormClient from "../../new/InvoiceFormClient";

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);

  if (isNaN(invoiceId)) {
    notFound();
  }

  // 1. Fetch the invoice with items and rolls
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    // @ts-ignore
    include: {
      items: {
        include: {
          rolls: true,
          orderItem: true
        }
      },
      buyer: true
    }
  });

  if (!invoice) {
    notFound();
  }

  // 2. We need the orders related to these items, to pass down to InvoiceFormClient
  // @ts-ignore
  const orderIds = [...new Set(invoice.items.map((item: any) => item.orderItem.orderId))] as number[];
  
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: {
      buyer: true,
      seller: true,
      items: true
    }
  });

  // 3. Lookups for dropdowns
  const logisticsCompanies = await prisma.company.findMany({ where: { isLogistics: true, isActive: true } });
  const customsCompanies = await prisma.company.findMany({ where: { isCustoms: true, isActive: true } });
  const insuranceCompanies = await prisma.company.findMany({ where: { isInsurance: true, isActive: true } });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 to-emerald-600">
            Fatura Düzenle
          </h1>
          <p className="text-slate-500 mt-1">
            <strong>{invoice.invoiceNo || `#INV-${invoice.id}`}</strong> numaralı faturayı düzenliyorsunuz.
          </p>
        </div>
      </div>

      <InvoiceFormClient 
        orders={orders} 
        buyer={invoice.buyer} 
        logisticsCompanies={logisticsCompanies} 
        customsCompanies={customsCompanies}
        insuranceCompanies={insuranceCompanies}
        initialData={invoice}
        isEdit={true}
      />
    </div>
  );
}
