const fs = require('fs');

const path = 'src/app/components/orders/OrderEntryForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// The CSS `uppercase` class causes 'i' to become 'İ' in Turkish browsers.
// We remove `uppercase` and enforce english safe toUpperCase() or just leave them in original casing.
// Actually, original casing looks better anyway without uppercase.
content = content.replace(/className="text-\[9px\] uppercase /g, 'className="text-[9px] ');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed CSS uppercase locale bug.');
