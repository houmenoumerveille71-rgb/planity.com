const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrphanedData() {
  console.log('🔍 Vérification des données...\n');

  // Récupérer tous les appointments avec leur user
  const appointments = await prisma.appointment.findMany({
    include: { user: true }
  });

  console.log('Total appointments:', appointments.length);

  // Vérifier les appointments sans user
  const orphaned = appointments.filter(apt => !apt.user);
  console.log('Appointments avec user null:', orphaned.length);

  if (orphaned.length > 0) {
    console.log('\n🗑️ Suppression des appointments orphelins...');
    for (const apt of orphaned) {
      await prisma.appointment.delete({ where: { id: apt.id } });
      console.log('  - Supprimé appointment ID:', apt.id);
    }
    console.log('✅ Nettoyage terminé !');
  } else {
    console.log('✅ Aucun appointment orphelin trouvé.');
  }

  // Vérifier les factures
  const invoices = await prisma.invoice.findMany({
    include: { appointment: { include: { user: true } } }
  });

  const orphanedInvoices = invoices.filter(inv => !inv.appointment || !inv.appointment.user);
  console.log('\nFactures avec appointment ou user null:', orphanedInvoices.length);

  if (orphanedInvoices.length > 0) {
    console.log('🗑️ Suppression des factures orphelines...');
    for (const inv of orphanedInvoices) {
      await prisma.invoice.delete({ where: { id: inv.id } });
      console.log('  - Supprimée facture ID:', inv.id);
    }
  }

  console.log('\n✨ Vérification terminée !');
}

checkOrphanedData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
