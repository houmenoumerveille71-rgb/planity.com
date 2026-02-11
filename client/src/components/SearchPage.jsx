import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Calendar, Star, 
  ChevronLeft, ChevronRight, SlidersHorizontal, Clock, Navigation, ChevronDown
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSalons } from '../services/api';
import { useAuth } from '../AuthContext';
import QuickScheduler from './QuickScheduler';

// Fonction pour formater les horaires d'ouverture
const getOpeningHours = (salon) => {
  // Horaires par défaut ou depuis la base de données
  const defaultHours = {
    0: 'Fermé',
    1: '08:00 - 19:00',
    2: '08:00 - 19:00',
    3: '08:00 - 19:00',
    4: '08:00 - 19:00',
    5: '08:00 - 19:00',
    6: '09:00 - 18:00',
  };
  
  return salon.openingHours || defaultHours;
};

// Composant Calendrier des horaires
const OpeningHoursCalendar = ({ salon, isOpen }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  
  // Fermer le calendrier en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const hours = getOpeningHours(salon);
  const today = new Date().getDay();
  
  return (
    <div className="relative" ref={calendarRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowCalendar(!showCalendar);
        }}
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
          isOpen ? 'text-[#48BB78] bg-[#F0FFF4]' : 'text-red-500 bg-red-50'
        }`}
      >
        <Clock size={12} />
        <span>{isOpen ? 'Ouvert' : 'Fermé'}</span>
        <ChevronDown size={12} />
      </button>
      
      {showCalendar && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-50 min-w-50">
          <p className="text-xs font-bold text-gray-500 mb-2">Horaires d'ouverture</p>
          <div className="space-y-1">
            {days.map((day, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center py-1 px-2 rounded ${
                  index === today ? 'bg-[#F0FFF4]' : ''
                }`}
              >
                <span className={`text-xs font-medium ${
                  index === today ? 'text-[#48BB78]' : 'text-gray-600'
                }`}>
                  {day}
                </span>
                <span className="text-xs text-gray-500">{hours[index] || 'Non défini'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  // Paramètres de recherche depuis l'URL
  const serviceQuery = searchParams.get('service') || '';
  const locationQuery = searchParams.get('ville') || '';

  // États pour les champs de recherche
  const [searchQuery, setSearchQuery] = useState({
    quoi: serviceQuery,
    ou: locationQuery,
    quand: ''
  });

  // Catégories disponibles
  const categories = [
    { id: 'coiffure-homme', name: 'Coiffure homme', icon: '💇' },
    { id: 'coiffure-femme', name: 'Coiffure femme', icon: '💇‍♀️' },
    { id: 'barbier', name: 'Barbier', icon: '🪒' },
    { id: 'manucure', name: 'Manucure', icon: '💅' },
    { id: 'estheticienne', name: 'Esthéticienne', icon: '✨' },
    { id: 'spa', name: 'Spa & Massage', icon: '🧖' },
  ];

  // Dates disponibles (7 prochains jours)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Centre de la carte (Cotonou, Bénin par défaut)
  const defaultCenter = { lat: 6.3659, lng: 2.4343 };

  // Google Maps API Key (à configurer dans .env)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    const fetchSalons = async () => {
      setLoading(true);
      try {
        const data = await searchSalons(locationQuery, serviceQuery);
        setSalons(data);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, [serviceQuery, locationQuery]);

  // Initialiser Google Maps
  useEffect(() => {
    if (!window.google && GOOGLE_MAPS_API_KEY) {
      // Charger le script Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.google) {
      initMap();
    }
  }, [salons, GOOGLE_MAPS_API_KEY]);

  const initMap = () => {
    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(document.getElementById('google-map'), {
        center: defaultCenter,
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
    }

    // Ajouter les marqueurs
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Centre sur le premier salon avec coordonnées
    const firstSalonWithCoords = salons.find(s => s.latitude && s.longitude);
    if (firstSalonWithCoords && mapRef.current) {
      mapRef.current.setCenter({
        lat: firstSalonWithCoords.latitude,
        lng: firstSalonWithCoords.longitude
      });
    }

    // Ajouter un marqueur pour chaque salon
    salons.forEach(salon => {
      if (!salon.latitude || !salon.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: salon.latitude, lng: salon.longitude },
        map: mapRef.current,
        title: salon.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 384 512">
              <path fill="#48BB78" d="M384 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C130.2 459.7 4 308.6 4 192C4 86 128 0 192 0s192 86 192 192z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(36, 48),
          anchor: new window.google.maps.Point(18, 48)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${salon.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${salon.address}</p>
            <p style="font-size: 12px; color: #48BB78;">${salon.category || 'Salon'}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef.current, marker);
      });

      marker.addListener('click', () => {
        navigate(`/salon/${salon.id}`);
      });

      markersRef.current.push(marker);
    });
  };

  // Fonction de recherche
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.quoi) params.set('service', searchQuery.quoi);
    if (searchQuery.ou) params.set('ville', searchQuery.ou);
    setSearchParams(params);
  };

  // Gérer la sélection de date
  const handleDateSelect = (date) => {
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    setSearchQuery({ ...searchQuery, quand: formattedDate });
    setShowDatePicker(false);
  };

  // Navigation vers le profil
  const handleAccountClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  // Navigation vers professional
  const handleProfessionalClick = () => {
    navigate('/pro-landing');
  };

  // Obtenir la position de l'utilisateur
  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (mapRef.current) {
            mapRef.current.setCenter({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(14);
          }

          // Ajouter un marqueur pour la position utilisateur
          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapRef.current,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12)
            }
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[#1A1A1A]">
      
      {/* --- HEADER / NAVBAR --- */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-8 flex-1">
          <span 
            className="text-2xl font-black tracking-tighter cursor-pointer"
            onClick={() => navigate('/')}
          >
            PLANITY
          </span>
          
          {/* Barre de recherche centrale */}
          <div className="flex items-center bg-[#F2F2F2] rounded-full px-4 py-2 w-full max-w-2xl border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
            <div className="flex flex-1 items-center px-3 border-r border-gray-300">
              <span className="text-[11px] font-bold uppercase mr-2 text-gray-500">Quoi</span>
              <input 
                type="text" 
                placeholder="Coiffeurs, manucure..."
                value={searchQuery.quoi}
                onChange={(e) => setSearchQuery({ ...searchQuery, quoi: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent outline-none text-sm w-full font-medium" 
              />
            </div>
            <div className="flex flex-1 items-center px-3 border-r border-gray-300">
              <span className="text-[11px] font-bold uppercase mr-2 text-gray-500">Où</span>
              <input 
                type="text" 
                placeholder="Cotonou, Porto-Novo..."
                value={searchQuery.ou}
                onChange={(e) => setSearchQuery({ ...searchQuery, ou: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent outline-none text-sm w-full font-medium" 
              />
            </div>
            <div className="relative flex flex-1 items-center px-3">
              <span className="text-[11px] font-bold uppercase mr-2 text-gray-500">Quand</span>
              <input 
                type="text" 
                placeholder="À tout moment"
                value={searchQuery.quand}
                onChange={(e) => setSearchQuery({ ...searchQuery, quand: e.target.value })}
                onFocus={() => setShowDatePicker(true)}
                className="bg-transparent outline-none text-sm w-full font-medium cursor-pointer" 
              />
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50">
                  <div className="grid grid-cols-3 gap-2">
                    {availableDates.map((date, i) => (
                      <button
                        key={i}
                        onClick={() => handleDateSelect(date)}
                        className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="block text-xs text-gray-400">
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                        <span className="block font-bold">
                          {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSearchQuery({ ...searchQuery, quand: '' })}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-black"
                  >
                    Effacer la date
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={handleSearch}
              className="bg-black p-2 rounded-full text-white hover:bg-gray-800 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <button 
            onClick={handleProfessionalClick}
            className="text-xs font-bold bg-[#F2F2F2] px-4 py-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            Je suis un professionnel de beauté
          </button>
          <button 
            onClick={handleAccountClick}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-[10px]">👤</span>
            </div>
            {user ? 'Mon compte' : 'Se connecter'}
          </button>
        </div>
      </header>

      {/* --- SOUS-BARRE CATÉGORIES --- */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <button 
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 font-bold text-[13px] hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal size={14} /> Filtres
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            className={`border rounded-full px-5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 hover:border-black'
            }`}
            onClick={() => setSearchQuery({ ...searchQuery, quoi: selectedCategory === cat.id ? '' : cat.name })}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* --- CONTENU PRINCIPAL (LISTE + CARTE) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Liste des résultats (Gauche) */}
        <div className="w-full lg:w-[55%] overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">
              {loading ? 'Recherche en cours...' : `${salons.length} résultat${salons.length !== 1 ? 's' : ''}`}
            </h2>
            <select className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-2">
              <option>Recommandé</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
              <option>Distance</option>
              <option>Note</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : salons.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Aucun salon trouvé.</p>
              <button 
                onClick={() => {
                  setSearchQuery({ quoi: '', ou: '', quand: '' });
                  setSearchParams({});
                }}
                className="mt-4 px-6 py-2 bg-black text-white rounded-lg font-bold"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            salons.map((salon) => (
              <div 
                key={salon.id} 
                className="flex gap-6 group cursor-pointer bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all"
                onClick={() => navigate(`/salon/${salon.id}`)}
              >
                <div className="relative w-72 h-48 shrink-0 rounded-xl overflow-hidden">
                  <img 
                    src={salon.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400"} 
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex flex-col justify-between py-1 flex-1">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#48BB78] uppercase mb-1">{salon.category || 'Salon'}</p>
                        <h3 className="text-xl font-bold leading-tight group-hover:text-[#48BB78] transition-colors">{salon.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="fill-black" />
                        <span className="text-sm font-bold">{salon.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPin size={14} />
                      <span className="truncate">{salon.address}</span>
                    </div>
                    {salon.distance && (
                      <span className="inline-block mt-1 text-xs text-gray-400">• {salon.distance} km</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <OpeningHoursCalendar salon={salon} isOpen={true} />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/salon/${salon.id}`);
                      }}
                      className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#48BB78] transition-colors"
                    >
                      Prendre RDV
                    </button>
                  </div>
                  
                  {/* QuickScheduler - Créneaux disponibles */}
                  <div className="mt-4">
                    <QuickScheduler />
                  </div>
                  
                  {/* Bouton Plus d'informations */}
                  <div className="mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/salon/${salon.id}`);
                      }}
                      className="text-sm font-medium text-gray-500 hover:text-black underline transition-colors"
                    >
                      Plus d'informations
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Carte Google Maps (Droite) */}
        <div className="hidden lg:block flex-1 bg-gray-100 relative">
          <div 
            id="google-map" 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
          
          {!GOOGLE_MAPS_API_KEY && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white p-6 rounded-xl shadow-lg">
                <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-gray-700">Google Maps</p>
                <p className="text-sm text-gray-500 mt-1">
                  Ajoutez VITE_GOOGLE_MAPS_API_KEY dans .env
                </p>
              </div>
            </div>
          )}

          {GOOGLE_MAPS_API_KEY && (
            <div className="absolute bottom-8 left-8 z-10">
              <button 
                onClick={handleGeolocate}
                className="bg-white px-4 py-2 rounded-lg shadow-md font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Navigation size={16} /> Me localiser
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchPage;
