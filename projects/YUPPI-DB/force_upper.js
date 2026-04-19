const fs = require('fs');

const path = 'src/app/components/orders/OrderEntryForm.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const regex = /<span className="text-\[9px\] font-normal opacity-80 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">([^<]+)<\/span>/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(regex);
    if (match) {
        // match[1] is the inner text, e.g. 'Bulk Sample Quantity'
        const upperCased = match[1].toUpperCase();
        
        // Replace it!
        lines[i] = line.replace(match[1], upperCased);
    }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Made titles explicit uppercase.');
