const fs = require('fs');

const path = 'src/app/components/orders/OrderEntryForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Dropdown logic (two occurrences generally: Seller Rep and Buyer Rep)
const oldDropdown = "const display = nameEn ? `${nameTr} / ${nameEn}` : nameTr;";
const newDropdown = "const display = (formData.language === 'ENG' && nameEn) ? nameEn : nameTr;";

content = content.replace(new RegExp(oldDropdown.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newDropdown);

// 2. Bold headers
// <span className="text-[9px] font-normal opacity-80 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">
// We will change font-normal to font-bold and optionally adjust opacity
content = content.replace(/font-normal opacity-80/g, 'font-bold opacity-100');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dropdowns and bolded headers.');
