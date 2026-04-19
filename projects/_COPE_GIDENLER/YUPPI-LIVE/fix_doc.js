const fs = require('fs');

const files = [
  'src/components/orders/SalesContractDocument.tsx',
  'src/components/orders/CommercialInvoiceDocument.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Strip repUser from props definition
  content = content.replace(',\\n  repUser\\n}: {\\n  order: any,\\n  bankInfo: any,\\n  repUser?: any\\n}', '\\n}: {\\n  order: any,\\n  bankInfo: any\\n}');
  content = content.replace(/,\\s*repUser.*?:.*?{.*?order:.*?any,.*?bankInfo:.*?any,.*?repUser\?:.*?any.*?}/gs, '\\n}: {\\n  order: any,\\n  bankInfo: any\\n}');

  // In case the multiline replace missed it, try a fallback RegExp
  content = content.replace(/,\s*repUser\s*}: {\s*order: any,\s*bankInfo: any,\s*repUser\?: any\s*}/g, '}: {\n  order: any,\n  bankInfo: any\n}');

  // Replace getRepEmail with getRepInfo
  const oldGetRepFn = `  const getRepEmail = (company: any, repName: string) => {
    if (!company?.repsJson || !repName) return "-";
    try {
        const reps = JSON.parse(company.repsJson);
        const nameToMatch = repName.includes('|') ? repName.split('|')[0].trim().toLocaleUpperCase('tr-TR') : repName.trim().toLocaleUpperCase('tr-TR');
        const found = reps.find((r: any) => {
            const raw = r.name || "";
            const n = raw.includes('|') ? raw.split('|')[0] : raw;
            return n.trim().toLocaleUpperCase('tr-TR') === nameToMatch;
        });
        return found?.email?.toLowerCase() || "-";
    } catch (e) {
        return "-";
    }
  };`;

  const newGetRepFn = `  const getRepInfo = (company: any, repName: string) => {
    if (!company?.repsJson || !repName) return { email: "-", phone: "" };
    try {
        const reps = JSON.parse(company.repsJson);
        const nameToMatch = repName.includes('|') ? repName.split('|')[0].trim().toLocaleUpperCase('tr-TR') : repName.trim().toLocaleUpperCase('tr-TR');
        const found = reps.find((r: any) => {
            const raw = r.name || "";
            const n = raw.includes('|') ? raw.split('|')[0] : raw;
            return n.trim().toLocaleUpperCase('tr-TR') === nameToMatch;
        });
        return {
           email: found?.email?.toLowerCase() || "-",
           phone: found?.phone || ""
        };
    } catch (e) {
        return { email: "-", phone: "" };
    }
  };`;

  content = content.replace(oldGetRepFn, newGetRepFn);

  // Replace sellerEmail
  content = content.replace("const sellerEmail = repUser?.email || getRepEmail(order.seller, order.sellerRep);", "const sellerRepInfo = getRepInfo(order.seller, order.sellerRep);\n  const sellerEmail = sellerRepInfo.email;");
  
  // if not previously replaced perfectly (e.g. still uses getRepEmail)
  content = content.replace("const sellerEmail = getRepEmail(order.seller, order.sellerRep);", "const sellerRepInfo = getRepInfo(order.seller, order.sellerRep);\n  const sellerEmail = sellerRepInfo.email;");

  // Fix Buyer email as well
  content = content.replace("const buyerEmail = getRepEmail(order.buyer, order.buyerRep);", "const buyerRepInfo = getRepInfo(order.buyer, order.buyerRep);\n  const buyerEmail = buyerRepInfo.email;");

  // Fix phones mapping (P. and T.)
  content = content.replace(/(repUser\?\.phone \|\| order\.seller\.phone) && `T\. \$\{(repUser\?\.phone \|\| order\.seller\.phone)\}`/g, "(sellerRepInfo.phone || order.seller.phone) && `T. \${sellerRepInfo.phone || order.seller.phone}`");
  content = content.replace(/(repUser\?\.phone \|\| order\.seller\.phone) && `P\. \$\{(repUser\?\.phone \|\| order\.seller\.phone)\}`/g, "(sellerRepInfo.phone || order.seller.phone) && `P. \${sellerRepInfo.phone || order.seller.phone}`");

  // Optional: Also replace buyer phone
  content = content.replace(/order\.buyer\.phone && `T\. \$\{order\.buyer\.phone\}`/g, "(buyerRepInfo.phone || order.buyer.phone) && `T. \${buyerRepInfo.phone || order.buyer.phone}`");
  content = content.replace(/order\.buyer\.phone && `P\. \$\{order\.buyer\.phone\}`/g, "(buyerRepInfo.phone || order.buyer.phone) && `P. \${buyerRepInfo.phone || order.buyer.phone}`");

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}
