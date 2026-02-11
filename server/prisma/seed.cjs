const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  // On initialise sans fioritures
  const prisma = new PrismaClient();

  console.log("🌱 Connexion et nettoyage...");
  
  // On force l'utilisation de l'URL ici si jamais il râle
  await prisma.$connect();

  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.salonAvailability.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();

  console.log("🚀 Création du salon...");
  const salon = await prisma.salon.create({
    data: {
      name: "L'Atelier Coiffure",
      address: "12 rue de la Paix, Paris",
      category: "Coiffeur",
      services: {
        create: [
          { name: "Coupe Homme", price: 25, duration: 30 },
          { name: "Brushing Femme", price: 45, duration: 45 }
        ]
      }
    }
  });

  console.log("📅 Ajout des disponibilités...");
  // Lundi à vendredi, 9h-18h
  for (let day = 1; day <= 5; day++) {
    await prisma.salonAvailability.create({
      data: {
        salonId: salon.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
      }
    });
  }

  // Créer un utilisateur salon_owner pour démo
  console.log("👤 Création d'un propriétaire de salon...");
  await prisma.user.create({
    data: {
      name: "Propriétaire Salon",
      email: "owner@salon.com",
      password: await bcrypt.hash("password123", 10),
      role: "salon_owner",
    },
  });

  console.log("✅ Terminé !");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erreur fatale :", e);
  process.exit(1);
});