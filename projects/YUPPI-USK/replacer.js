const fs = require('fs');
const file = 'C:/X/Antigravity/projects/TEST-DB/src/app/rnd-items/components/RnDTableClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '<span className="text-sm font-semibold text-slate-800">{String(val)}</span>';
const replacement = `<span 
  className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-blue-700 hover:bg-blue-100 inline-block px-1 -mx-1 rounded transition-colors"
  title="Tıklayarak sadece bu değere sahip ürünleri filtrele"
  onClick={() => { setSearchTerm(String(val)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
>
  {String(val)}
</span>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Replaced successfully");
