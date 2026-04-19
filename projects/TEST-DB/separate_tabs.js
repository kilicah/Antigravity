const fs = require('fs');

// 1. Update CompanyTableClient.tsx to use Tabs
let tableStr = fs.readFileSync('src/app/companies/components/CompanyTableClient.tsx', 'utf8');

if (!tableStr.includes('const [activeTab, setActiveTab]')) {
  // Add state
  tableStr = tableStr.replace(
    'const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);',
    'const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);\n  const [activeTab, setActiveTab] = useState<"active" | "passive">("active");'
  );

  // Add tabs and filter logic below h1
  tableStr = tableStr.replace(
    '<div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">',
    `
      <div className="flex space-x-1 border-b border-slate-200 mb-6">
        <button
          onClick={() => { setActiveTab("active"); setSelectedCompanyId(null); }}
          className={\`px-6 py-2.5 text-sm font-bold border-b-2 transition-colors \${activeTab === "active" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}\`}
        >
          ✅ Aktif Firmalar
        </button>
        <button
          onClick={() => { setActiveTab("passive"); setSelectedCompanyId(null); }}
          className={\`px-6 py-2.5 text-sm font-bold border-b-2 transition-colors \${activeTab === "passive" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}\`}
        >
          📁 Pasif (Arşivlenmiş) Firmalar
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">`
  );

  // Modify map to use filtered companies
  tableStr = tableStr.replace(
    'export default function CompanyTableClient({ companies }: { companies: any[] }) {',
    'export default function CompanyTableClient({ companies }: { companies: any[] }) {\n  const activeCompaniesList = companies.filter(c => c.isActive !== false);\n  const passiveCompaniesList = companies.filter(c => c.isActive === false);'
  );

  // Find {companies.length === 0 ? and replace with dynamic list
  tableStr = tableStr.replace(
    '{companies.length === 0 ? (',
    '{(activeTab === "active" ? activeCompaniesList : passiveCompaniesList).length === 0 ? ('
  );

  // Find companies.map((company) => ( and replace
  tableStr = tableStr.replace(
    'companies.map((company) => (',
    '(activeTab === "active" ? activeCompaniesList : passiveCompaniesList).map((company) => ('
  );
  
  // Also reset selected if they switch tabs. Handled in the button onClick.
  
  fs.writeFileSync('src/app/companies/components/CompanyTableClient.tsx', tableStr, 'utf8');
}

// 2. Update CompanyFormClient.tsx to have a more prominent Active/Passive button UX instead of hidden checkbox
let formStr = fs.readFileSync('src/app/companies/components/CompanyFormClient.tsx', 'utf8');

if (formStr.includes('input type="checkbox" name="isActive"')) {
   // Replace the checkbox with radio buttons that look like big blocks
   const oldCheckboxCode = `<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100/50 p-2 rounded-lg border border-slate-200">
              <input type="checkbox" name="isActive" defaultChecked={initialData ? initialData.isActive : true} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" />
              <span className="text-sm font-bold text-slate-800">Aktif Firma (Siparişlere Açık)</span>
            </label>
          </div>`;
          
    const newRadioCode = `
         <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Firma Durumu</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="isActive_ui" value="true" className="peer sr-only" defaultChecked={initialData ? initialData.isActive !== false : true} 
                  onChange={(e) => { document.getElementById("hidden_isActive").checked = true; }} />
                <div className="px-6 py-4 rounded-lg border-2 border-slate-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all text-center">
                  <div className="text-emerald-600 text-xl mb-1">✅</div>
                  <div className="font-bold text-slate-800">Aktif Durumda</div>
                  <div className="text-xs text-slate-500 mt-1">Yeni siparişlerde veya faturalarda seçilebilir.</div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="isActive_ui" value="false" className="peer sr-only" defaultChecked={initialData ? initialData.isActive === false : false} 
                  onChange={(e) => { document.getElementById("hidden_isActive").checked = false; }} />
                <div className="px-6 py-4 rounded-lg border-2 border-slate-200 peer-checked:border-slate-600 peer-checked:bg-slate-100 transition-all text-center">
                  <div className="text-slate-600 text-xl mb-1">📁</div>
                  <div className="font-bold text-slate-800">Pasif (Arşivlenmiş)</div>
                  <div className="text-xs text-slate-500 mt-1">Sipariş menülerinde gizlenir, sadece arşivde görünür.</div>
                </div>
              </label>
            </div>
            {/* The actual hidden input we send to action.ts based on radio state */}
            <input type="checkbox" id="hidden_isActive" name="isActive" className="hidden" defaultChecked={initialData ? initialData.isActive !== false : true} />
          </div>
    `;
    
    // We replace the old block or generic match
    const formStrModified = formStr.replace(oldCheckboxCode, newRadioCode);
    if (formStrModified !== formStr) {
       fs.writeFileSync('src/app/companies/components/CompanyFormClient.tsx', formStrModified, 'utf8');
    } else {
       // fallback generic replace if string mismatched
       const replaced = formStr.replace(/<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">.*?<\/label>\s*<\/div>/s, newRadioCode);
       fs.writeFileSync('src/app/companies/components/CompanyFormClient.tsx', replaced, 'utf8');
    }
}

console.log("Separated tabs and UX integrated.");
