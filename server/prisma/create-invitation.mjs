import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('📧 Création de l\'invitation manuellement...');

  const salonId = 8;
  const email = 'houmenouverveile771@gmail.com';
  const role = 'salon_owner';
  const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt';

  // Vérifier si le salon existe
  const salon = await prisma.salon.findUnique({
    where: { id: salonId }
  });

  if (!salon) {
    console.log('❌ Salon non trouvé avec ID:', salonId);
    return;
  }

  console.log('✅ Salon trouvé:', salon.name);

  // Vérifier si une invitation existe déjà
  const existingInvitation = await prisma.invitation.findFirst({
    where: { salonId, email, status: 'pending' }
  });

  if (existingInvitation) {
    console.log('⚠️  Une invitation existe déjà pour cet email');
    console.log('📝 Lien d\'invitation existant:');
    console.log(`http://localhost:5173/register?invite=${existingInvitation.token}`);
    return;
  }

  // Créer le token JWT
  const inviteToken = jwt.sign(
    { salonId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Créer l'invitation en base
  const invitation = await prisma.invitation.create({
    data: {
      salonId,
      email,
      role,
      token: inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      status: 'pending'
    }
  });

  console.log('✅ Invitation créée avec succès!');
  console.log('');
  console.log('📧 Lien d\'invitation:');
  console.log(`http://localhost:5173/register?invite=${inviteToken}`);
  console.log('');
  console.log('📋 Détails de l\'invitation:');
  console.log(`   - Email: ${email}`);
  console.log(`   - Rôle: ${role}`);
  console.log(`   - Salon: ${salon.name}`);
  console.log(`   - Expire: ${invitation.expiresAt}`);
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
