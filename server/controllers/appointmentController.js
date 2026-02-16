import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Validation pour rendez-vous
export const appointmentValidation = [
  body('serviceId').isInt().withMessage('Service requis'),
  body('startTime').isISO8601().withMessage('Date invalide'),
  body('salonId').isInt().withMessage('Salon requis')
];

// Créer rendez-vous
export const createAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { serviceId, startTime, salonId } = req.body;
  const userId = req.user.id;
  
  try {
    // Vérifier que le service existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return res.status(404).json({ error: "Service non trouvé" });
    }
    
    // Vérifier disponibilité (simplifié)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        serviceId,
        startTime: new Date(startTime)
      }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ error: "Ce créneau n'est plus disponible" });
    }
    
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        serviceId,
        salonId,
        startTime: new Date(startTime),
        endTime: new Date(new Date(startTime).getTime() + service.duration * 60000),
        status: 'pending'
      },
      include: {
        service: true,
        salon: { select: { name: true, address: true } }
      }
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erreur création RDV:', error);
    res.status(500).json({ error: "Erreur lors de la création du rendez-vous" });
  }
};

// Récupérer rendez-vous utilisateur
export const getUserAppointments = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        service: true,
        salon: { select: { name: true, address: true, image: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: "Erreur récupération" });
  }
};

// Récupérer rendez-vous salon (propriétaire/employé)
export const getSalonAppointments = async (req, res) => {
  const { salonId } = req.params;
  
  try {
    const appointments = await prisma.appointment.findMany({
      where: { salonId: parseInt(salonId) },
      include: {
        service: true,
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { startTime: 'asc' }
    });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération" });
  }
};

// Annuler rendez-vous (marquer comme annulé)
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }
    
    // Vérifier authorization
    const salon = await prisma.salon.findUnique({
      where: { id: appointment.salonId }
    });
    
    if (appointment.userId !== userId && salon.userId !== userId) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Marquer comme annulé au lieu de supprimer
    await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });
    
    res.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    console.error('Erreur annulation:', error);
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
};

// Modifier rendez-vous (reprogrammer)
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { startTime } = req.body;
  const userId = req.user.id;
  
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: "Rendez-vous non trouvé" });
    }
    
    // Vérifier authorization
    const salon = await prisma.salon.findUnique({
      where: { id: appointment.salonId }
    });
    
    if (appointment.userId !== userId && salon.userId !== userId) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Récupérer le service pour calculer la nouvelle date de fin
    const service = await prisma.service.findUnique({
      where: { id: appointment.serviceId }
    });
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(new Date(startTime).getTime() + service.duration * 60000)
      },
      include: {
        service: true,
        salon: { select: { name: true, address: true, image: true } }
      }
    });
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erreur modification RDV:', error);
    res.status(500).json({ error: "Erreur lors de la modification du rendez-vous" });
  }
};

// Créer facture
export const createInvoice = async (req, res) => {
  const { appointmentId, amount } = req.body;
  
  try {
    const invoice = await prisma.invoice.create({
      data: {
        appointmentId,
        amount,
        status: 'unpaid'
      }
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Erreur création facture" });
  }
};

export default { createAppointment, getUserAppointments, getSalonAppointments, cancelAppointment, updateAppointment, createInvoice, appointmentValidation };
