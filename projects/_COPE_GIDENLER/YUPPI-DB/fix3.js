const fs = require('fs');

function fixDoc(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix repUser still remaining
  content = content.replace(/repUser\?\.phone \|\| /g, "sellerRepInfo.phone || ");

  // Fix any remaining `getRepEmail` calls if getRepInfo is present.
  // We notice the error said `Cannot find name 'getRepInfo'` at lines 48 & 50. This means `getRepInfo` wasn't defined OR was defined after its usage?
  // Let's just define `getRepInfo` properly.

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

  // Simply replace the old getRepEmail function block
  content = content.replace(/const getRepEmail = \(company.*?catch \(e\) \{\s*return "-";\s*\}\s*\};/gs, newGetRepFn);
  
  // What if I replaced it with `newGetRepFn` but `const sellerEmail = getRepEmail(...)` still exists?
  content = content.replace(/const sellerEmail = getRepEmail\([^;]+\);/g, "const sellerRepInfo = getRepInfo(order.seller, order.sellerRep);\n  const sellerEmail = sellerRepInfo.email;");
  content = content.replace(/const buyerEmail = getRepEmail\([^;]+\);/g, "const buyerRepInfo = getRepInfo(order.buyer, order.buyerRep);\n  const buyerEmail = buyerRepInfo.email;");

  fs.writeFileSync(file, content);
}

fixDoc('src/components/orders/SalesContractDocument.tsx');
fixDoc('src/components/orders/CommercialInvoiceDocument.tsx');

function removeProp(file, componentName) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = new RegExp('<' + componentName + '[^>]+repUser={repUser}[^>]*>', 'g');
  content = content.replace(regex, (match) => {
      return match.replace(/repUser={repUser}/g, '');
  });
  // Also remove it from `repUser={repUser}` if it's on a new line
  content = content.replace(/repUser={repUser}/g, '');
  
  // also clean up `let repUser = null; ...` block
  content = content.replace(/let repUser = null;\s*if \(userId\) \{\s*repUser = await prisma\.user\.findUnique\(\{ where: \{ id: parseInt\(userId, 10\) \} \}\);\s*\}/g, "");
  
  fs.writeFileSync(file, content);
}

removeProp('src/app/orders/[id]/page.tsx', 'SalesContractDocument');
removeProp('src/app/orders/[id]/invoice/page.tsx', 'CommercialInvoiceDocument');
removeProp('src/app/invoices/[id]/page.tsx', 'CommercialInvoiceDocument');

console.log('Fixed TypeScript errors');
