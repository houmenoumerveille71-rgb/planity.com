import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Liste des catégories de salons
const CATEGORIES = [
  { id: '', name: 'Toutes les catégories' },
  { id: 'coiffeur', name: 'Coiffeur' },
  { id: 'barbier', name: 'Barbier' },
  { id: 'manucure', name: 'Manucure' },
  { id: 'institut-beaute', name: 'Institut de beauté' },
  { id: 'bien-etre', name: 'Bien-être' },
  { id: 'ongles', name: 'Ongles' },
  { id: 'maquillage', name: 'Maquillage' },
  { id: 'esthetique', name: 'Esthétique' },
];

const Hero = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch location suggestions from Nominatim (OpenStreetMap) - Fallback sans API Key
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ci`
      );
      const data = await response.json();
      
      const suggestions = data.map(item => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
      
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      setLocationSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced address search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Only use Google if API is loaded, otherwise use Nominatim
      if (window.google && window.google.maps && window.google.maps.places) {
        // Google Places is available, let Google handle it
      } else {
        fetchLocationSuggestions(location);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [location]);

  // Initialize Google Places Autocomplete if available
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ci' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setLocation(place.formatted_address || place.name);
          setShowLocationSuggestions(false);
          
          const coords = place.geometry.location;
          setUserLat(coords.lat());
          setUserLng(coords.lng());
        }
      });
    }
  }, []);

  // Get user's current location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLat(latitude);
          setUserLng(longitude);
          setLocation('Ma position actuelle');
          setShowLocationSuggestions(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Veuillez sélectionner une adresse manuellement.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setLocation(suggestion.address);
    setUserLat(suggestion.lat);
    setUserLng(suggestion.lon);
    setShowLocationSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    console.log('handleSearch called with:', { category, location, userLat, userLng });
    const params = new URLSearchParams();
    if (category) params.set('service', category);
    if (location) params.set('ville', location);
    if (userLat) params.set('lat', userLat.toString());
    if (userLng) params.set('lng', userLng.toString());
    
    console.log('Navigating to:', `/search?${params.toString()}`);
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative -mt-18 pt-18 min-h-screen w-full flex flex-col items-center justify-center">
      {/* Background Image avec Overlay sombre léger */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/Image (8).jpeg" 
          alt="Beauty Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Titres */}
      <div className="relative z-10 text-center text-white mb-8 px-4">
        <h2 className="text-3xl md:text-5xl font-semibold mb-4 drop-shadow-md">Réservez en beauté</h2>
        <p className="text-sm md:text-lg font-light opacity-90 italic">Simple • Immédiat • 24h/24</p>
      </div>

      {/* Barre de recherche (Floating Search Bar) */}
      <div className="relative z-10 w-full max-w-5xl px-4">
        <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row items-center p-1.5 overflow-hidden">
          
          {/* Select Catégorie */}
          <div className="flex items-center flex-1 w-full px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full outline-none text-sm md:text-[15px] text-gray-700 bg-transparent cursor-pointer appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Localisation avec autocomplétion */}
          <div className="flex items-center flex-1 w-full px-4 py-3 relative" ref={suggestionsRef}>
            <input 
              ref={locationInputRef}
              type="text"
              placeholder="Adresse, ville..." 
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => location && setShowLocationSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full outline-none text-sm md:text-[15px] placeholder:text-gray-400"
              autoComplete="off"
            />
            
            {/* Bouton Ma position */}
            <button
              onClick={handleUseMyLocation}
              className="ml-2 text-gray-400 hover:text-purple-600 transition-colors"
              title="Utiliser ma position actuelle"
            >
              <MapPin size={18} />
            </button>
            
            {/* Suggestions dropdown */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                      <div className="text-sm text-gray-700 truncate">{suggestion.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading indicator */}
            {loadingSuggestions && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Bouton Rechercher */}
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto bg-black text-white px-10 py-4 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
