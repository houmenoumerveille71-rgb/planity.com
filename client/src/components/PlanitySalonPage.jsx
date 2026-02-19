import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen font-['Inter',sans-serif] bg-white flex items-center justify-center">
          <p className="text-center p-16">Chargement...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!salon) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen font-['Inter',sans-serif] bg-white flex items-center justify-center">
          <p className="text-center p-16">Salon non trouvé</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen font-['Inter',sans-serif] bg-white">
        {/* Salon Header */}
        <div className="bg-gray-50 border-b border-gray-200 py-4">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold mb-2">{salon.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-gray-500 text-sm">
                <MapPin size={16} className="text-gray-500" />
                <span>{salon.address}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Star size={16} fill="#FFB800" color="#FFB800" />
                <span className="text-sm font-semibold">4.9 (235 avis)</span>
                <span className="text-gray-500 text-sm">FCFA</span>
              </div>
            </div>
            <button 
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              onClick={handleReserve}
            >
              Réserver
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="rounded-xl overflow-hidden">
              {gallery.find(p => p.isPrimary) || gallery[0] ? (
                <img 
                  src={(gallery.find(p => p.isPrimary) || gallery[0])?.imageUrl} 
                  alt={salon.name} 
                  className="w-full h-48 sm:h-64 md:h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const index = gallery.findIndex(p => p.isPrimary) || 0;
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              ) : salon.image ? (
                <img src={salon.image} alt={salon.name} className="w-full h-48 sm:h-64 md:h-80 object-cover" />
              ) : (
                <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-200 flex items-center justify-center text-4xl">
                  📷
                </div>
              )}
            </div>
            
            {/* Grid Images */}
            <div className="grid grid-cols-2 gap-2">
              {gallery.length > 0 ? (
                gallery.slice(0, 4).map((photo, idx) => (
                  <div 
                    key={photo.id || idx} 
                    className="h-24 sm:h-32 md:h-[calc(10rem)] bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title || `Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">🪞</div>
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">💇</div>
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">✨</div>
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">💅</div>
                </>
              )}
              {gallery.length > 4 && (
                <div 
                  className="h-24 sm:h-32 bg-black flex items-center justify-center text-white text-xl font-bold rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setLightboxIndex(4);
                    setLightboxOpen(true);
                  }}
                >
                  +{gallery.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && gallery.length > 0 && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={32} />
            </button>
            <button 
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white p-2 sm:p-4 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
              }}
            >
              <ChevronLeft size={32} />
            </button>
            <img 
              src={gallery[lightboxIndex % gallery.length]?.imageUrl} 
              alt="Gallery"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white p-2 sm:p-4 hover:bg-white/10 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
              }}
            >
              <ChevronRight size={32} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          </div>
        )}

        {/* Booking Banner */}
        <div className="bg-gray-50 border-y border-gray-200 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-lg sm:text-xl font-bold mb-2">Réserver en ligne pour un RDV chez {salon.name}</h2>
            <p className="text-gray-500 text-sm">24h/24 · {salon.services?.length || 0} prestations · Paiement sur place · Confirmation immédiate</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services Section */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">Choix de la prestation</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-200 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors">Non-genrée</button>
                  <button className="px-4 py-2 bg-black text-white rounded-md text-sm">Avis</button>
                </div>
              </div>

              {/* Services du salon */}
              {salon.services && salon.services.length > 0 ? (
                salon.services.map((service, idx) => (
                  <div key={service.id || idx} className="py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500">{service.description}</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        <div className="text-sm text-gray-500">{service.duration || 30}min</div>
                        <div className="font-semibold">{service.price}FCFA</div>
                        <button 
                          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                            selectedService?.id === service.id 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setSelectedService(service);
                            navigate(`/booking/${id}/${service.id}`);
                          }}
                        >
                          {selectedService?.id === service.id ? 'Sélectionné' : 'Choisir'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucun service disponible</p>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rating Card */}
              <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                <div className="text-4xl font-bold mb-2">4.9</div>
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
                <div className="text-left text-sm space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Accueil</span>
                    <span>4.9 ★</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Qualité du service</span>
                    <span>4.9 ★</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Cadre et propreté</span>
                    <span>4.9 ★</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Rapport qualité prix</span>
                    <span>4.9 ★</span>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold mb-4">Horaires d'ouverture</h3>
                <div className="space-y-2 text-sm">
                  {getFormattedHours().map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1">
                      <span className="font-medium">{item.day}</span>
                      <span className={item.hours === 'Fermé' ? 'text-red-500 font-medium' : 'text-gray-500'}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-lg font-bold mb-2">Où se situe le salon ?</h3>
          <p className="text-gray-500 mb-6">{salon.address}</p>
          {!showMap ? (
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-200 transition-colors mx-auto"
              onClick={() => setShowMap(true)}
            >
              🗺️ Afficher la carte
            </button>
          ) : (
            <div>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(salon.address || salon.name)}`}
                className="w-full h-64 sm:h-80 border-0 rounded-xl mb-4"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Emplacement du salon"
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.address || salon.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                🧭 Afficher l'itinéraire
              </a>
              <button 
                className="w-full mt-2 py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                onClick={() => setShowMap(false)}
              >
                Masquer la carte
              </button>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-xl font-bold mb-6">Collaborateurs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {team.map(member => (
              <div key={member.id} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black text-white flex items-center justify-center text-xl sm:text-2xl font-bold">
                  {member.avatar}
                </div>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h3 className="text-xl font-bold mb-6">Informations</h3>
          <div className="flex gap-4 sm:gap-8 border-b-2 border-gray-200 mb-8 overflow-x-auto">
            <button 
              className={`pb-4 px-2 whitespace-nowrap font-medium transition-colors ${
                activeTab === 'presentation' 
                  ? 'border-b-2 border-black text-black font-semibold' 
                  : 'text-gray-500 hover:text-black'
              }`}
              onClick={() => setActiveTab('presentation')}
            >
              Présentation
            </button>
            <button 
              className={`pb-4 px-2 whitespace-nowrap font-medium transition-colors ${
                activeTab === 'avis' 
                  ? 'border-b-2 border-black text-black font-semibold' 
                  : 'text-gray-500 hover:text-black'
              }`}
              onClick={() => setActiveTab('avis')}
            >
              À propos
            </button>
          </div>

          <div>
            {salon.description ? (
              <>
                <h4 className="font-bold mb-4">Présentation</h4>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    <strong>Bienvenue chez {salon.name}</strong> !
                  </p>
                  <p>{salon.description}</p>
                </div>
              </>
            ) : (
              <div className="text-gray-600 leading-relaxed">
                <p className="mb-4">
                  <strong>Bienvenue chez {salon.name}</strong>, votre salon de référence !
                </p>
                <p>
                  Situé en plein cœur de la ville, notre salon vous accueille dans un cadre moderne et chaleureux.
                  Notre équipe talentueuse est là pour vous offrir les meilleurs services.
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-semibold mb-4">Dans cet établissement</h4>
              <div className="flex flex-wrap gap-3">
                {salon.category && (
                  <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">{salon.category}</span>
                )}
                {tags.slice(0, 5).map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">{tag}</span>
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

export default PlanitySalonPage;
