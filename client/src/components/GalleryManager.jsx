import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Star, Image, X, Check, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const GalleryManager = ({ salon, onClose }) => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('prestation');
  const [isPrimary, setIsPrimary] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'interieur', label: ' Intérieur du salon' },
    { value: 'prestation', label: 'Prestation' },
    { value: 'equipe', label: 'Équipe' },
    { value: 'resultat', label: 'Résultat' }
  ];

  // Charger la galerie
  const fetchGallery = async () => {
    if (!salon?.id) return;
    
    try {
      const response = await fetch(`${API_BASE}/salons/${salon.id}/gallery`);
      if (response.ok) {
        const data = await response.json();
        setGallery(data);
      }
    } catch (err) {
      console.error('Erreur chargement galerie:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [salon]);

  // Gérer la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(file);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Uploader une photo
  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', previewUrl);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('isPrimary', isPrimary);

      const response = await fetch(`${API_BASE}/salons/${salon.id}/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Photo ajoutée avec succès');
        setGallery([...gallery, data]);
        resetForm();
      } else {
        setError(data.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const handleDelete = async (photoId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/gallery/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGallery(gallery.filter(p => p.id !== photoId));
        setSuccess('Photo supprimée');
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  // Définir comme photo principale
  const handleSetPrimary = async (photoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/gallery/${photoId}/primary`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Mettre à jour localement
        const updatedGallery = gallery.map(p => ({
          ...p,
          isPrimary: p.id === photoId
        }));
        setGallery(updatedGallery);
        setSuccess('Photo définie comme principale');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setTitle('');
    setCategory('prestation');
    setIsPrimary(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Galerie Photos</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={styles.errorMessage}>
            {error}
            <button onClick={() => setError('')} style={styles.messageClose}>
              <X size={16} />
            </button>
          </div>
        )}
        {success && (
          <div style={styles.successMessage}>
            {success}
            <button onClick={() => setSuccess('')} style={styles.messageClose}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Formulaire d'upload */}
        <div style={styles.uploadSection}>
          <div style={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="Aperçu" style={styles.previewImage} />
            ) : (
              <div style={styles.uploadPlaceholder}>
                <Upload size={48} style={styles.uploadIcon} />
                <p style={styles.uploadText}>Cliquez pour sélectionner une photo</p>
                <p style={styles.uploadHint}>JPG, PNG, WebP - Max 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {previewUrl && (
            <div style={styles.formOptions}>
              <input
                type="text"
                placeholder="Titre de la photo (optionnel)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  style={styles.checkbox}
                />
                <Star size={16} style={{ color: isPrimary ? '#FFB800' : '#9CA3AF' }} />
                <span>Photo principale</span>
              </label>

              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  ...styles.uploadButton,
                  opacity: uploading ? 0.7 : 1
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Ajouter la photo
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Liste des photos */}
        <div style={styles.gallerySection}>
          <h3 style={styles.sectionTitle}>
            Photos de la galerie ({gallery.length})
          </h3>

          {loading ? (
            <div style={styles.loading}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p>Chargement...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div style={styles.emptyState}>
              <Image size={48} style={{ color: '#9CA3AF' }} />
              <p>Aucune photo dans la galerie</p>
              <p style={styles.emptyHint}>Ajoutez des photos pour présenter votre salon</p>
            </div>
          ) : (
            <div style={styles.galleryGrid}>
              {gallery.map((photo) => (
                <div key={photo.id} style={styles.photoCard}>
                  <div style={styles.photoContainer}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.title || 'Photo salon'}
                      style={styles.photoImage}
                    />
                    {photo.isPrimary && (
                      <div style={styles.primaryBadge}>
                        <Star size={12} fill="#FFB800" color="#FFB800" />
                        Principale
                      </div>
                    )}
                  </div>
                  <div style={styles.photoInfo}>
                    {photo.title && (
                      <p style={styles.photoTitle}>{photo.title}</p>
                    )}
                    <p style={styles.photoCategory}>
                      {categories.find(c => c.value === photo.category)?.label || photo.category}
                    </p>
                    <div style={styles.photoActions}>
                      {!photo.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(photo.id)}
                          style={styles.actionButton}
                          title="Définir comme principale"
                        >
                          <Star size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(photo.id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6B7280',
    padding: '4px'
  },
  errorMessage: {
    margin: '16px 24px',
    padding: '12px 16px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  successMessage: {
    margin: '16px 24px',
    padding: '12px 16px',
    backgroundColor: '#D1FAE5',
    color: '#059669',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  messageClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    padding: 0
  },
  uploadSection: {
    padding: '24px',
    borderBottom: '1px solid #E5E7EB'
  },
  uploadArea: {
    border: '2px dashed #D1D5DB',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#F9FAFB',
    marginBottom: '16px'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  uploadIcon: {
    color: '#9CA3AF'
  },
  uploadText: {
    margin: 0,
    color: '#374151',
    fontWeight: '500'
  },
  uploadHint: {
    margin: 0,
    color: '#9CA3AF',
    fontSize: '14px'
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    objectFit: 'contain'
  },
  formOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
  },
  checkbox: {
    width: '18px',
    height: '18px'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px'
  },
  gallerySection: {
    padding: '24px',
    flex: 1
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px',
    color: '#6B7280'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '40px',
    color: '#6B7280'
  },
  emptyHint: {
    fontSize: '14px',
    color: '#9CA3AF'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px'
  },
  photoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  photoContainer: {
    position: 'relative',
    aspectRatio: '1',
    backgroundColor: '#E5E7EB'
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  primaryBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#FFB800'
  },
  photoInfo: {
    padding: '12px'
  },
  photoTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  photoCategory: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#6B7280'
  },
  photoActions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.2s'
  },
  deleteButton: {
    color: '#DC2626',
    borderColor: '#FEE2E2',
    backgroundColor: '#FEE2E2'
  }
};

export default GalleryManager;
