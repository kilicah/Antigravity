const fs = require('fs');

// 1. Remove "Tamamen Sil" from CompanyFormClient.tsx
let formStr = fs.readFileSync('src/app/companies/components/CompanyFormClient.tsx', 'utf8');

// Find the delete button block at the bottom
const deleteBlockRegex = /<div className="pt-4 flex justify-between items-center bg-slate-50\/50 p-4 border-t border-slate-200 -mx-6 -mb-6 mt-6 px-6 rounded-b-xl border">[\s\S]*?<button type="submit"/m;
if (deleteBlockRegex.test(formStr)) {
    formStr = formStr.replace(deleteBlockRegex, '<div className="pt-4 flex justify-end">\n          <button type="submit"');
    fs.writeFileSync('src/app/companies/components/CompanyFormClient.tsx', formStr, 'utf8');
}

// 2. Disable "Tamamen Sil" in CompanyTableClient.tsx if company is Active
let tableStr = fs.readFileSync('src/app/companies/components/CompanyTableClient.tsx', 'utf8');

// The delete button in TableClient is currently:
// selectedCompanyId ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
// We need to also check if the selected company is passive.
// First, find the selected company object:
if (!tableStr.includes('const selectedCompany = companies.find(c => c.id === selectedCompanyId);')) {
    tableStr = tableStr.replace(
        'const handleEditClick = () => {',
        'const selectedCompany = companies.find(c => c.id === selectedCompanyId);\n  const isDeleteEnabled = selectedCompany && selectedCompany.isActive === false;\n\n  const handleEditClick = () => {'
    );
}

// Second, update the button disable logic
if (tableStr.includes('disabled={!selectedCompanyId}')) {
    tableStr = tableStr.replace(
        /onClick={handleDelete}\s*disabled={!selectedCompanyId}/,
        'onClick={handleDelete}\n            disabled={!isDeleteEnabled}'
    );
    
    // Update the button classes to reflect disabled state when active
    const classLogic = `selectedCompanyId 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"`;
    const newClassLogic = `isDeleteEnabled 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"`;
                
    tableStr = tableStr.replace(classLogic, newClassLogic);
    
    fs.writeFileSync('src/app/companies/components/CompanyTableClient.tsx', tableStr, 'utf8');
}

console.log('UI Changes Applied.');
