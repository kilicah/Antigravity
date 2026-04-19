const fs = require('fs');
let file = fs.readFileSync('c:/X/Antigravity/projects/YUPPI/src/components/orders/SalesContractDocument.tsx', 'utf8');

file = file.replace(
    /<table className="w-full border-collapse pagebreak" style=\{\{ pageBreakBefore: 'always', breakBefore: 'page' \}\}>/,
    '<div style={{ pageBreakBefore: \'always\', breakBefore: \'page\', display: \'block\', height: \'1px\' }} className="hidden print:block w-full">&nbsp;</div>\n         <table className="w-full border-collapse">'
);

fs.writeFileSync('c:/X/Antigravity/projects/YUPPI/src/components/orders/SalesContractDocument.tsx', file);
