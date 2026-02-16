import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === JOURNALISATION DES ACTIONS ADMIN ===
const adminLogs = [];

const logAdminAction = (adminId, adminEmail, action, details) => {
  const log = {
    timestamp: new Date().toISOString(),
    adminId,
    adminEmail,
    action,
    details,
    ip: 'N/A'
  };
  adminLogs.push(log);
  console.log(`[ADMIN LOG] ${log.timestamp} - ${adminEmail}: ${action}`, details);
  
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(
    path.join(logDir, 'admin-actions.log'),
    JSON.stringify(log) + '\n'
  );
};

// === MODÉRATION D'IMAGES ===
const moderationStatus = new Map();

const checkImageContent = async (imageUrl) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return { status: 'pending', message: 'Image en attente de modération' };
};

// === CONFIGURATION CLOUDINARY ===
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, veuillez réessayer plus tard" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, veuillez réessayer plus tard" }
});

let transporter;

const createTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  console.log('🔍 Configuration SMTP检测:');
  console.log('   - SMTP_HOST:', smtpHost || 'NON DÉFINI');
  console.log('   - SMTP_USER:', smtpUser || 'NON DÉFINI');
  console.log('   - SMTP_PASS:', smtpPass ? 'DÉFINI (caché)' : 'NON DÉFINI');
  
  if (smtpHost && smtpUser && smtpPass) {
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        tls: { rejectUnauthorized: false },
        auth: { user: smtpUser, pass: smtpPass },
      });
      
      // Tester la connexion
      await transporter.verify();
      console.log('✅ Connexion SMTP établie avec succès');
      console.log(`📧 Serveur email: ${smtpHost}`);
    } catch (smtpError) {
      console.error('❌ Erreur connexion SMTP:', smtpError.message);
      // Fallback vers mode simulation
      transporter = null;
    }
  } else {
    console.log('⚠️ Pas de configuration SMTP - les emails seront simulés');
  }
  
  // Créer un dummy transporter si pas de vraie config
  if (!transporter) {
    transporter = {
      sendMail: async (options) => {
        console.log('═══════════════════════════════════════════');
        console.log('📧 [EMAIL SIMULÉ] À:', options.to);
        console.log('📧 [EMAIL SIMULÉ] Sujet:', options.subject);
        console.log('📧 [EMAIL SIMULÉ] Contenu:');
        console.log(options.html || options.text);
        console.log('═══════════════════════════════════════════');
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }
  
  return transporter;
};

createTransporter();

app.use(cors());
app.use(express.json());
app.use(limiter);

import authController from './controllers/authController.js';
import invitationController from './controllers/invitationController.js';
import salonController from './controllers/salonController.js';
import appointmentController from './controllers/appointmentController.js';
import { getGallery, addPhoto, deletePhoto, setPrimary } from './controllers/galleryController.js';

// === ROUTES AUTH ===
app.post('/api/auth/register', authLimiter, authController.registerValidation, authController.register);
app.post('/api/auth/login', authLimiter, authController.loginValidation, authController.login);
app.post('/api/auth/pro/login', authLimiter, authController.loginValidation, authController.proLogin);
app.post('/api/auth/admin/login', authLimiter, authController.adminLogin);
app.post('/api/auth/pro/register', async (req, res) => {
  const { email, password, name, phone, businessType, workLocation, experience, workRhythm, siret, hasSalon, salonId } = req.body;
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer le compte pro
    const user = await prisma.user.create({
      data: { 
        email, name, password: hashedPassword, phone: phone || null, role: 'salon_owner',
        siret: siret || null, businessType: businessType || null,
        workLocation: workLocation || null, experience: experience || null, workRhythm: workRhythm || null,
      }
    });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Erreur inscription pro:', error);
    res.status(400).json({ error: "Erreur lors de l'inscription" });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: "Si l'email existe, un lien a été envoyé" });

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(`🔗 Lien de réinitialisation pour ${user.email} : ${resetUrl}`);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@votre-domaine.com',
        to: user.email,
        subject: 'Réinitialisation de mot de passe',
        html: `<p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe</p>`,
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.json({ message: "Si l'email existe, un lien a été envoyé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, resetToken: token, resetTokenExpiry: { gte: new Date() } }
    });
    
    if (!user) return res.status(400).json({ error: "Token invalide ou expiré" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });
    
    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(400).json({ error: "Token invalide ou expiré" });
  }
});

// === ROUTES UTILISATEURS ===
app.put('/api/users/profile', invitationController.authenticateToken, async (req, res) => {
  const { name, firstName, lastName, email, phone } = req.body;
  try {
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" });
    }

    let fullName = name;
    if (firstName || lastName) fullName = `${firstName || ''} ${lastName || ''}`.trim();

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(fullName && { name: fullName }), ...(email && { email }), ...(phone !== undefined && { phone }) },
    });

    res.json({ message: "Profil mis à jour", user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone } });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

app.post('/api/users/change-password', invitationController.authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!req.user?.password) return res.status(400).json({ error: "Pas de mot de passe défini" });

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe actuel incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

app.put('/api/users/profile-image', invitationController.authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    let imageUrl = req.user.profileImage;
    
    if (req.body.deleteImage === 'true') {
      imageUrl = null;
    } else if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'profiles' }
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Erreur upload Cloudinary:', uploadError);
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: imageUrl },
    });

    res.json({ 
      message: "Photo de profil mise à jour", 
      profileImage: updatedUser.profileImage 
    });
  } catch (error) {
    console.error('Erreur upload photo profil:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// === ROUTES ADMIN ===
app.get('/api/admin/users', invitationController.requireAdmin, authController.getAllUsers);

// === ROUTES INVITATIONS ===
app.post('/api/salons/:id/invite', invitationController.authenticateToken, invitationController.createInvitation);
app.get('/api/salons/:id/invitations', invitationController.authenticateToken, invitationController.getInvitations);
app.post('/api/auth/register-invite', invitationController.acceptInvite);
app.delete('/api/invitations/:id', invitationController.authenticateToken, invitationController.cancelInvitation);
app.get('/api/invitations/:token', invitationController.getInvitationByToken);
app.post('/api/invitations/:token/accept', invitationController.acceptInvite);

// === ROUTES SALONS ===
app.get('/api/salons', salonController.searchSalons);
app.get('/api/salons/search', salonController.searchSalons);
app.get('/api/salons/:id', salonController.getSalonById);
app.put('/api/salons/:id', invitationController.authenticateToken, salonController.updateSalon);
app.get('/api/salons/:id/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Date requise" });
  
  try {
    const availabilities = await prisma.salonAvailability.findMany({
      where: { salonId: parseInt(req.params.id), dayOfWeek: new Date(date).getDay() },
    });
    
    if (availabilities.length === 0) return res.json([]);
    
    const slots = [];
    availabilities.forEach(avail => {
      const start = new Date(`${date}T${avail.startTime}:00`);
      const end = new Date(`${date}T${avail.endTime}:00`);
      let current = new Date(start);
      while (current < end) {
        slots.push(current.toTimeString().substring(0, 5));
        current.setMinutes(current.getMinutes() + 30);
      }
    });
    
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        salonId: parseInt(req.params.id),
        startTime: { gte: new Date(`${date}T00:00:00`), lt: new Date(`${date}T23:59:59`) },
      },
      include: { service: true },
    });
    
    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(`${date}T${slot}:00`);
      return !existingAppointments.some(appt => {
        const apptEnd = new Date(appt.startTime.getTime() + appt.service.duration * 60000);
        return slotStart < apptEnd && slotStart >= appt.startTime;
      });
    });
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
});

// === ROUTES HORAIRES D'OUVERTURE ===
app.get('/api/salons/:id/availabilities', async (req, res) => {
  try {
    const availabilities = await prisma.salonAvailability.findMany({
      where: { salonId: parseInt(req.params.id) },
    });
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
});

// === ROUTES GALERIE PHOTOS ===
app.get('/api/salons/:id/gallery', getGallery);
app.post('/api/salons/:id/gallery', invitationController.authenticateToken, upload.none(), addPhoto);
app.delete('/api/gallery/:id', invitationController.authenticateToken, deletePhoto);
app.patch('/api/gallery/:id/primary', invitationController.authenticateToken, setPrimary);

app.put('/api/salons/:id/availabilities', invitationController.authenticateToken, async (req, res) => {
  const salonId = parseInt(req.params.id);
  const { availabilities } = req.body;

  try {
    const salon = await prisma.salon.findFirst({ 
      where: { id: salonId, userId: req.user.id } 
    });

    if (!salon) {
      return res.status(403).json({ error: "Action non autorisée sur ce salon." });
    }

    await prisma.$transaction([
      prisma.salonAvailability.deleteMany({
        where: { salonId: salonId }
      }),
      ...(availabilities && availabilities.length > 0 ? [
        prisma.salonAvailability.createMany({
          data: availabilities.map(a => ({
            salonId: salonId,
            dayOfWeek: parseInt(a.dayOfWeek),
            startTime: a.startTime,
            endTime: a.endTime
          }))
        })
      ] : [])
    ]);

    res.json({ message: "Horaires mis à jour avec succès" });
  } catch (error) {
    console.error('Erreur Transaction Horaires:', error);
    res.status(500).json({ error: "Erreur interne lors de l'enregistrement" });
  }
});

// === ROUTES RENDEZ-VOUS ===
app.post('/api/appointments', invitationController.authenticateToken, async (req, res) => {
  const { salonId, serviceId, startTime } = req.body;
  try {
    const salon = await prisma.salon.findUnique({ where: { id: parseInt(salonId) } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    if (!salon.isActive) return res.status(400).json({ error: "Ce salon est désactivé" });
    if (salon.approvalStatus === 'rejected') return res.status(400).json({ error: "Ce salon n'est plus accepté" });
    
    const service = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
    if (!service) return res.status(404).json({ error: "Service non trouvé" });
    
    const requestedStart = new Date(startTime);
    const now = new Date();
    if (requestedStart <= now) return res.status(400).json({ error: "Impossible de réserver dans le passé" });
    
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        salonId: parseInt(salonId),
        status: { notIn: ['cancelled'] },
        OR: [
          {
            AND: [
              { startTime: { lte: requestedStart } },
              { endTime: { gt: requestedStart } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(requestedStart.getTime() + service.duration * 60000) } },
              { startTime: { gte: requestedStart } }
            ]
          }
        ]
      }
    });
    
    if (conflictingAppointment) return res.status(400).json({ error: "Ce créneau est déjà réservé" });
    
    const day = requestedStart.getDay();
    const requestedEnd = new Date(requestedStart.getTime() + service.duration * 60000);
    
    const availabilities = await prisma.salonAvailability.findMany({
      where: { salonId: parseInt(salonId), dayOfWeek: day },
    });
    
    if (availabilities.length === 0) return res.status(400).json({ error: "Aucune disponibilité" });
    
    const requestedStartTime = requestedStart.toTimeString().substring(0, 5);
    const requestedEndTime = requestedEnd.toTimeString().substring(0, 5);
    
    const isAvailable = availabilities.some(avail => 
      requestedStartTime >= avail.startTime && requestedEndTime <= avail.endTime
    );
    
    if (!isAvailable) return res.status(400).json({ error: "Créneau hors des horaires d'ouverture" });
    
    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user.id,
        salonId: parseInt(salonId),
        serviceId: parseInt(serviceId),
        startTime: requestedStart,
        endTime: requestedEnd,
        status: 'pending',
      }
    });
    
    // Vérifier si acompte requis
    if (salon.depositRequired && service.price > 0) {
      const depositAmount = Math.round(service.price * 0.5 * 100) / 100;
      const invoice = await prisma.invoice.create({
        data: {
          appointmentId: appointment.id,
          amount: depositAmount,
          status: 'pending',
          type: 'deposit',
        }
      });
      res.json({ 
        appointment, 
        depositRequired: true, 
        depositAmount,
        invoiceId: invoice.id 
      });
    } else {
      res.json({ appointment, depositRequired: false });
    }
  } catch (error) {
    console.error('Erreur création RDV:', error);
    res.status(500).json({ error: "Erreur lors de la création du rendez-vous" });
  }
});

app.get('/api/appointments', invitationController.authenticateToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.id },
      include: { service: true, salon: { select: { id: true, name: true, address: true, image: true } }, invoice: true },
      orderBy: { startTime: "desc" }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
});

app.delete('/api/appointments/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { salon: true, service: true }
    });
    
    if (!appointment) return res.status(404).json({ error: "Rendez-vous non trouvé" });
    
    const salon = await prisma.salon.findUnique({ where: { id: appointment.salonId } });
    
    // Vérification d'autorisation
    const isOwner = appointment.userId === req.user.id;
    const isSalonOwner = salon.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isSalonOwner && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Mise à jour du statut du rendez-vous
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'cancelled' },
    });
    res.json({ message: "Rendez-vous annulé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
});

// Modifier/reprogrammer un rendez-vous
app.patch('/api/appointments/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    const { startTime } = req.body;
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { salon: true, service: true }
    });
    
    if (!appointment) return res.status(404).json({ error: "Rendez-vous non trouvé" });
    
    const salon = await prisma.salon.findUnique({ where: { id: appointment.salonId } });
    
    // Vérification d'autorisation
    const isOwner = appointment.userId === req.user.id;
    const isSalonOwner = salon.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isSalonOwner && !isAdmin) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Mise à jour de la date du rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(new Date(startTime).getTime() + appointment.service.duration * 60000)
      },
      include: {
        service: true,
        salon: { select: { name: true, address: true, image: true } }
      }
    });
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erreur modification RDV:', error);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// === ROUTES SERVICES ===
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { salon: true },
      take: 50,
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

app.post('/api/services', invitationController.authenticateToken, async (req, res) => {
  const { name, price, duration, description, category } = req.body;
  
  try {
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const service = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description,
        category,
        salonId: salon.id,
      }
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ error: "Erreur lors de la création du service" });
  }
});

app.put('/api/services/:id', invitationController.authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, duration, description, category } = req.body;
  
  try {
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!service || service.salonId !== salon.id) {
      return res.status(404).json({ error: "Service non trouvé ou non autorisé" });
    }
    
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id) },
      data: { name, price: parseFloat(price), duration: parseInt(duration), description, category },
    });
    
    res.json(updatedService);
  } catch (error) {
    console.error('Erreur mise à jour service:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du service" });
  }
});

app.delete('/api/services/:id', invitationController.authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!service || service.salonId !== salon.id) {
      return res.status(404).json({ error: "Service non trouvé ou non autorisé" });
    }
    
    await prisma.service.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Service supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du service" });
  }
});

// === ROUTES PAIEMENT ===
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
});

app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('💰 PaymentIntent succeeded:', paymentIntent.id);
    
    try {
      const invoice = await prisma.invoice.findFirst({
        where: { appointmentId: parseInt(paymentIntent.metadata.invoiceId) }
      });
      
      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'paid', paidAt: new Date() }
        });
        
        const appointment = await prisma.appointment.findUnique({
          where: { id: invoice.appointmentId }
        });
        
        if (appointment) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: 'confirmed' }
          });
        }
      }
    } catch (error) {
      console.error('Erreur mise à jour paiement:', error);
    }
  }
  
  res.json({ received: true });
});

// === ROUTES PROches (FAMILLE) ===
app.get('/api/proches', invitationController.authenticateToken, async (req, res) => {
  try {
    const proches = await prisma.proche.findMany({
      where: { userId: req.user.id },
    });
    res.json(proches);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des proches" });
  }
});

app.post('/api/proches', invitationController.authenticateToken, async (req, res) => {
  const { name, phone, relation, notes } = req.body;
  
  try {
    const proche = await prisma.proche.create({
      data: {
        userId: req.user.id,
        name,
        phone,
        relation,
        notes,
      }
    });
    res.status(201).json(proche);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du proche" });
  }
});

app.put('/api/proches/:id', invitationController.authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, relation, notes } = req.body;
  
  try {
    const proche = await prisma.proche.update({
      where: { id: parseInt(id), userId: req.user.id },
      data: { name, phone, relation, notes },
    });
    res.json(proche);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du proche" });
  }
});

// Récupérer le salon de l'utilisateur connecté (pour vérification)
app.get('/api/admin/salons', invitationController.authenticateToken, async (req, res) => {
  try {
    const salon = await prisma.salon.findFirst({
      where: { userId: req.user.id }
    });
    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

app.post('/api/admin/salons', invitationController.authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // Temporairement retiré pour permettre la création de salon sans rôle spécifique
    // if (req.user.role !== 'salon_owner') return res.status(403).json({ error: "Accès réservé aux propriétaires" });
    
    // Vérifier si l'utilisateur a déjà un salon
    const existingSalon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (existingSalon) return res.status(400).json({ error: "Vous avez déjà un salon", salonId: existingSalon.id });
    
    const { name, address, city, category, description, validationMode, depositRequired, cancellationDelay, openingHours } = req.body;
    
    // Gérer l'image
    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'salons' }
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Erreur upload Cloudinary:', uploadError);
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      imageUrl = req.body.image;
    }
    
    const salon = await prisma.salon.create({
      data: {
        name,
        address: address || '',
        city: city || '',
        category: category || 'salon',
        description: description || '',
        image: imageUrl,
        validationMode: validationMode || 'auto',
        depositRequired: depositRequired === 'true' || depositRequired === true,
        cancellationDelay: cancellationDelay || '24',
        userId: req.user.id,
        openingHours: openingHours || '{"lundi":{"open":"09:00","close":"19:00","enabled":true},"mardi":{"open":"09:00","close":"19:00","enabled":true},"mercredi":{"open":"09:00","close":"19:00","enabled":true},"jeudi":{"open":"09:00","close":"19:00","enabled":true},"vendredi":{"open":"09:00","close":"19:00","enabled":true},"samedi":{"open":"09:00","close":"19:00","enabled":false},"dimanche":{"open":"00:00","close":"00:00","enabled":false}}',
      }
    });
    
    res.status(201).json({ message: "Salon créé avec succès", salon });
  } catch (error) {
    console.error('Erreur création salon:', error);
    res.status(500).json({ error: "Erreur lors de la création du salon" });
  }
});

app.put('/api/admin/salons', invitationController.authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') return res.status(403).json({ error: "Accès réservé aux propriétaires" });
    const { name, address, category, description, validationMode, depositRequired, cancellationDelay, openingHours } = req.body;
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    // Gérer l'image
    let imageUrl = salon.image;
    if (req.file) {
      // Upload vers Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'salons' }
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Erreur upload Cloudinary:', uploadError);
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      // Nouvelle image en data URL
      imageUrl = req.body.image;
    }
    
    await prisma.salon.update({
      where: { id: salon.id },
      data: { 
        ...(name && { name }), 
        ...(address && { address }), 
        ...(category && { category }), 
        ...(description !== undefined && { description }), 
        ...(validationMode && { validationMode }), 
        ...(depositRequired !== undefined && { depositRequired: depositRequired === 'true' || depositRequired === true }), 
        ...(cancellationDelay && { cancellationDelay }), 
        ...(openingHours && { openingHours }),
        ...(imageUrl && { image: imageUrl })
      },
    });
    res.json({ message: "Salon mis à jour" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

app.post('/api/admin/services', invitationController.authenticateToken, async (req, res) => {
  try {
    console.log('=== DÉBUT ===');
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);
    
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux propriétaires" });
    }
    
    const { name, price, duration, description, category } = req.body;
    console.log('Données reçues:', { name, price, duration, category });
    
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    console.log('Salon trouvé:', salon);
    
    if (!salon) {
      return res.status(404).json({ error: "Salon non trouvé. Créez d'abord votre salon." });
    }
    
    const service = await prisma.service.create({
      data: { 
        name, 
        price: parseFloat(price), 
        duration: parseInt(duration), 
        description: description || '', 
        category: category || '', 
        salonId: salon.id 
      },
    });
    console.log('Service créé:', service);
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ error: "Erreur lors de la création: " + error.message });
  }
});

// Modifier un service
app.put('/api/admin/services/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') return res.status(403).json({ error: "Accès réservé aux propriétaires" });
    const { name, price, duration, description, category } = req.body;
    const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!service) return res.status(404).json({ error: "Service non trouvé" });
    
    // Vérifier que le service appartient au salon du pro
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon || service.salonId !== salon.id) return res.status(403).json({ error: "Accès refusé" });
    
    const updatedService = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        ...(name && { name }), 
        ...(price && { price: parseFloat(price) }), 
        ...(duration && { duration: parseInt(duration) }), 
        ...(description !== undefined && { description }), 
        ...(category && { category })
      },
    });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

// Supprimer un service
app.delete('/api/admin/services/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') return res.status(403).json({ error: "Accès réservé aux propriétaires" });
    const service = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!service) return res.status(404).json({ error: "Service non trouvé" });
    
    // Vérifier que le service appartient au salon du pro
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon || service.salonId !== salon.id) return res.status(403).json({ error: "Accès refusé" });
    
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// === ROUTE DASHBOARD PROFESSIONNEL ===
app.get('/api/professional/dashboard', invitationController.authenticateToken, async (req, res) => {
  try {
    // Vérifier que c'est un salon_owner
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux professionnels" });
    }
    
    // Récupérer le salon du professionnel
    const salon = await prisma.salon.findFirst({
      where: { userId: req.user.id },
      include: {
        services: true,
        appointments: {
          include: {
            client: { select: { id: true, name: true, email: true, phone: true } },
            service: true
          },
          orderBy: { startTime: 'desc' }
        }
      }
    });
    
    if (!salon) {
      return res.status(404).json({ error: "Salon non trouvé. Vous devez créer votre salon d'abord." });
    }
    
    // Calculer les statistiques
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointmentsToday = salon.appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= today && aptDate < tomorrow;
    }).length;
    
    const totalRevenue = salon.appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    const totalAppointments = salon.appointments.length;
    const pendingAppointments = salon.appointments.filter(apt => apt.status === 'pending').length;
    
    res.json({
      salon,
      stats: {
        appointmentsToday,
        totalAppointments,
        pendingAppointments,
        totalRevenue,
        servicesCount: salon.services.length
      }
    });
  } catch (error) {
    console.error('Erreur dashboard professionnel:', error);
    res.status(500).json({ error: "Erreur lors de la récupération du dashboard" });
  }
});

// === ROUTES CLIENTS (Gestion des clients du salon) ===

// Liste des clients du salon
app.get('/api/professional/clients', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux professionnels" });
    }
    
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    // Récupérer tous les clients (rôle 'client')
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        appointments: {
          where: { salonId: salon.id },
          include: { service: true },
          orderBy: { startTime: 'desc' }
        }
      }
    });
    
    // Calculer les stats pour chaque client
    const clientsWithStats = clients.map(client => {
      const totalSpent = client.appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
      
      return {
        ...client,
        totalSpent,
        totalAppointments: client.appointments.length,
        lastAppointment: client.appointments[0] || null
      };
    });
    
    res.json(clientsWithStats);
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    res.status(500).json({ error: "Erreur lors de la récupération des clients" });
  }
});

// Ajouter un nouveau client
app.post('/api/professional/clients', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux professionnels" });
    }
    
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const { name, email, phone } = req.body;
    
    // Vérifier si le client existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà" });
    }
    
    // Créer le client avec un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const client = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'client'
      }
    });
    
    res.status(201).json({
      message: "Client créé avec succès",
      client: { id: client.id, name, email, phone },
      tempPassword // Note: En production, envoyez par email au lieu de retourner en clair
    });
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: "Erreur lors de la création du client" });
  }
});

// Modifier un client
app.put('/api/professional/clients/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux professionnels" });
    }
    
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const clientId = parseInt(req.params.id);
    const { name, email, phone } = req.body;
    
    // Vérifier que le client existe et a le rôle 'client'
    const clientExists = await prisma.user.findUnique({
      where: { id: clientId }
    });
    if (!clientExists || clientExists.role !== 'client') {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    
    const client = await prisma.user.update({
      where: { id: clientId },
      data: { name, email, phone }
    });
    
    res.json({ message: "Client modifié avec succès", client });
  } catch (error) {
    console.error('Erreur modification client:', error);
    res.status(500).json({ error: "Erreur lors de la modification du client" });
  }
});

// Détails d'un client
app.get('/api/professional/clients/:id', invitationController.authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'salon_owner') {
      return res.status(403).json({ error: "Accès réservé aux professionnels" });
    }
    
    const salon = await prisma.salon.findFirst({ where: { userId: req.user.id } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    const clientId = parseInt(req.params.id);
    
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        role: 'client'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    
    if (!client) return res.status(404).json({ error: "Client non trouvé" });
    
    // Récupérer l'historique complet des rendez-vous
    const appointments = await prisma.appointment.findMany({
      where: { userId: clientId, salonId: salon.id },
      include: {
        service: true,
        invoice: true
      },
      orderBy: { startTime: 'desc' }
    });
    
    const totalSpent = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    res.json({ ...client, appointments, totalSpent });
  } catch (error) {
    console.error('Erreur récupération client:', error);
    res.status(500).json({ error: "Erreur lors de la récupération du client" });
  }
});

// === ROUTES DEMO REQUESTS (Formulaire ETP) ===
app.post('/api/demo-requests', async (req, res) => {
  try {
    const { email, contactName, salonName, salonType, phone, hasLocal, city } = req.body;
    const existingRequest = await prisma.demoRequest.findFirst({ where: { email } });
    if (existingRequest) return res.status(400).json({ error: "Demande déjà existante pour cet email" });
    
    const demoRequest = await prisma.demoRequest.create({ data: { ...req.body, status: 'pending' } });
    console.log(`📋 Nouvelle demande de démo de ${email}`);
    
    // Envoyer email de confirmation au client
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@planity.com',
        to: email,
        subject: 'Confirmation de votre demande de démo - Planity',
        html: `
          <h1>Merci pour votre intérêt, ${contactName || 'cher client'} !</h1>
          <p>Nous avons bien reçu votre demande de démo pour votre salon <strong>${salonName || 'N/A'}</strong>.</p>
          <p>Notre équipe commerciale va vous contacter sous 24h pour planifier votre démonstration personnalisée.</p>
          
          <h2>Récapitulatif de votre demande :</h2>
          <ul>
            <li><strong>Type d'établissement:</strong> ${salonType || 'N/A'}</li>
            <li><strong>Ville:</strong> ${city || 'N/A'}</li>
            <li><strong>Téléphone:</strong> ${phone || 'N/A'}</li>
            <li><strong>Vous disposez d'un local:</strong> ${hasLocal ? 'Oui' : 'Non'}</li>
          </ul>
          
          <p>À très bientôt sur Planity !</p>
          <p>L'équipe Planity</p>
        `
      });
      console.log(`📧 Email de confirmation envoyé à ${email}`);
    } catch (emailError) {
      console.error('Erreur envoi email confirmation:', emailError);
    }
    
    res.status(201).json({ message: "Demande enregistrée", requestId: demoRequest.id });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement" });
  }
});

app.get('/api/demo-requests', invitationController.requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const requests = await prisma.demoRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// Route PATCH pour mettre à jour une demande (utilisée par le frontend)
app.patch('/api/demo-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRequest = await prisma.demoRequest.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json({ message: "Demande mise à jour", request: updatedRequest });
  } catch (error) {
    console.error('Erreur PATCH demo-requests:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Route POST pour approuver une demande et créer le compte pro
app.post('/api/demo-requests/:id/accept', invitationController.requireAdmin, async (req, res) => {
  try {
    const request = await prisma.demoRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ error: "Demande non trouvée" });
    
    if (request.status === 'approved') {
      return res.status(400).json({ error: "Demande déjà approuvée" });
    }
    
    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({ where: { email: request.email } });
    
    // Générer mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    if (!user) {
      // Créer le compte utilisateur pro (sans créer le salon)
      user = await prisma.user.create({
        data: {
          email: request.email,
          name: request.contactName || 'Nouveau professionnel',
          phone: request.phone || null,
          password: hashedPassword,
          role: 'salon_owner',
          businessType: request.salonType || null,
          siret: request.siret || null,
          workLocation: request.workLocation || null,
          experience: request.experience || null,
          workRhythm: request.workRhythm || null,
        },
      });
    } else {
      // Mettre à jour le mot de passe et le rôle
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          role: 'salon_owner'
        },
      });
    }
    
    // Notifier l'équipe commerciale (CRM)
    console.log(`📢 NOTIFICATION CRM: Demande approuvée pour ${request.email}`);
    console.log(`   - Type: ${request.salonType}`);
    console.log(`   - Local: ${request.hasLocal ? 'Oui' : 'Non'}`);
    
    // Envoyer email au pro avec ses identifiants et lien pour compléter son inscription
    console.log(`📧 Tentative d'envoi d'email à ${request.email}...`);
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@planity.com',
        to: request.email,
        subject: 'Félicitations ! Votre compte Planity Pro est activé',
        html: `
          <h1>Félicitations ${request.contactName || ''} !</h1>
          <p>Votre demande a été approuvée par notre équipe.</p>
          <p>Vous pouvez dès maintenant finaliser votre inscription et créer votre salon.</p>
          
          <h2>Vos identifiants de connexion</h2>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Mot de passe temporaire:</strong> ${tempPassword}</p>
          
          <p><a href="http://localhost:5174/pro-login">Cliquez ici pour vous connecter</a></p>
          
          <p><strong>Próchaines étapes pour mettre votre salon en ligne :</strong></p>
          <ol>
            <li>Renseignez les informations de votre salon (nom, adresse, catégorie)</li>
            <li>Définissez vos horaires d'ouverture</li>
            <li>Ajoutez vos prestations et tarifs</li>
            <li>Configurez les règles d'annulation</li>
          </ol>
          
          <p>Une fois ces étapes complétées, votre salon sera mis en ligne selon la règle de publication choisie.</p>
        `,
      });
      console.log(`✅ Email d'approbation envoyé à ${request.email}:`, info.messageId);
    } catch (emailError) {
      console.error('❌ Erreur envoi email approbation:', emailError.message);
    }
    
    // Mettre à jour le statut de la demande (NE PAS créer le salon automatiquement)
    await prisma.demoRequest.update({
      where: { id: request.id },
      data: { status: 'approved' },
    });
    
    res.json({ 
      message: "Demande approuvée, email envoyé au professionnel",
      email: request.email,
      tempPassword: tempPassword
    });
  } catch (error) {
    console.error('Erreur accept:', error);
    res.status(500).json({ error: "Erreur lors de l'approbation" });
  }
});

// Route POST pour refuser une demande
app.post('/api/demo-requests/:id/reject', invitationController.requireAdmin, async (req, res) => {
  try {
    const request = await prisma.demoRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ error: "Demande non trouvée" });
    
    if (request.status === 'rejected') {
      return res.status(400).json({ error: "Demande déjà refusée" });
    }
    
    // Mettre à jour le statut
    await prisma.demoRequest.update({
      where: { id: request.id },
      data: { status: 'rejected' },
    });
    
    // Envoyer email de refus (optionnel)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@planity.com',
        to: request.email,
        subject: 'Votre demande Planity Pro',
        html: `
          <h1>Bonjour ${request.contactName || 'cher professionnel'},</h1>
          <p>Nous avons bien reçu votre demande de démonstration.</p>
          <p>Après étude, nous ne sommes malheureusement pas en mesure de donner suite à votre demande pour le moment.</p>
          <p>N'hésitez pas à nous recontacter si vous souhaitez obtenir plus d'informations.</p>
          <p>L'équipe Planity</p>
        `,
      });
    } catch (emailError) {
      console.error('Erreur envoi email refus:', emailError);
    }
    
    res.json({ message: "Demande refusée" });
  } catch (error) {
    console.error('Erreur reject:', error);
    res.status(500).json({ error: "Erreur lors du refus" });
  }
});

// Route pour sauvegarder une étape du parcours d'inscription
app.post('/api/demo-requests/save-step', async (req, res) => {
  try {
    const { requestId, step, stepData } = req.body;
    
    if (requestId) {
      const existingRequest = await prisma.demoRequest.findUnique({ where: { id: parseInt(requestId) } });
      if (!existingRequest) {
        return res.status(404).json({ error: "Demande non trouvée" });
      }
      
      const updateData = {};
      
      // Mapper les étapes aux champs du modèle
      switch(step) {
        case 1:
          updateData.salonType = stepData;
          break;
        case 2:
          updateData.hasLocal = stepData === 'oui';
          break;
        case 3:
          if (stepData.contactName) updateData.contactName = stepData.contactName;
          if (stepData.phone) updateData.phone = stepData.phone;
          if (stepData.email) updateData.email = stepData.email;
          break;
        case 4:
          updateData.workLocation = stepData;
          break;
        case 5:
          updateData.experience = stepData;
          break;
        case 6:
          updateData.workRhythm = stepData;
          break;
        case 7:
          updateData.siret = stepData;
          break;
      }
      
      const updatedRequest = await prisma.demoRequest.update({
        where: { id: parseInt(requestId) },
        data: updateData,
      });
      
      res.json({ message: "Étape sauvegardée", requestId: updatedRequest.id });
    } else {
      // Créer une nouvelle demande
      const newRequest = await prisma.demoRequest.create({
        data: {
          email: stepData.email,
          status: 'in_progress',
          salonType: step === 1 ? stepData : null,
          hasLocal: step === 2 ? (stepData === 'oui') : null,
          contactName: step === 3 ? stepData.contactName : null,
          phone: step === 3 ? stepData.phone : null,
          workLocation: step === 4 ? stepData : null,
          experience: step === 5 ? stepData : null,
          workRhythm: step === 6 ? stepData : null,
          siret: step === 7 ? stepData : null,
        },
      });
      
      res.status(201).json({ message: "Demande créée", requestId: newRequest.id });
    }
  } catch (error) {
    console.error('Erreur save-step:', error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde" });
  }
});

// === ROUTES SERVICES CLIENT ===
app.patch('/api/demo-requests/:id/finalize', invitationController.requireAdmin, async (req, res) => {
  try {
    const request = await prisma.demoRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!request) return res.status(404).json({ error: "Demande non trouvée" });
    
    if (request.status === 'completed') {
      return res.status(400).json({ error: "Demande déjà traitée" });
    }
    
    // Générer mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Créer le compte utilisateur pro
    const user = await prisma.user.create({
      data: {
        email: request.email,
        name: request.contactName || 'Nouveau professionnel',
        phone: request.phone || null,
        password: hashedPassword,
        role: 'salon_owner',
        businessType: request.salonType || null,
        siret: request.siret || null,
        workLocation: request.workLocation || null,
        experience: request.experience || null,
        workRhythm: request.workRhythm || null,
      },
    });
    
    // Créer le salon associé
    const categoryMap = {
      'salon': 'Salon de coiffure',
      'institut': 'Institut de beauté',
      'spa': 'Spa',
      'barbier': 'Barbier',
      'onglerie': 'Salon d\'onglerie',
      'autre': 'Autre',
    };
    
    await prisma.salon.create({
      data: {
        name: `${request.salonType ? categoryMap[request.salonType] || request.salonType : 'Salon'} de ${request.contactName || 'Nouveau pro'}`,
        address: '',
        category: request.salonType ? categoryMap[request.salonType] || 'Autre' : 'Autre',
        user: { connect: { id: user.id } },
        hasLocal: request.hasLocal,
        validationMode: 'auto',
        depositRequired: true,
        cancellationDelay: '24',
        openingHours: '9h-19h',
        city: request.workLocation || null,
      },
    });
    
    // Notifier l'équipe commerciale (CRM)
    console.log(`📢 NOTIFICATION CRM: Nouvelle demande ETP validée pour ${request.email}`);
    console.log(`   - Type de salon: ${request.salonType}`);
    console.log(`   - Local: ${request.hasLocal ? 'Oui' : 'Non'}`);
    console.log(`   - Localisation: ${request.workLocation}`);
    console.log(`   - Expérience: ${request.experience}`);
    console.log(`   - Rythme: ${request.workRhythm}`);
    
    // Envoyer email au pro avec ses identifiants
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@planity.com',
        to: request.email,
        subject: 'Bienvenue sur Planity Pro - Vos identifiants',
        html: `
          <h1>Félicitations !</h1>
          <p>Votre compte Planity Pro a été créé.</p>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Mot de passe temporaire:</strong> ${tempPassword}</p>
          <p><a href="http://localhost:5174/pro-login">Cliquez ici pour vous connecter</a></p>
          <p>Nous vous recommandons de changer votre mot de passe après première connexion.</p>
        `,
      });
      console.log(`📧 Email envoyé à ${request.email}:`, info.messageId);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }
    
    // Mettre à jour le statut de la demande
    await prisma.demoRequest.update({
      where: { id: request.id },
      data: { status: 'completed', userId: user.id },
    });
    
    res.json({ 
      message: "Demande finalisée, compte créé",
      credentials: { email: request.email, password: tempPassword }
    });
  } catch (error) {
    console.error('Erreur finalize:', error);
    res.status(500).json({ error: "Erreur lors de la finalisation" });
  }
});

// === ROUTES SERVICES CLIENT ===
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { salon: true },
      take: 50,
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// === PAIEMENT ===
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
});



  // === ROUTES ADMIN SUPPLÉMENTAIRES ===
  
  // Stats globales admin
  app.get('/api/admin/stats', invitationController.requireAdmin, async (req, res) => {
    try {
      const [totalSalons, totalUsers, totalAppointments, pendingDemoRequests] = await Promise.all([
        prisma.salon.count(),
        prisma.user.count(),
        prisma.appointment.count(),
        prisma.demoRequest.count({ where: { status: 'pending' } }),
      ]);
      
      const activeSalons = await prisma.salon.count({ where: { isActive: true } });
      const suspendedSalons = await prisma.salon.count({ where: { isActive: false } });
      
      const professionals = await prisma.user.count({ where: { role: { in: ['salon_owner', 'employee'] } } });
      const clients = await prisma.user.count({ where: { role: 'client' } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const [appointmentsToday, appointmentsWeek, appointmentsMonth] = await Promise.all([
        prisma.appointment.count({ where: { startTime: { gte: today } } }),
        prisma.appointment.count({ where: { startTime: { gte: weekStart } } }),
        prisma.appointment.count({ where: { startTime: { gte: monthStart } } }),
      ]);
      
      const invoices = await prisma.invoice.findMany();
      const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
      const depositsCollected = invoices.reduce((sum, i) => sum + i.amount, 0);
      
      res.json({
        totalSalons,
        activeSalons,
        suspendedSalons,
        totalProfessionals: professionals,
        totalClients: clients,
        totalUsers,
        totalAppointments,
        appointmentsToday,
        appointmentsWeek,
        appointmentsMonth,
        totalRevenue,
        depositsCollected,
        pendingDemoRequests,
      });
    } catch (error) {
      console.error('Erreur stats admin:', error);
      res.status(500).json({ error: "Erreur lors de la récupération des stats" });
    }
  });

  // Liste des professionnels
  app.get('/api/admin/professionals', invitationController.requireAdmin, async (req, res) => {
    try {
      const professionals = await prisma.user.findMany({
        where: { role: { in: ['salon_owner', 'employee'] } },
        include: { salon: true },
        orderBy: { createdAt: 'desc' }
      });
      
      const formatted = professionals.map(pro => ({
        id: pro.id,
        name: pro.name,
        email: pro.email,
        phone: pro.phone || 'Non fourni',
        salon: pro.salon?.name || 'Aucun salon',
        status: pro.isActive !== false ? 'active' : 'suspended',
        createdAt: pro.createdAt.toLocaleDateString('fr-FR'),
        lastLogin: pro.createdAt.toLocaleDateString('fr-FR'),
      }));
      
      res.json(formatted);
    } catch (error) {
      console.error('Erreur professionnels:', error);
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Activer/désactiver un professionnel
  app.patch('/api/admin/professionals/:id/toggle-status', invitationController.requireAdmin, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
      
      const newStatus = user.isActive === false ? true : false;
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: newStatus },
      });
      
      res.json({ message: newStatus ? 'Compte activé' : 'Compte désactivé', isActive: newStatus });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // Réinitialiser mot de passe pro
  app.post('/api/admin/professionals/:id/reset-password', invitationController.requireAdmin, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
      
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@planity.com',
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe - Planity',
          html: '<p>Votre mot de passe a été réinitialisé.</p><p>Nouveau: <strong>' + tempPassword + '</strong></p>',
        });
      } catch (emailError) {
        console.error('Erreur email reset:', emailError);
      }
      
      res.json({ message: "Mot de passe réinitialisé", tempPassword });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la réinitialisation" });
    }
  });

  // Liste des clients
  app.get('/api/admin/clients', invitationController.requireAdmin, async (req, res) => {
    try {
      const clients = await prisma.user.findMany({
        where: { role: 'client' },
        include: {
          appointments: { include: { service: true, salon: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const formatted = clients.map(client => {
        const totalAppointments = client.appointments.length;
        const totalSpent = client.appointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
        const lastVisit = client.appointments.length > 0 
          ? new Date(Math.max(...client.appointments.map(a => new Date(a.startTime)))).toLocaleDateString('fr-FR')
          : 'Aucune visite';
        
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || 'Non fourni',
          totalAppointments,
          totalSpent,
          lastVisit,
          status: client.isActive !== false ? 'active' : 'suspended',
        };
      });
      
      res.json(formatted);
    } catch (error) {
      console.error('Erreur clients:', error);
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Suspendre un client
  app.patch('/api/admin/clients/:id/toggle-status', invitationController.requireAdmin, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!user) return res.status(404).json({ error: "Client non trouvé" });
      
      const newStatus = user.isActive === false ? true : false;
      
      // Journaliser l'action admin
      logAdminAction(req.user.id, req.user.email, 'TOGGLE_USER_STATUS', {
        targetUserId: user.id,
        targetUserEmail: user.email,
        previousStatus: user.isActive,
        newStatus
      });
      
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: newStatus },
      });
      
      res.json({ message: newStatus ? 'Compte activé' : 'Compte suspendu', isActive: newStatus });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // Liste des rendez-vous (admin)
  app.get('/api/admin/appointments', invitationController.requireAdmin, async (req, res) => {
    try {
      const { salonId, status, date } = req.query;
      
      const where = {};
      if (salonId) where.salonId = parseInt(salonId);
      if (status) where.status = status;
      if (date) {
        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        where.startTime = { gte: selectedDate, lt: nextDay };
      }
      
      const appointments = await prisma.appointment.findMany({
        where: {
          ...where,
          userId: where.userId || undefined,
        },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          service: true,
          salon: true,
          invoice: true,
        },
        orderBy: { startTime: 'asc' }
      });
      
      const formatted = appointments.map(apt => ({
        id: apt.id,
        client: apt.user?.name || 'Client inconnu',
        clientEmail: apt.user?.email || 'Non fourni',
        clientPhone: apt.user?.phone || 'Non fourni',
        salon: apt.salon?.name || 'Salon inconnu',
        service: apt.service?.name || 'Service inconnu',
        date: apt.startTime?.toLocaleDateString('fr-FR') || 'Date inconnue',
        time: apt.startTime?.toTimeString().substring(0, 5) || 'Heure inconnue',
        price: apt.service.price,
        status: apt.status || 'pending',
        paid: apt.invoice?.status === 'paid',
      }));
      
      res.json(formatted);
    } catch (error) {
      console.error('Erreur appointments admin:', error);
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Annuler un rendez-vous (admin)
  app.patch('/api/admin/appointments/:id/cancel', invitationController.requireAdmin, async (req, res) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { user: true, service: true, salon: true }
      });
      
      if (!appointment) return res.status(404).json({ error: "Rendez-vous non trouvé" });
      
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'cancelled' },
      });
      
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@planity.com',
          to: appointment.user.email,
          subject: 'Annulation de votre rendez-vous',
          html: '<p>Votre rendez-vous au salon ' + appointment.salon.name + ' a été annulé.</p>',
        });
      } catch (emailError) {
        console.error('Erreur email annulation:', emailError);
      }
      
      res.json({ message: "Rendez-vous annulé" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'annulation" });
    }
  });

  // Liste des paiements (admin)
  app.get('/api/admin/payments', invitationController.requireAdmin, async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          appointment: {
            userId: undefined
          }
        },
        include: {
          appointment: {
            include: {
              user: { select: { name: true } },
              salon: { select: { name: true } },
              service: true,
            }
          }
        },
        orderBy: { id: 'desc' }
      });
      
      const formatted = invoices.map(inv => ({
        id: inv.id,
        type: inv.status === 'paid' ? 'Paiement complet' : 'Acompte',
        amount: inv.amount,
        salon: inv.appointment?.salon?.name || 'Salon inconnu',
        client: inv.appointment?.user?.name || 'Client inconnu',
        date: inv.appointment?.startTime?.toLocaleDateString('fr-FR') || 'Date inconnue',
        status: inv.status === 'paid' ? 'completed' : 'pending',
      }));
      
      res.json(formatted);
    } catch (error) {
      console.error('Erreur payments admin:', error);
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Actions sur les salons (admin)
  app.patch('/api/admin/salons/:id/toggle-active', invitationController.requireAdmin, async (req, res) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      
      await prisma.salon.update({
        where: { id: salon.id },
        data: { isActive: !salon.isActive },
      });
      
      res.json({ message: !salon.isActive ? 'Salon réactivé' : 'Salon suspendu' });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // Approuver un salon
  app.post('/api/admin/salons/:id/approve', invitationController.requireAdmin, async (req, res) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      
      if (salon.approvalStatus === 'approved') {
        return res.status(400).json({ error: "Salon déjà approuvé" });
      }
      
      // Journaliser l'action admin
      logAdminAction(req.user.id, req.user.email, 'APPROVE_SALON', {
        salonId: salon.id,
        salonName: salon.name,
        previousStatus: salon.approvalStatus
      });
      
      await prisma.salon.update({
        where: { id: salon.id },
        data: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: req.user.id,
          isActive: true,
        },
      });
      
      // Envoyer email au pro
      try {
        const user = await prisma.user.findUnique({ where: { id: salon.userId } });
        if (user) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@planity.com',
            to: user.email,
            subject: 'Votre salon a été approuvé - Planity',
            html: `<h1>Félicitations !</h1><p>Votre salon "${salon.name}" a été approuvé et est maintenant visible sur Planity.</p>`,
          });
        }
      } catch (emailError) {
        console.error('Erreur email:', emailError);
      }
      
      res.json({ message: "Salon approuvé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'approbation" });
    }
  });

  // Refuser un salon
  app.post('/api/admin/salons/:id/reject', invitationController.requireAdmin, async (req, res) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      
      const { reason } = req.body;
      
      // Journaliser l'action admin
      logAdminAction(req.user.id, req.user.email, 'REJECT_SALON', {
        salonId: salon.id,
        salonName: salon.name,
        reason,
        previousStatus: salon.approvalStatus
      });
      
      await prisma.salon.update({
        where: { id: salon.id },
        data: {
          approvalStatus: 'rejected',
          isActive: false,
        },
      });
      
      // Envoyer email au pro
      try {
        const user = await prisma.user.findUnique({ where: { id: salon.userId } });
        if (user) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@planity.com',
            to: user.email,
            subject: 'Votre demande de publication - Planity',
            html: `<h1>Désolé</h1><p>Votre salon "${salon.name}" n'a pas pu être approuvé.</p>${reason ? '<p>Raison: ' + reason + '</p>' : ''}`,
          });
        }
      } catch (emailError) {
        console.error('Erreur email:', emailError);
      }
      
      res.json({ message: "Salon refusé" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du refus" });
    }
  });

  // Publier un salon (après approbation)
  app.post('/api/admin/salons/:id/publish', invitationController.requireAdmin, async (req, res) => {
    try {
      const salon = await prisma.salon.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      
      if (salon.approvalStatus !== 'approved') {
        return res.status(400).json({ error: "Le salon doit être approuvé avant publication" });
      }
      
      await prisma.salon.update({
        where: { id: salon.id },
        data: { approvalStatus: 'published', isActive: true },
      });
      
      res.json({ message: "Salon publié" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la publication" });
    }
  });

  app.patch('/api/admin/salons/:id/update', invitationController.requireAdmin, async (req, res) => {
    try {
      const { name, address, city, category, description, depositRequired, cancellationDelay } = req.body;
      
      await prisma.salon.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...(name && { name }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(category && { category }),
          ...(description !== undefined && { description }),
          ...(depositRequired !== undefined && { depositRequired }),
          ...(cancellationDelay && { cancellationDelay }),
        },
      });
      
      res.json({ message: "Salon mis à jour" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // Export transactions (CSV)
  app.get('/api/admin/payments/export', invitationController.requireAdmin, async (req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          appointment: {
            include: {
              user: { select: { name: true, email: true } },
              salon: { select: { name: true, city: true } },
              service: true,
            }
          }
        },
        orderBy: { id: 'desc' }
      });
      
      const csvHeader = 'ID,Date,Type,Montant,Statut,Salon,Ville,Client,Email,Service';
      const csvRows = invoices.map(inv => {
        const date = inv.appointment.startTime.toLocaleDateString('fr-FR');
        const type = inv.status === 'paid' ? 'Paiement complet' : 'Acompte';
        const statut = inv.status === 'paid' ? 'Terminé' : 'En attente';
        return inv.id + ',' + date + ',' + type + ',' + inv.amount + ',' + statut + ',' + inv.appointment.salon.name + ',' + (inv.appointment.salon.city || '') + ',' + inv.appointment.user.name + ',' + inv.appointment.user.email + ',' + inv.appointment.service.name;
      }).join(',');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csvHeader + ',' + csvRows);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'export" });
    }
  });

  // === PARAMÈTRES ADMIN ===
  
  // Liste des catégories
  app.get('/api/admin/categories', invitationController.requireAdmin, async (req, res) => {
    try {
      const categories = [
        { id: 1, name: 'Salon de coiffure', slug: 'salon', icon: '✂️' },
        { id: 2, name: 'Institut de beauté', slug: 'institut', icon: '💅' },
        { id: 3, name: 'Spa', slug: 'spa', icon: '🧴' },
        { id: 4, name: 'Barbier', slug: 'barbier', icon: '🪒' },
        { id: 5, name: "Salon d'onglerie", slug: 'onglerie', icon: '💎' },
        { id: 6, name: 'Centre esthétique', slug: 'esthetique', icon: '✨' },
        { id: 7, name: 'Autre', slug: 'autre', icon: '📍' },
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Paramètres globaux
  app.get('/api/admin/settings', invitationController.requireAdmin, async (req, res) => {
    try {
      const settings = {
        platformFee: 5,
        defaultCancellationDelay: 24,
        minDepositPercent: 50,
        autoValidation: true,
        maxAdvanceBookingDays: 60,
        supportEmail: 'support@planity.com',
        passwordMinLength: 8,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        roles: [
          { id: 'admin', name: 'Administrateur', permissions: ['all'] },
          { id: 'moderator', name: 'Modérateur', permissions: ['salons', 'users', 'appointments'] },
          { id: 'support', name: 'Support', permissions: ['users', 'appointments'] },
          { id: 'finance', name: 'Finance', permissions: ['payments', 'reports'] },
        ],
      };
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération" });
    }
  });

  // Mettre à jour les paramètres
  app.put('/api/admin/settings', invitationController.requireAdmin, async (req, res) => {
    try {
      console.log('📝 Paramètres mis à jour:', req.body);
      res.json({ message: "Paramètres mis à jour avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // Envoyer un email global
  app.post('/api/admin/send-email', invitationController.requireAdmin, async (req, res) => {
    try {
      const { subject, content, target } = req.body;
      let users = [];
      if (target === 'professionals') {
        users = await prisma.user.findMany({ where: { role: { in: ['salon_owner', 'employee'] } } });
      } else if (target === 'clients') {
        users = await prisma.user.findMany({ where: { role: 'client' } });
      } else {
        users = await prisma.user.findMany();
      }
      
      for (const user of users) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@planity.com',
            to: user.email,
            subject: subject,
            html: content,
          });
        } catch (emailError) {
          console.error(`Erreur envoi email à ${user.email}:`, emailError);
        }
      }
      
      res.json({ message: `Email envoyé à ${users.length} destinataires` });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'envoi" });
    }
  });

  // === FIN DES ROUTES ADMIN ===

  // Promouvoir un utilisateur professionnel en salon_owner (pour approve manuelle)
  app.post('/api/admin/promote-user', invitationController.requireAdmin, async (req, res) => {
    try {
      const { userId, newRole } = req.body;
      
      if (!userId || !newRole) {
        return res.status(400).json({ error: 'userId et newRole requis' });
      }
      
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { role: newRole }
      });
      
      console.log(`✅ Utilisateur ${updatedUser.email} promu vers ${newRole}`);
      res.json({ 
        message: `Utilisateur promu vers ${newRole}`,
        user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }
      });
    } catch (error) {
      console.error('Erreur lors de la promotion:', error);
      res.status(500).json({ error: 'Erreur lors de la promotion' });
    }
  });

  // Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📧 Mode email: ${process.env.SMTP_HOST === 'smtp-brevo.com' ? 'Brevo' : 'Ethereal (test)'}`);
});

