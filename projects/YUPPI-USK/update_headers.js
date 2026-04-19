const fs = require('fs');

const path = 'src/app/components/orders/OrderEntryForm.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const regex = /<th className="([^"]+)" title="([^"]+)">([^<]+)<\/th>/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(regex);
    if (match) {
        const className = match[1];
        const title = match[2];
        const abbr = match[3];
        
        // Remove 'cursor-help' if it exists since we are displaying the title now
        const newClass = className.replace('cursor-help ', '').replace('cursor-help', '');
        
        // Replace the whole line with the new structure
        // Keep the indentation
        const indent = line.substring(0, line.indexOf('<th'));
        
        lines[i] = `${indent}<th className="${newClass}">
${indent}  <div className="flex flex-col items-center justify-between h-full space-y-1">
${indent}    <span className="text-[9px] uppercase font-normal opacity-80 tracking-wider whitespace-normal leading-tight h-8 flex items-center text-center justify-center w-full px-1">${title}</span>
${indent}    <span className="font-bold border-t border-white/10 pt-1 w-full text-center">${abbr}</span>
${indent}  </div>
${indent}</th>`;
    }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Headers updated.');
