const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Nettoyage de la base de données...\n');

  // Supprimer les appointments avec userId null
  try {
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: { userId: null }
    });
    console.log('✅ Appointments avec userId null supprimés:', deletedAppointments.count);
  } catch (err) {
    console.log('ℹ️ Aucun appointment avec userId null à supprimer (ou erreur):', err.message);
  }

  // Supprimer les factures qui n'ont pas d'appointment valide
  try {
    const invoices = await prisma.invoice.findMany({
      include: { appointment: true }
    });

    let deletedInvoices = 0;
    for (const inv of invoices) {
      if (!inv.appointment || inv.appointment.userId === null) {
        await prisma.invoice.delete({ where: { id: inv.id } });
        deletedInvoices++;
      }
    }
    console.log('✅ Factures sans appointment valide supprimées:', deletedInvoices);
  } catch (err) {
    console.log('ℹ️ Erreur lors de la suppression des factures:', err.message);
  }

  console.log('\n✨ Nettoyage terminé !');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
