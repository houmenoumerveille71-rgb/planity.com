import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node set-admin.mjs <email>');
    console.log('Example: node set-admin.mjs user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });

    console.log('✅ Admin mis à jour avec succès!');
    console.log('Email:', email);
    console.log('ID:', user.id);
    console.log('\nVous pouvez maintenant vous connecter à l\'admin.');
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
