import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware pour vérifier le token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Accès refusé, token manquant" });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      console.error('Erreur vérification token:', err.message);
      return res.status(403).json({ error: "Token invalide ou expiré" });
    }
    
    try {
      const fullUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!fullUser) {
        return res.status(403).json({ error: "Utilisateur non trouvé" });
      }
      req.user = fullUser;
      next();
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  });
};

// Middleware admin
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Token manquant" });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }
    req.user = decoded;
    next();
  });
};

// Créer une invitation
export const createInvitation = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  
  try {
    const salon = await prisma.salon.findUnique({ where: { id: parseInt(id) } });
    if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
    
    if (salon.userId !== req.user.id) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à inviter" });
    }
    
    const existingInvitation = await prisma.invitation.findFirst({
      where: { salonId: parseInt(id), email, status: 'pending' }
    });
    
    if (existingInvitation) {
      return res.status(400).json({ error: "Invitation déjà en attente pour cet email" });
    }
    
    const inviteToken = jwt.sign(
      { salonId: parseInt(id), email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const invitation = await prisma.invitation.create({
      data: {
        salonId: parseInt(id),
        email,
        role: role || 'employee',
        token: inviteToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      }
    });
    
    const inviteUrl = `http://localhost:5173/register?invite=${inviteToken}`;
    
    res.status(201).json({
      message: "Invitation envoyée",
      invitation: { id: invitation.id, email: invitation.email, role: invitation.role, status: invitation.status },
      inviteUrl
    });
    
  } catch (error) {
    console.error('Erreur création invitation:', error);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
};

// Récupérer les invitations d'un salon
export const getInvitations = async (req, res) => {
  const { id } = req.params;
  
  try {
    const invitations = await prisma.invitation.findMany({
      where: { salonId: parseInt(id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération" });
  }
};

// Accepter invitation via register-invite
export const acceptInvite = async (req, res) => {
  const { token, password, name, phone } = req.body;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const invitation = await prisma.invitation.findFirst({
      where: { token: token, email: decoded.email, status: 'pending' }
    });
    
    if (!invitation) {
      return res.status(400).json({ error: "Invitation invalide ou expirée" });
    }
    
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: "Invitation expirée" });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email: decoded.email } });
    
    if (existingUser) {
      await prisma.salon.update({
        where: { id: decoded.salonId },
        data: { userId: existingUser.id }
      });
      
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' }
      });
      
      const newToken = jwt.sign({ userId: existingUser.id }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token: newToken, user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: 'employee' } });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: decoded.email,
        name: name || '',
        password: hashedPassword,
        phone: phone || null,
        role: decoded.role || 'employee'
      }
    });
    
    await prisma.salon.update({
      where: { id: decoded.salonId },
      data: { userId: user.id }
    });
    
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' }
    });
    
    const authToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token: authToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    
  } catch (error) {
    console.error('Erreur acceptation:', error);
    res.status(400).json({ error: "Token invalide ou expiré" });
  }
};

// Annuler invitation
export const cancelInvitation = async (req, res) => {
  const { id } = req.params;
  
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: parseInt(id) },
      include: { salon: true }
    });
    
    if (!invitation) {
      return res.status(404).json({ error: "Invitation non trouvée" });
    }
    
    if (invitation.salon.userId !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    await prisma.invitation.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Invitation annulée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
};

// Récupérer invitation par token
export const getInvitationByToken = async (req, res) => {
  const { token } = req.params;
  
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { salon: true }
    });
    
    if (!invitation) {
      return res.status(404).json({ error: "Invitation non trouvée" });
    }
    
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: "Invitation déjà utilisée" });
    }
    
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: "Invitation expirée" });
    }
    
    res.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      salonName: invitation.salon.name,
      expiresAt: invitation.expiresAt,
      status: invitation.status
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: "Erreur récupération" });
  }
};

export default { authenticateToken, requireAdmin, createInvitation, getInvitations, acceptInvite, cancelInvitation, getInvitationByToken };
