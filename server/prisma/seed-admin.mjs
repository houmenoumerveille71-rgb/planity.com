import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création de l\'admin par défaut...');

  // Vérifier si un admin existe déjà
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    console.log('✅ Un admin existe déjà:', existingAdmin.email);
    console.log('📝 Pour réinitialiser le mot de passe, utilisez le script de reset.');
    return;
  }

  // Créer l'admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@planity.com',
      name: 'Admin Principal',
      password: hashedPassword,
      role: 'admin',
      phone: '+229 XX XX XX XX'
    }
  });

  console.log('✅ Admin créé avec succès!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Mot de passe: admin123');
  console.log('');
  console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
