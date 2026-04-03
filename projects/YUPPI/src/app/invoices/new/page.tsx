import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceFormClient from "./InvoiceFormClient";

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderIdsParam = resolvedSearchParams.orderIds;
  
  if (!orderIdsParam || typeof orderIdsParam !== 'string') {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hatalı İstek</h1>
        <p className="text-slate-600 mb-6">Fatura oluşturabilmek için lütfen 'Siparişler' tablosundan sipariş seçimi yapın.</p>
        <Link href="/orders" className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700">Siparişlere Dön</Link>
      </div>
    );
  }

  const ids = orderIdsParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  
  if (ids.length === 0) notFound();

  const orders = await prisma.order.findMany({
    where: { id: { in: ids } },
    include: {
      buyer: true,
      seller: true,
      items: true
    }
  });

  // Check if all orders belong to the same buyer
  const buyerIds = [...new Set(orders.map(o => o.buyerId))];
  if (buyerIds.length > 1) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Farklı Müşteriler Seçildi</h1>
        <p className="text-slate-600 mb-6">Birleştirilmiş fatura oluşturabilmek için seçtiğiniz tüm siparişlerin <strong>ALICI</strong> bilgisinin aynı olması gerekmektedir.</p>
        <Link href="/orders" className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700">Geri Dön ve Tekrar Seç</Link>
      </div>
    );
  }

  const defaultBuyer = orders[0].buyer;

  // Companies for dropdowns
  const logisticsCompanies = await prisma.company.findMany({ where: { isLogistics: true } });
  const customsCompanies = await prisma.company.findMany({ where: { isCustoms: true } });
  const insuranceCompanies = await prisma.company.findMany({ where: { isInsurance: true } });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
            Fatura & Çeki Listesi Oluştur
          </h1>
          <p className="text-slate-500 mt-1">
            <strong>{defaultBuyer.name}</strong> firmasına ait seçili {orders.length} siparişin kalemlerini yapılandırın.
          </p>
        </div>
      </div>

      <InvoiceFormClient 
        orders={orders} 
        buyer={defaultBuyer} 
        logisticsCompanies={logisticsCompanies} 
        customsCompanies={customsCompanies} 
        insuranceCompanies={insuranceCompanies}
      />
    </div>
  );
}
