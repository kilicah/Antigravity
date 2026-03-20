import Link from "next/link";
import CompanyFormClient from "../components/CompanyFormClient";

export default function NewCompanyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yeni Firma Ekle</h1>
        <Link 
          href="/companies"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <CompanyFormClient />
    </div>
  );
}
