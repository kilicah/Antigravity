import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reps = [
  { name: "ABDULLAH HÜSEYİN KILIÇ|ABDULLAH HUSEYIN KILIC", email: "hk@usktextile.com", phone: "+90 533 5581409" },
  { name: "FATİH MEHMET KILIÇ|FATIH MEHMET KILIC", email: "fk@usktekstil.com.tr", phone: "+90 533 7334595" },
  { name: "MUZAFFER KILIÇ|MUZAFFER KILIC", email: "mk@usktekstil.com.tr", phone: "+90 533 3735577" },
  { name: "SALMA SEYMEN|SALMA SEYMEN", email: "salma.seymen@usktekstil.com.tr", phone: "+90 543 8562782" },
  { name: "SABRİNA SARVAROVA|SABRINA SARVAROVA", email: "sabrina@usktekstil.com.tr", phone: "+90 516 1653816" },
  { name: "MEVLÜT KALAYCI|MEVLUT KALAYCI", email: "mevlut@usktekstil.com.tr", phone: "+90 533 1556465" },
  { name: "RAHMİ KÖLEGÖZ|RAHMI KOLEGOZ", email: "rk@usktekstil.com.tr", phone: "+90 532 4224426" }
];

async function main() {
  for (const rep of reps) {
    await prisma.representative.create({
      data: rep
    });
  }
  console.log("Representatives seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
