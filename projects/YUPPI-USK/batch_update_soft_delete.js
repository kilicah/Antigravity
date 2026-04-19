const fs = require('fs');

// 1. Fix actions.ts createCompany payload
let actions = fs.readFileSync('src/app/companies/actions.ts', 'utf8');
actions = actions.replace(/isAgency,\s+repsJson,\s+deliveryAddressesJson,/g, 'isAgency,\n      isActive,\n      repsJson,\n      deliveryAddressesJson,');
fs.writeFileSync('src/app/companies/actions.ts', actions, 'utf8');

// 2. Add Toggle and API error handling to CompanyFormClient and TableClient
let formStr = fs.readFileSync('src/app/companies/components/CompanyFormClient.tsx', 'utf8');
if (!formStr.includes('name="isActive"')) {
   formStr = formStr.replace(
      '<div className="grid grid-cols-2 md:grid-cols-4 gap-4">',
      `<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100/50 p-2 rounded-lg border border-slate-200">
              <input type="checkbox" name="isActive" defaultChecked={initialData ? initialData.isActive : true} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
              <span className="text-sm font-bold text-slate-800">Aktif Firma (Siparişlere Açık)</span>
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">`
   );
}

// Add Delete Button and client-side handle
if (!formStr.includes('handleDelete')) {
   formStr = formStr.replace('import { createCompany, updateCompany } from "../actions";', 
                             'import { createCompany, updateCompany } from "../actions";\nimport { useRouter } from "next/navigation";');
   
   formStr = formStr.replace('const isEditing = !!initialData?.id;', 
                             `const isEditing = !!initialData?.id;\n  const router = useRouter();\n  const handleDelete = async () => {\n    if(!confirm("Gerçekten bu firmayı silmek istiyor musunuz?")) return;\n    try {\n      const res = await fetch(\`/api/companies/\${initialData.id}\`, { method: "DELETE" });\n      if(!res.ok) { const body = await res.json(); alert(body.error || "Silinemedi"); } else { router.push("/companies"); router.refresh(); }\n    } catch(err) { alert("Sistemsel bir hata oluştu."); }\n  };`);
   
   // Add visually styled Delete Button
   formStr = formStr.replace('<div className="pt-4 flex justify-end">',
                             `<div className="pt-4 flex justify-between items-center bg-slate-50/50 p-4 border-t border-slate-200 -mx-6 -mb-6 mt-6 px-6 rounded-b-xl border">
          {isEditing ? (
             <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-700 font-bold px-4 py-2 hover:bg-red-50 rounded-md transition-colors underline-offset-4 hover:underline">
               ❌ Firmayı Tamamen Sil
             </button>
          ) : <div/>}
          `);
}
fs.writeFileSync('src/app/companies/components/CompanyFormClient.tsx', formStr, 'utf8');

let tableStr = fs.readFileSync('src/app/companies/components/CompanyTableClient.tsx', 'utf8');
if (!tableStr.includes('handleDelete')) {
   tableStr = tableStr.replace(
       'export default function CompanyTableClient({ companies }: { companies: any[] }) {',
       `export default function CompanyTableClient({ companies }: { companies: any[] }) {\n  const handleDelete = async () => {\n    if(!selectedCompanyId) return alert("Lütfen silmek için firma seçin.");\n    if(!confirm("Emin misiniz?")) return;\n    try { const res = await fetch(\`/api/companies/\${selectedCompanyId}\`, { method: "DELETE" }); if(!res.ok) { const j = await res.json(); alert(j.error); } else { window.location.reload(); } } catch(e) { alert("Hata oluştu."); }\n  };`
   );
   tableStr = tableStr.replace(
       '<button\n            onClick={handleEditClick}',
       `<button
            onClick={handleDelete}
            disabled={!selectedCompanyId}
            className={\`px-4 py-2 rounded-md font-medium transition-colors \${
              selectedCompanyId 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
            }\`}
          >
            Tamamen Sil
          </button>\n          <button\n            onClick={handleEditClick}`
   );
   
   tableStr = tableStr.replace(
       '<div className="font-medium text-slate-900 leading-tight">{company.name}</div>',
       `<div className="flex items-center gap-2">
           <div className={\`w-2 h-2 rounded-full \${company.isActive !== false ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]'}\`}></div>
           <div className={\`font-bold \${company.isActive !== false ? 'text-slate-900' : 'text-slate-500 line-through decoration-slate-300'}\`}>{company.name}</div>
           {company.isActive === false && <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Pasif</span>}
        </div>`
   );
}
fs.writeFileSync('src/app/companies/components/CompanyTableClient.tsx', tableStr, 'utf8');

let orderStr = fs.readFileSync('src/app/components/orders/OrderEntryForm.tsx', 'utf8');
if (!orderStr.includes('const activeCompanies = companies.filter(c => c.isActive !== false);')) {
    orderStr = orderStr.replace(
        'export default function OrderEntryForm({ initialData = null, companies = [] }: { initialData?: any, companies?: any[] }) {',
        `export default function OrderEntryForm({ initialData = null, companies = [] }: { initialData?: any, companies?: any[] }) {\n  const activeCompanies = companies.filter(c => c.isActive !== false || (initialData && [initialData.sellerId, initialData.buyerId, initialData.brandId, initialData.shipToId, initialData.agencyId].includes(c.id)));`
    );
    // Replace companies.filter(c => c.is... with activeCompanies.filter(c => c.is...
    orderStr = orderStr.replace(/companies\.filter/g, 'activeCompanies.filter');
}
fs.writeFileSync('src/app/components/orders/OrderEntryForm.tsx', orderStr, 'utf8');

console.log('Processed batch update successfully.');
