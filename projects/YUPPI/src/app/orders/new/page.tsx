import { prisma } from "@/lib/prisma";
import OrderEntryForm from "@/app/components/orders/OrderEntryForm";

export default async function NewOrderPage() {
  const [companies, brands, representatives] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.companyRepresentative.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
          Yeni Sipariş (Sözleşme) Girişi
        </h1>
        <p className="text-slate-500 mt-2">
          Sipariş genel bilgilerini ve sipariş edilen ürün kalemlerini aşağıdan sisteme girebilirsiniz.
        </p>
      </div>

      <OrderEntryForm 
        companies={companies} 
        brands={brands} 
        representatives={representatives} 
      />
    </div>
  );
}
