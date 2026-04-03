import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderTableClient from "./components/OrderTableClient";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      seller: true,
      brand: true,
      items: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Sipariş Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Tüm sözleşme ve sipariş işlemlerini takip edin.</p>
        </div>
        <Link 
          href="/orders/new" 
          className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
        >
          <span className="mr-2 text-lg leading-none">+</span> Yeni Sözleşme
        </Link>
      </div>

      <OrderTableClient orders={orders} />
    </div>
  );
}
