import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderEntryForm from "@/app/components/orders/OrderEntryForm";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const idStr = (await params).id;
  if (!idStr || idStr === 'undefined') notFound();
  
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      productionOrder: true
    }
  });

  if (!order) notFound();

  // Fetch dropdown data
  const companies = await prisma.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
            Siparişi Düzenle
          </h1>
          <p className="text-slate-500 mt-2">
            Ref: {order.contractNo} nolu sipariş bilgilerini güncelleyin
          </p>
        </div>
      </div>
      <OrderEntryForm 
        companies={companies} 
        products={products}
        initialData={order}
      />
    </div>
  );
}
