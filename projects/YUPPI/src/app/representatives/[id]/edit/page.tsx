import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EditRepresentativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  
  const representative = await prisma.representative.findUnique({
    where: { id },
  });

  if (!representative) notFound();

  async function updateRepresentative(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    
    await prisma.representative.update({
      where: { id },
      data: { name, email, phone },
    });

    redirect("/representatives");
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Temsilci Düzenle: {representative.name.includes('|') ? representative.name.split('|')[0] : representative.name}
        </h1>
        <Link 
          href="/representatives"
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          &larr; Geri Dön
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <form action={updateRepresentative} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={representative.name.includes('|') ? representative.name.split('|')[0] : representative.name}
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                E-Posta
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                defaultValue={representative.email || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Telefon
              </label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                defaultValue={representative.phone || ""}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
