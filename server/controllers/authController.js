import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Validation rules
export const registerValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('name').notEmpty().withMessage('Nom requis')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

// Register
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name, role, phone, salonName, salonType, address, openingHours } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        password: hashedPassword,
        role: role || 'client',
        phone: phone || null
      }
    });
    
    if (role === 'salon_owner' && salonName) {
      await prisma.salon.create({
        data: {
          name: salonName,
          address: address || '',
          category: salonType || 'Autre',
          userId: user.id,
          validationMode: 'auto',
          depositRequired: true,
          cancellationDelay: '24',
          openingHours: openingHours || '9h-19h',
        }
      });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(400).json({ error: "L'email est déjà utilisé ou erreur" });
  }
};

// Login
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Identifiants incorrects" });

    // Empêcher les comptes professionnels d'accéder à l'espace client
    if (user.role === 'salon_owner' || user.role === 'professional') {
      return res.status(403).json({ 
        error: "Vous utilisez un compte professionnel. Veuillez utiliser la page de connexion dédiée aux professionnels." 
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Pro Login - Pour les comptes professionnels
export const proLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Identifiants incorrects" });

    // Vérifier que l'utilisateur est bien un professionnel
    const proRoles = ['salon_owner', 'professional', 'employee'];
    if (!proRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: "Vous utilisez un compte client. Veuillez utiliser la page de connexion client." 
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Erreur login pro:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Vérifier d'abord les identifiants admin via les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    
    if (email === adminEmail && password === adminPassword) {
      // Créer un token JWT pour l'admin
      const token = jwt.sign({ userId: 0, role: 'admin', name: adminName, email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ 
        token, 
        user: { id: 0, name: adminName, email, role: 'admin' } 
      });
    }
    
    // Sinon, vérifier dans la base de données
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas administrateur." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Identifiants incorrects" });

    const token = jwt.sign({ userId: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'admin' } });
  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        salon: { select: { name: true } }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur de récupération" });
  }
};

export default { register, login, proLogin, adminLogin, getAllUsers, registerValidation, loginValidation };
