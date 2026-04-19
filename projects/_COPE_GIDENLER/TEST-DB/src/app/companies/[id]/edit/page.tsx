import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CompanyFormClient from "../../components/CompanyFormClient";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    notFound();
  }

  // Parse reps JSON logic handled securely inside CompanyFormClient directly since it's just JSON

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded border border-amber-200 text-[10px] uppercase tracking-wider">
              Firma Düzenle
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-words">{company.name}</h1>
        </div>
        <Link 
          href="/companies"
          className="flex items-center gap-2 bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0 text-sm font-bold shadow-sm"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <CompanyFormClient initialData={company} />
    </div>
  );
}
