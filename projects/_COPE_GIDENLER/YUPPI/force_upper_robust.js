const fs = require('fs');
const content = fs.readFileSync('src/app/components/orders/OrderEntryForm.tsx', 'utf8');

const regex = /(<span className="text-\[9px\][^>]+>)([^<]+)(<\/span>)/g;
const newContent = content.replace(regex, (match, p1, p2, p3) => {
    // p2 is the text, e.g. "Bulk Sample Quantity", we will clean any weird spaces and uppercase it.
    let text = p2.trim().replace(/\s+/g, ' ').toUpperCase();
    return p1 + text + p3;
});

fs.writeFileSync('src/app/components/orders/OrderEntryForm.tsx', newContent, 'utf8');
console.log('Fixed spacing and uppercased texts properly.');
