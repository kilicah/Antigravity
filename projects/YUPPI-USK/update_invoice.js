const fs = require('fs');

// 1. Update CommercialInvoiceDocument.tsx
let invDocFile = 'src/components/orders/CommercialInvoiceDocument.tsx';
let invDoc = fs.readFileSync(invDocFile, 'utf8');

invDoc = invDoc.replace(
  'export default function CommercialInvoiceDocument({ order, bankInfo }: { order: any; bankInfo: any }) {',
  'export default function CommercialInvoiceDocument({ order, bankInfo, repUser }: { order: any; bankInfo: any; repUser?: any }) {'
);

invDoc = invDoc.replace(
  '                     order.seller.phone && `P. ${order.seller.phone}`,',
  '                     (repUser?.phone || order.seller.phone) && `P. ${repUser?.phone || order.seller.phone}`,'
);

invDoc = invDoc.replace(
  '                     order.seller.phone && `T. ${order.seller.phone}`,',
  '                     (repUser?.phone || order.seller.phone) && `T. ${repUser?.phone || order.seller.phone}`,'
);

fs.writeFileSync(invDocFile, invDoc);

// 2. Update app/invoices/[id]/page.tsx
let invPageFile = 'src/app/invoices/[id]/page.tsx';
let invPage = fs.readFileSync(invPageFile, 'utf8');

if (!invPage.includes('import { headers } from')) {
   invPage = invPage.replace('import { prisma } from "@/lib/prisma";', 'import { prisma } from "@/lib/prisma";\nimport { headers } from "next/headers";');
}

if (!invPage.includes('const userId = headersList.get(')) {
   invPage = invPage.replace(
     '  const invoice = await prisma.invoice.findUnique({',
     '  const headersList = await headers();\n  const userId = headersList.get("x-user-id");\n  let repUser = null;\n  if (userId) {\n     repUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });\n  }\n\n  const invoice = await prisma.invoice.findUnique({'
   );
}

invPage = invPage.replace(
  '<CommercialInvoiceDocument order={hybridOrderData as any} bankInfo={bankInfo} />',
  '<CommercialInvoiceDocument order={hybridOrderData as any} bankInfo={bankInfo} repUser={repUser} />'
);

fs.writeFileSync(invPageFile, invPage);

// 3. Update app/orders/[id]/invoice/page.tsx
let orderInvPageFile = 'src/app/orders/[id]/invoice/page.tsx';
let orderInvPage = fs.readFileSync(orderInvPageFile, 'utf8');

if (!orderInvPage.includes('import { headers } from')) {
   orderInvPage = orderInvPage.replace('import { prisma } from "@/lib/prisma";', 'import { prisma } from "@/lib/prisma";\nimport { headers } from "next/headers";');
}

if (!orderInvPage.includes('const userId = headersList.get(')) {
   orderInvPage = orderInvPage.replace(
     '  let order = null;',
     '  const headersList = await headers();\n  const userId = headersList.get("x-user-id");\n  let repUser = null;\n  if (userId) {\n     repUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });\n  }\n\n  let order = null;'
   );
}

orderInvPage = orderInvPage.replace(
  '<CommercialInvoiceDocument order={order} bankInfo={bankInfo} />',
  '<CommercialInvoiceDocument order={order} bankInfo={bankInfo} repUser={repUser} />'
);

fs.writeFileSync(orderInvPageFile, orderInvPage);

console.log('Updated CommercialInvoiceDocument and Pages');
