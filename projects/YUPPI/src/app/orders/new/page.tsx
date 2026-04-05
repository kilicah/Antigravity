import { prisma } from "@/lib/prisma";
import OrderEntryForm from "@/app/components/orders/OrderEntryForm";
import Link from "next/link"; // Added import for Link component

export default async function NewOrderPage() {
  // Fetch initial data needed for the form
  const companies = await prisma.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/orders" className="text-slate-500 hover:text-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Yeni Sipariş Girişi</h1>
      </div>
      
      <OrderEntryForm 
        companies={companies} 
      />
    </div>
  );
}
