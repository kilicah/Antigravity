const fs = require('fs');
let file = 'src/app/orders/[id]/invoice/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace 1
content = content.replace(
  '  // Fetch default bank info\n  const bankInfo = await prisma.bankInfo.findFirst({',
  '  const headersList = await headers();\n  const userId = headersList.get("x-user-id");\n  let repUser = null;\n  if (userId) {\n     repUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });\n  }\n\n  // Fetch default bank info\n  const bankInfo = await prisma.bankInfo.findFirst({'
);

content = content.replace(
  '  // Fetch default bank info\r\n  const bankInfo = await prisma.bankInfo.findFirst({',
  '  const headersList = await headers();\n  const userId = headersList.get("x-user-id");\n  let repUser = null;\n  if (userId) {\n     repUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });\n  }\n\n  // Fetch default bank info\n  const bankInfo = await prisma.bankInfo.findFirst({'
);

fs.writeFileSync(file, content);
console.log('Fixed repUser error');
