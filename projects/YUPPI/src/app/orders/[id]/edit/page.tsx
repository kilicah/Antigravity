import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderEntryForm from "@/app/components/orders/OrderEntryForm";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true
    }
  });

  if (!order) notFound();

  // Fetch dropdown data
  const [companies, representatives] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.companyRepresentative.findMany({ orderBy: { name: "asc" } })
  ]);

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
        representatives={representatives} 
        initialData={order}
      />
    </div>
  );
}
