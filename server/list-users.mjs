import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' }
    });

    console.log('📋 Liste des utilisateurs :\n');
    console.log('ID | Nom | Email | Rôle | Créé le');
    console.log('---|-----|-------|------|----------');

    users.forEach(user => {
      const isAdmin = user.role === 'admin' ? '✅' : '';
      console.log(`${user.id} | ${user.name} | ${user.email} | ${user.role} ${isAdmin} | ${user.createdAt.toLocaleDateString()}`);
    });

    console.log('\n📌 Comptes admin existants :');
    const admins = users.filter(u => u.role === 'admin');
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`  - ${admin.email}`);
      });
    } else {
      console.log('  Aucun compte admin trouvé.');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
