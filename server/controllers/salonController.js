import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Validation pour création/modification salon
export const salonValidation = [
  body('name').notEmpty().withMessage('Nom requis'),
  body('address').notEmpty().withMessage('Adresse requise'),
  body('category').notEmpty().withMessage('Catégorie requise')
];

// Rechercher salons
export const searchSalons = async (req, res) => {
  const { location, service, name, category } = req.query;
  
  try {
    const where = {};
    
    if (location) {
      where.OR = [
        { city: { contains: location } },
        { address: { contains: location } }
      ];
    }
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (category) {
      where.category = category;
    }
    
    const salons = await prisma.salon.findMany({
      where,
      include: {
        services: true,
        availabilities: true,
        user: { select: { name: true, phone: true } }
      }
    });
    
    res.json(salons);
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({ error: "Erreur lors de la recherche" });
  }
};

// Récupérer salon par ID
export const getSalonById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: parseInt(id) },
      include: {
        services: true,
        availabilities: true,
        user: { select: { name: true, email: true, phone: true } }
      }
    });
    
    if (!salon) {
      return res.status(404).json({ error: "Salon non trouvé" });
    }
    
    // Empêcher le cache pour always avoir les dernières données
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(salon);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
};

// Créer salon
export const createSalon = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, city, category, description, userId, image } = req.body;
  
  try {
    const salon = await prisma.salon.create({
      data: {
        name,
        address,
        city: city || null,
        category,
        description: description || null,
        image: image || null,
        userId: userId || null,
        validationMode: 'auto',
        depositRequired: true,
        cancellationDelay: '24',
        openingHours: '9h-19h'
      }
    });
    
    res.status(201).json(salon);
  } catch (error) {
    console.error('Erreur création:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

// Modifier salon
export const updateSalon = async (req, res) => {
  const { id } = req.params;
  const { name, address, city, category, description, openingHours } = req.body;
  
  try {
    const salon = await prisma.salon.update({
      where: { id: parseInt(id) },
      data: {
        name,
        address,
        city,
        category,
        description,
        openingHours
      }
    });
    
    res.json(salon);
  } catch (error) {
    console.error('Erreur modification:', error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
};

// Ajouter disponibilité
export const addAvailability = async (req, res) => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;
  
  try {
    const availability = await prisma.salonAvailability.create({
      data: {
        salonId: parseInt(id),
        dayOfWeek,
        startTime,
        endTime
      }
    });
    
    res.status(201).json(availability);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
};

// Récupérer disponibilités
export const getAvailabilities = async (req, res) => {
  const { id } = req.params;
  
  try {
    const availabilities = await prisma.salonAvailability.findMany({
      where: { salonId: parseInt(id) }
    });
    
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération" });
  }
};

// Récupérer services d'un salon
export const getSalonServices = async (req, res) => {
  const { id } = req.params;
  
  try {
    const services = await prisma.service.findMany({
      where: { salonId: parseInt(id) }
    });
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération services" });
  }
};

export default { searchSalons, getSalonById, createSalon, updateSalon, addAvailability, getAvailabilities, getSalonServices, salonValidation };
