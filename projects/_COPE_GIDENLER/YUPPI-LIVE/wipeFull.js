const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.rnDItem.deleteMany();
  console.log('Tüm Product ve RnDItem kayıtları kalıcı olarak silindi.');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
