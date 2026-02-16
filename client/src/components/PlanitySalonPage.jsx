import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Image as ImageIcon } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Jours de la semaine
const DAYS_OF_WEEK = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const PlanitySalonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState('presentation');
  const [showMap, setShowMap] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Navigate to booking page when a service is selected
  const handleReserve = () => {
    if (selectedService) {
      navigate(`/booking/${id}/${selectedService.id}`);
    }
  };

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        // Récupérer les détails du salon
        const salonResponse = await fetch(`${API_BASE}/salons/${id}`);
        if (salonResponse.ok) {
          const salonData = await salonResponse.json();
          setSalon(salonData);
        }

        // Récupérer les disponibilités/horaires
        const availResponse = await fetch(`${API_BASE}/salons/${id}/availabilities`);
        if (availResponse.ok) {
          const availData = await availResponse.json();
          setAvailabilities(availData);
        }

        // Récupérer la galerie photos
        const galleryResponse = await fetch(`${API_BASE}/salons/${id}/gallery`);
        if (galleryResponse.ok) {
          const galleryData = await galleryResponse.json();
          setGallery(galleryData);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [id]);

  // Formater les horaires depuis les disponibilités API
  const getFormattedHours = () => {
    if (availabilities.length === 0) {
      return [
        { day: 'Lundi', hours: 'Fermé' },
        { day: 'Mardi', hours: 'Fermé' },
        { day: 'Mercredi', hours: 'Fermé' },
        { day: 'Jeudi', hours: 'Fermé' },
        { day: 'Vendredi', hours: 'Fermé' },
        { day: 'Samedi', hours: 'Fermé' },
        { day: 'Dimanche', hours: 'Fermé' }
      ];
    }

    const hours = [];
    for (let i = 1; i <= 6; i++) { // Lundi à Samedi
      const avail = availabilities.find(a => a.dayOfWeek === i);
      if (avail && avail.startTime && avail.endTime) {
        hours.push({ day: DAYS_OF_WEEK[i], hours: `${avail.startTime} - ${avail.endTime}` });
      } else {
        hours.push({ day: DAYS_OF_WEEK[i], hours: 'Fermé' });
      }
    }
    // Dimanche
    const sunday = availabilities.find(a => a.dayOfWeek === 0);
    hours.push({ day: 'Dimanche', hours: (sunday && sunday.startTime && sunday.endTime) ? `${sunday.startTime} - ${sunday.endTime}` : 'Fermé' });
    
    return hours;
  };

  const team = [
    { id: 1, name: 'Juliu', avatar: 'J' },
    { id: 2, name: 'Gilou', avatar: 'G' },
    { id: 3, name: 'Natalia', avatar: 'N' },
    { id: 4, name: 'Omar', avatar: 'O' }
  ];

  const tags = [
    'Barber Paris',
    'Établissement Paris',
    'Coiffure homme Paris',
    'Coiffure femme Paris',
    'Extension Paris',
    "Lissage et défrisage Paris",
    'Soin du visage Paris',
    'Coiffure Paris'
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <p style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!salon) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <p style={{ textAlign: 'center', padding: '4rem' }}>Salon non trouvé</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Salon Header */}
        <div style={styles.salonHeader}>
          <div style={styles.salonHeaderContent}>
            <div>
              <h1 style={styles.salonName}>{salon.name}</h1>
              <div style={styles.salonMeta}>
                <MapPin size={16} style={styles.metaIcon} />
                <span style={styles.address}>{salon.address}</span>
              </div>
              <div style={styles.rating}>
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <span style={styles.ratingText}>4.9 (235 avis)</span>
                <span style={styles.priceLevel}>FCFA</span>
              </div>
            </div>
            <button style={styles.reserveButton} onClick={handleReserve}>Réserver</button>
          </div>
        </div>

        {/* Gallery */}
        <div style={styles.gallery}>
          <div style={styles.galleryMain}>
            {gallery.find(p => p.isPrimary) || gallery[0] ? (
              <img 
                src={(gallery.find(p => p.isPrimary) || gallery[0])?.imageUrl} 
                alt={salon.name} 
                style={styles.galleryMainImage}
                onClick={() => {
                  const index = gallery.findIndex(p => p.isPrimary) || 0;
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              />
            ) : salon.image ? (
              <img src={salon.image} alt={salon.name} style={styles.galleryMainImage} />
            ) : (
              <div style={styles.galleryPlaceholder}>📷</div>
            )}
          </div>
          <div style={styles.galleryGrid}>
            {gallery.length > 0 ? (
              gallery.slice(0, 4).map((photo, idx) => (
                <div 
                  key={photo.id || idx} 
                  style={styles.galleryImagePlaceholder}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title || `Photo ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              ))
            ) : (
              <>
                <div style={styles.galleryImagePlaceholder}>🪞</div>
                <div style={styles.galleryImagePlaceholder}>💇</div>
                <div style={styles.galleryImagePlaceholder}>✨</div>
                <div style={styles.galleryImagePlaceholder}>💅</div>
              </>
            )}
            {gallery.length > 4 && (
              <div 
                style={{...styles.galleryImagePlaceholder, backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer'}}
                onClick={() => {
                  setLightboxIndex(4);
                  setLightboxOpen(true);
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>+{gallery.length - 4}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && gallery.length > 0 && (
          <div style={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
            <button 
              style={styles.lightboxClose}
              onClick={() => setLightboxOpen(false)}
            >✕</button>
            <button 
              style={styles.lightboxPrev}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
              }}
            >‹</button>
            <img 
              src={gallery[lightboxIndex % gallery.length]?.imageUrl} 
              alt="Gallery"
              style={styles.lightboxImage}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              style={styles.lightboxNext}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
              }}
            >›</button>
            <div style={styles.lightboxCounter}>
              {lightboxIndex + 1} / {gallery.length}
            </div>
          </div>
        )}

      {/* Booking Banner */}
      <div style={styles.bookingBanner}>
        <div style={styles.bannerContent}>
          <h2 style={styles.bannerTitle}>Réserver en ligne pour un RDV chez {salon.name}</h2>
          <p style={styles.bannerSubtitle}>24h/24 · {salon.services?.length || 0} prestations · Paiement sur place · Confirmation immédiate</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Services Section */}
        <div style={styles.servicesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Choix de la prestation</h2>
            <div style={styles.genderToggle}>
              <button style={styles.genderButton}>Non-genrée</button>
              <button style={{...styles.genderButton, ...styles.genderButtonActive}}>Avis</button>
            </div>
          </div>

          {/* Services du salon */}
          {salon.services && salon.services.length > 0 ? (
            salon.services.map((service, idx) => (
              <div key={service.id || idx} style={styles.serviceItem}>
                <div style={styles.serviceInfo}>
                  <div style={styles.serviceName}>{service.name}</div>
                  {service.description && (
                    <div style={styles.serviceDescription}>{service.description}</div>
                  )}
                </div>
                <div style={styles.serviceRight}>
                  <div style={styles.serviceDuration}>{service.duration || 30}min</div>
                  <div style={styles.servicePrice}>{service.price}FCFA</div>
                  <button 
                    style={selectedService?.id === service.id ? {...styles.selectButton, ...styles.selectButtonSelected} : styles.selectButton}
                    onClick={() => {
                      setSelectedService(service);
                      navigate(`/booking/${id}/${service.id}`);
                    }}
                  >
                    {selectedService?.id === service.id ? 'Sélectionné' : 'Choisir'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#6B7280' }}>Aucun service disponible</p>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Rating Card */}
          <div style={styles.ratingCard}>
            <div style={styles.ratingScore}>4.9</div>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
              ))}
            </div>
            <div style={styles.ratingDetails}>
              <div style={styles.ratingRow}>
                <span>Accueil</span>
                <span>4.9 ★</span>
              </div>
              <div style={styles.ratingRow}>
                <span>Qualité du service</span>
                <span>4.9 ★</span>
              </div>
              <div style={styles.ratingRow}>
                <span>Cadre et propreté</span>
                <span>4.9 ★</span>
              </div>
              <div style={styles.ratingRow}>
                <span>Rapport qualité prix</span>
                <span>4.9 ★</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div style={styles.hoursCard}>
            <h3 style={styles.cardTitle}>Horaires d'ouverture</h3>
            {getFormattedHours().map((item, idx) => (
              <div key={idx} style={styles.hoursRow}>
                <span style={styles.dayName}>{item.day}</span>
                <span style={item.hours === 'Fermé' ? styles.hoursClosed : styles.hours}>{item.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={styles.mapSection}>
        <h3 style={styles.mapTitle}>Où se situe le salon ?</h3>
        <p style={styles.mapAddress}>{salon.address}</p>
        {!showMap ? (
          <button 
            style={styles.mapButton}
            onClick={() => setShowMap(true)}
          >
            🗺️ Afficher la carte
          </button>
        ) : (
          <div style={styles.mapContainer}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(salon.address || salon.name)}`}
              style={styles.mapIframe}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps - Emplacement du salon"
            />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.address || salon.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.itineraryButtonFull}
            >
              🧭 Afficher l'itinéraire
            </a>
            <button 
              style={styles.hideMapButton}
              onClick={() => setShowMap(false)}
            >
              Masquer la carte
            </button>
          </div>
        )}
      </div>

      {/* Team Section */}
      <div style={styles.teamSection}>
        <h3 style={styles.sectionTitle}>Collaborateurs</h3>
        <div style={styles.teamGrid}>
          {team.map(member => (
            <div key={member.id} style={styles.teamMember}>
              <div style={styles.teamAvatar}>{member.avatar}</div>
              <span style={styles.teamName}>{member.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <div style={styles.tabsSection}>
        <h3 style={styles.sectionTitle}>Informations</h3>
        <div style={styles.tabs}>
          <button 
            style={activeTab === 'presentation' ? {...styles.tab, ...styles.tabActive} : styles.tab}
            onClick={() => setActiveTab('presentation')}
          >
            Présentation
          </button>
          <button 
            style={activeTab === 'avis' ? {...styles.tab, ...styles.tabActive} : styles.tab}
            onClick={() => setActiveTab('avis')}
          >
            À propos
          </button>
        </div>

        <div style={styles.tabContent}>
          {salon.description ? (
            <>
              <h4 style={styles.tabContentTitle}>Présentation</h4>
              <div style={styles.description}>
                <p>
                  <strong>Bienvenue chez {salon.name}</strong> !
                </p>
                <p>{salon.description}</p>
              </div>
            </>
          ) : (
            <div style={styles.description}>
              <p>
                <strong>Bienvenue chez {salon.name}</strong>, votre salon de référence !
              </p>
              <p>
                Situé en plein cœur de la ville, notre salon vous accueille dans un cadre moderne et chaleureux.
                Notre équipe talentueuse est là pour vous offrir les meilleurs services.
              </p>
            </div>
          )}

          <div style={styles.tags}>
            <h4 style={styles.tagsTitle}>Dans cet établissement</h4>
            <div style={styles.tagsList}>
              {salon.category && (
                <span style={styles.tag}>{salon.category}</span>
              )}
              {tags.slice(0, 5).map((tag, idx) => (
                <span key={idx} style={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
  },

  // Salon Header
  salonHeader: {
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    padding: '2rem 0',
  },
  salonHeaderContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salonName: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  salonMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    color: '#6B7280',
    fontSize: '0.9rem',
  },
  metaIcon: {
    color: '#6B7280',
  },
  address: {
    color: '#6B7280',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingText: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  priceLevel: {
    color: '#6B7280',
  },
  reserveButton: {
    padding: '0.75rem 2.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Gallery
  gallery: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 600px',
    gap: '1rem',
  },
  galleryMain: {
    borderRadius: '12px',
    overflow: 'hidden',
  },
  galleryMainImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
  },
  galleryPlaceholder: {
    width: '100%',
    height: '400px',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  galleryImagePlaceholder: {
    width: '100%',
    height: '190px',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    borderRadius: '12px',
  },

  // Booking Banner
  bookingBanner: {
    backgroundColor: '#F9FAFB',
    borderTop: '1px solid #E5E7EB',
    borderBottom: '1px solid #E5E7EB',
    padding: '1.5rem 0',
  },
  bannerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  bannerTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  bannerSubtitle: {
    color: '#6B7280',
    fontSize: '0.9rem',
  },

  // Main Content
  mainContent: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '2rem',
  },

  // Services Section
  servicesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  genderToggle: {
    display: 'flex',
    gap: '0.5rem',
  },
  genderButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    backgroundColor: '#FFF',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  genderButtonActive: {
    backgroundColor: '#000',
    color: '#FFF',
    borderColor: '#000',
  },

  // Service Item
  serviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid #F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  serviceDescription: {
    fontSize: '0.85rem',
    color: '#6B7280',
  },
  serviceRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  serviceDuration: {
    fontSize: '0.875rem',
    color: '#6B7280',
    minWidth: '60px',
  },
  servicePrice: {
    fontSize: '0.95rem',
    fontWeight: '600',
    minWidth: '80px',
  },
  selectButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  selectButtonSelected: {
    backgroundColor: '#6366F1',
    color: '#FFF',
  },

  // Sidebar
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },

  // Rating Card
  ratingCard: {
    backgroundColor: '#1F2937',
    color: '#FFF',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  ratingScore: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.25rem',
    marginBottom: '1.5rem',
  },
  ratingDetails: {
    textAlign: 'left',
  },
  ratingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.875rem',
  },

  // Hours Card
  hoursCard: {
    backgroundColor: '#F9FAFB',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  hoursRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
  dayName: {
    fontWeight: '500',
  },
  hours: {
    color: '#6B7280',
  },
  hoursClosed: {
    color: '#DC2626',
    fontWeight: '500',
  },

  // Map Section
  mapSection: {
    maxWidth: '1200px',
    margin: '3rem auto',
    padding: '0 2rem',
  },
  mapTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  mapAddress: {
    color: '#6B7280',
    marginBottom: '1.5rem',
  },
  mapContainer: {
    position: 'relative',
  },
  mapIframe: {
    width: '100%',
    height: '350px',
    border: '0',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  mapButton: {
    padding: '1rem 2rem',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0 auto',
  },
  hideMapButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  itineraryButtonFull: {
    display: 'block',
    textAlign: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },

  // Team Section
  teamSection: {
    maxWidth: '1200px',
    margin: '3rem auto',
    padding: '0 2rem',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
    marginTop: '1.5rem',
  },
  teamMember: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  teamAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  teamName: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },

  // Tabs Section
  tabsSection: {
    maxWidth: '1200px',
    margin: '3rem auto 4rem',
    padding: '0 2rem',
  },
  tabs: {
    display: 'flex',
    gap: '2rem',
    borderBottom: '2px solid #E5E7EB',
    marginTop: '1.5rem',
    marginBottom: '2rem',
  },
  tab: {
    padding: '1rem 0',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#6B7280',
    transition: 'all 0.2s',
  },
  tabActive: {
    borderBottomColor: '#000',
    color: '#000',
    fontWeight: '600',
  },
  tabContent: {
    marginTop: '2rem',
  },
  tabContentTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  description: {
    lineHeight: '1.7',
    color: '#374151',
    fontSize: '0.95rem',
  },
  tags: {
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid #E5E7EB',
  },
  tagsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  tag: {
    padding: '0.5rem 1rem',
    backgroundColor: '#F3F4F6',
    borderRadius: '20px',
    fontSize: '0.875rem',
    color: '#374151',
  },

  // Lightbox
  lightboxOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lightboxImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
  },
  lightboxClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '32px',
    cursor: 'pointer',
    padding: '10px',
  },
  lightboxPrev: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '48px',
    cursor: 'pointer',
    padding: '20px',
  },
  lightboxNext: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '48px',
    cursor: 'pointer',
    padding: '20px',
  },
  lightboxCounter: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: '16px',
  },
};

export default PlanitySalonPage;
