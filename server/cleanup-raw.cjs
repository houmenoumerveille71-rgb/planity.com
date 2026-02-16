const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupRawSQL() {
  console.log('🧹 Nettoyage avec SQL brut...\n');

  // Utiliser une requête SQL directe pour trouver les appointments orphelins
  const [orphanedAppointments] = await prisma.$queryRaw`
    SELECT a.id FROM Appointment a
    LEFT JOIN User u ON a.userId = u.id
    WHERE u.id IS NULL
  `;

  console.log('Appointments orphelins trouvés:', orphanedAppointments.length);

  if (orphanedAppointments.length > 0) {
    // Supprimer les factures associées aux appointments orphelins
    await prisma.$queryRaw`
      DELETE FROM Invoice
      WHERE appointmentId IN (SELECT id FROM Appointment WHERE userId NOT IN (SELECT id FROM User))
    `;
    console.log('✅ Factures supprimées');

    // Supprimer les appointments orphelins
    await prisma.$queryRaw`
      DELETE FROM Appointment WHERE userId NOT IN (SELECT id FROM User)
    `;
    console.log('✅ Appointments supprimés:', orphanedAppointments.length);
  } else {
    console.log('✅ Aucun appointment orphelin');
  }

  // Vérifier les factures orphelines
  const [orphanedInvoices] = await prisma.$queryRaw`
    SELECT i.id FROM Invoice i
    LEFT JOIN Appointment a ON i.appointmentId = a.id
    WHERE a.id IS NULL OR a.userId NOT IN (SELECT id FROM User)
  `;

  console.log('Factures orphelines:', orphanedInvoices.length);

  if (orphanedInvoices.length > 0) {
    await prisma.$queryRaw`
      DELETE FROM Invoice
      WHERE appointmentId NOT IN (SELECT id FROM Appointment)
    `;
    console.log('✅ Factures orphelines supprimées');
  }

  console.log('\n✨ Nettoyage terminé !');
}

cleanupRawSQL()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
