import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createOrResetAdmin() {
  console.log('🔧 Création/Réinitialisation de l\'admin...\n');

  const email = 'houmenoumerveille71@gmail.com'; // METTRE VOTRE EMAIL ICI
  const newPassword = 'papa'; // METTRE VOTRE MOT DE PASSE ICI

  try {
    // Vérifier si l'admin existe
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (existing) {
      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          name: 'Admin Principal',
          role: 'admin'
        }
      });
      console.log('✅ Admin mis à jour !');
    } else {
      // Créer l'admin
      await prisma.user.create({
        data: {
          email,
          name: 'Admin Principal',
          password: hashedPassword,
          role: 'admin',
          phone: '+229 XX XX XX XX'
        }
      });
      console.log('✅ Admin créé !');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Mot de passe:', newPassword);
    console.log('\n⚠️  Connectez-vous avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createOrResetAdmin();
