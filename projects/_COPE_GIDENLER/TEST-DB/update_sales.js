const fs = require('fs');
const file = 'src/components/orders/SalesContractDocument.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace props
content = content.replace(
  'export default function SalesContractDocument({\\r\\n  order,\\r\\n  bankInfo\\r\\n}: {\\r\\n  order: any,\\r\\n  bankInfo: any\\r\\n}) {',
  'export default function SalesContractDocument({\\n  order,\\n  bankInfo,\\n  repUser\\n}: {\\n  order: any,\\n  bankInfo: any,\\n  repUser?: any\\n}) {'
);
content = content.replace(
  'export default function SalesContractDocument({\n  order,\n  bankInfo\n}: {\n  order: any,\n  bankInfo: any\n}) {',
  'export default function SalesContractDocument({\n  order,\n  bankInfo,\n  repUser\n}: {\n  order: any,\n  bankInfo: any,\n  repUser?: any\n}) {'
);

// Replace seller email
content = content.replace(
  '  const sellerEmail = getRepEmail(order.seller, order.sellerRep);',
  '  const sellerEmail = repUser?.email || getRepEmail(order.seller, order.sellerRep);'
);

// Replace seller phone TR
content = content.replace(
  'order.seller.phone && `T. ${order.seller.phone}`,',
  '(repUser?.phone || order.seller.phone) && `T. ${repUser?.phone || order.seller.phone}`,'
);

// Replace seller phone ENG
content = content.replace(
  'order.seller.phone && `P. ${order.seller.phone}`,',
  '(repUser?.phone || order.seller.phone) && `P. ${repUser?.phone || order.seller.phone}`,'
);

fs.writeFileSync(file, content);
console.log('Updated SalesContractDocument');
