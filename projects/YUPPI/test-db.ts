import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Seeding database with test master data...');

  const company = await prisma.company.create({
    data: {
      name: 'YUPPI TEST ALICI FIRMA A.Ş.',
      address: 'Test Mah. Test Sok. No: 1',
      taxOffice: 'Test VD',
      taxNo: '1234567890',
      phone: '+90 555 123 45 67',
    },
  });

  console.log(`Created Company: ${company.name} (ID: ${company.id})`);

  const currencyUsd = 'USD';
  const currencyEur = 'EUR';

  const bankUsd = await prisma.bankInfo.create({
    data: {
      companyId: company.id,
      currency: currencyUsd,
      bankName: 'Test Bank',
      branch: 'Merkez',
      iban: 'TR123456789000000000000000',
    },
  });

  const rep = await prisma.representative.create({
    data: {
      name: 'Ahmet Temsilci',
    },
  });
  
  const brand = await prisma.brand.create({
    data: {
      name: 'YUPPI BRAND EXCLUSIVE',
    },
  });

  console.log(`Created Master Data: Bank ID ${bankUsd.id}, Rep: ${rep.name}, Brand: ${brand.name}`);
  console.log('Test complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
