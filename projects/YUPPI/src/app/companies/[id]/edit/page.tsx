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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Düzenle: {company.name}</h1>
        <Link 
          href="/companies"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <CompanyFormClient initialData={company} />
    </div>
  );
}
