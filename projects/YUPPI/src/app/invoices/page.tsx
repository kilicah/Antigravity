import { prisma } from "@/lib/prisma";
import InvoiceTableClient from "./components/InvoiceTableClient";

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      buyer: true,
      items: true,
      packingList: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Faturalar
          </h1>
          <p className="text-slate-500 mt-1">Siparişlerden bağımsız olarak oluşturduğunuz faturaları ve sevk listelerini buradan takip edebilirsiniz.</p>
        </div>
      </div>

      <InvoiceTableClient invoices={invoices} />
    </div>
  );
}
