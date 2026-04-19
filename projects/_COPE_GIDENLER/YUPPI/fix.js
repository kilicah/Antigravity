const fs = require('fs');

const filePath = 'src/components/orders/SalesContractDocument.tsx';
let text = fs.readFileSync(filePath, 'utf-8');

text = text.replace("export default function SalesContractDocument({\n  order,\n  bankInfo\n}: {\n  order: any,\n  bankInfo: any\n}) {", "export default function SalesContractDocument({\n  order,\n  bankInfo,\n  repUser\n}: {\n  order: any,\n  bankInfo: any,\n  repUser?: any\n}) {");

text = text.replace("export default function SalesContractDocument({\r\n  order,\r\n  bankInfo\r\n}: {\r\n  order: any,\r\n  bankInfo: any\r\n}) {", "export default function SalesContractDocument({\n  order,\n  bankInfo,\n  repUser\n}: {\n  order: any,\n  bankInfo: any,\n  repUser?: any\n}) {");

fs.writeFileSync(filePath, text, 'utf-8');
console.log("Fixed!");
