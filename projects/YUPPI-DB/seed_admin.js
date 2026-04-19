const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const password = await bcrypt.hash('1996', 10);
  await prisma.user.upsert({
    where: { username: 'kilicah' },
    update: { password, role: 'ADMIN' },
    create: {
      username: 'kilicah',
      password,
      role: 'ADMIN'
    }
  });
  console.log("Master user created");
}
seed().finally(() => prisma.$disconnect());
