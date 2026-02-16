import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './invitationController.js';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Récupérer toutes les photos de la galerie
export const getGallery = async (req, res) => {
  try {
    const { id: salonId } = req.params;
    console.log('Récupération galerie pour salonId:', salonId);
    if (!salonId) {
      return res.status(400).json({ error: "ID du salon requis" });
    }
    const gallery = await prisma.salonGallery.findMany({
      where: { salonId: parseInt(salonId) },
      orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(gallery);
  } catch (error) {
    console.error('Erreur récupération galerie:', error);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
};

// Ajouter une photo à la galerie
export const addPhoto = async (req, res) => {
  try {
    const { id: salonId } = req.params;
    console.log('Ajout photo pour salonId:', salonId, 'Body:', req.body);
    
    if (!req.body) {
      return res.status(400).json({ error: "Corps de la requête requis" });
    }
    
    const { title, category, isPrimary, image } = req.body;
    
    // Vérifier que le pro est propriétaire du salon
    const salon = await prisma.salon.findFirst({ 
      where: { id: parseInt(salonId), userId: req.user.id } 
    });
    
    if (!salon) {
      return res.status(403).json({ error: "Non autorisé à modifier ce salon" });
    }
    
    if (!image) {
      return res.status(400).json({ error: "Image requise" });
    }
    
    // Uploader sur Cloudinary
    let imageUrl = image;
    try {
      // Si c'est une base64 data URL, uploader sur Cloudinary
      if (image.startsWith('data:')) {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'planity/gallery',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
          ]
        });
        imageUrl = uploadResult.secure_url;
        console.log('Image uploadée sur Cloudinary:', imageUrl);
      }
    } catch (uploadError) {
      console.error('Erreur upload Cloudinary:', uploadError);
      // Garder l'URL base64 en cas d'erreur
    }
    
    // Si c'est marquée comme photo principale, retirer le flag des autres
    if (isPrimary === true || isPrimary === 'true') {
      await prisma.salonGallery.updateMany({
        where: { salonId: parseInt(salonId) },
        data: { isPrimary: false }
      });
    }
    
    const galleryItem = await prisma.salonGallery.create({
      data: {
        salonId: parseInt(salonId),
        imageUrl,
        title: title || null,
        category: category || null,
        isPrimary: isPrimary === true || isPrimary === 'true',
        order: 0
      }
    });
    
    res.status(201).json(galleryItem);
  } catch (error) {
    console.error('Erreur ajout photo:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
};

// Supprimer une photo de la galerie
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryItem = await prisma.salonGallery.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!galleryItem) {
      return res.status(404).json({ error: "Photo non trouvée" });
    }
    
    // Vérifier que le pro est propriétaire du salon
    const salon = await prisma.salon.findFirst({ 
      where: { id: galleryItem.salonId, userId: req.user.id } 
    });
    
    if (!salon && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Supprimer de Cloudinary si c'est une URL Cloudinary
    try {
      if (galleryItem.imageUrl.includes('cloudinary.com')) {
        const publicId = galleryItem.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`planity/gallery/${publicId}`);
      }
    } catch (cloudinaryError) {
      console.error('Erreur suppression Cloudinary:', cloudinaryError);
    }
    
    await prisma.salonGallery.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Photo supprimée" });
  } catch (error) {
    console.error('Erreur suppression photo:', error);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
};

// Définir une photo comme principale
export const setPrimary = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryItem = await prisma.salonGallery.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!galleryItem) {
      return res.status(404).json({ error: "Photo non trouvée" });
    }
    
    // Vérifier que le pro est propriétaire du salon
    const salon = await prisma.salon.findFirst({ 
      where: { id: galleryItem.salonId, userId: req.user.id } 
    });
    
    if (!salon && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Non autorisé" });
    }
    
    // Retirer le flag primary des autres photos
    await prisma.salonGallery.updateMany({
      where: { salonId: galleryItem.salonId },
      data: { isPrimary: false }
    });
    
    // Définir cette photo comme principale
    await prisma.salonGallery.update({
      where: { id: parseInt(id) },
      data: { isPrimary: true }
    });
    
    res.json({ message: "Photo définie comme principale" });
  } catch (error) {
    console.error('Erreur mise à jour:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
};

// Export par défaut pour compatibilité avec les imports existants
export default {
  getGallery,
  addPhoto,
  deletePhoto,
  setPrimary
};
