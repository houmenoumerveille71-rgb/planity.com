import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Fonction pour géocoder une adresse via Google Geocoding API
async function geocodeAddress(address) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.log('⚠️ Clé API Google Maps non configurée');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

async function updateSalonCoordinates() {
  try {
    // Récupérer tous les salons sans coordonnées
    const salons = await prisma.salon.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });

    console.log(`🔄 Mise à jour de ${salons.length} salons...`);

    for (const salon of salons) {
      console.log(`📍 Géocodage de: ${salon.name} (${salon.address})`);

      const coords = await geocodeAddress(salon.address);

      if (coords) {
        await prisma.salon.update({
          where: { id: salon.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        });
        console.log(`   ✓ Coordonnées ajoutées: ${coords.latitude}, ${coords.longitude}`);
      } else {
        console.log(`   ✗ Impossible de géocoder l'adresse`);
      }

      // Attendre un peu pour éviter les limites de l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Mise à jour terminée!');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSalonCoordinates();
