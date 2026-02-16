import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const salons = await prisma.salon.findMany();
    console.log('Salons:', salons);
    console.log(`Total salons: ${salons.length}`);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
