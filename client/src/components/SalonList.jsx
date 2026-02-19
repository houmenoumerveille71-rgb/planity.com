import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import Nav from './Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DAYS = [
  { value: 0, label: 'Dim', short: 'Dim' },
  { value: 1, label: 'Lun', short: 'Lun' },
  { value: 2, label: 'Mar', short: 'Mar' },
  { value: 3, label: 'Mer', short: 'Mer' },
  { value: 4, label: 'Jeu', short: 'Jeu' },
  { value: 5, label: 'Ven', short: 'Ven' },
  { value: 6, label: 'Sam', short: 'Sam' },
];

// Obtenir les dates de la semaine en cours (du Dimanche au Samedi)
const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 0 : dayOfWeek; // Nombre de jours depuis le Dimanche
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - diff);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    weekDates.push(date);
  }
  return weekDates;
};

const SalonList = () => {
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchService, setSearchService] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [allCategories, setAllCategories] = useState(['Tous']);
  const [allCities, setAllCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [salonAvailabilities, setSalonAvailabilities] = useState({});
  const [weekDates] = useState(getWeekDates());
  const cityInputRef = useRef(null);

  // Charger les disponibilités pour chaque salon
  const loadAvailabilities = async () => {
    const availabilitiesCache = {};
    
    for (const salon of filteredSalons) {
      try {
        const response = await fetch(`${API_BASE}/salons/${salon.id}/availabilities`);
        if (response.ok) {
          const data = await response.json();
          availabilitiesCache[salon.id] = data;
        }
      } catch (err) {
        console.error('Erreur chargement horaires:', err);
      }
    }
    setSalonAvailabilities(availabilitiesCache);
  };

  useEffect(() => {
    // Récupération des salons depuis ton API
    fetch(`${API_BASE}/salons`)
      .then((res) => res.json())
      .then((data) => {
        setSalons(data);
        setFilteredSalons(data);
        
        // Extraire toutes les catégories uniques
        const categories = new Set(['Tous']);
        data.forEach(salon => {
          if (salon.category) {
            categories.add(salon.category);
          }
        });
        setAllCategories(Array.from(categories).sort());
        
        // Extraire toutes les villes uniques depuis les adresses avec coordonnées
        const cities = new Map();
        data.forEach(salon => {
          if (salon.address) {
            // Extraire la ville de l'adresse (premier mot après le code postal ou premier mot)
            const addressParts = salon.address.split(',');
            const city = addressParts[addressParts.length - 1]?.trim() || addressParts[0]?.trim();
            if (city && !cities.has(city)) {
              cities.set(city, {
                name: city,
                lat: salon.latitude || null,
                lng: salon.longitude || null
              });
            }
          }
        });
        setAllCities(Array.from(cities.values()).sort((a, b) => a.name.localeCompare(b.name)));
        
        setLoading(false);
        
        // Charger les disponibilités après avoir chargé les salons
        loadAvailabilities();
      })
      .catch((err) => {
        console.error("Erreur chargement salons:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filtrer les salons en fonction de la recherche et de la catégorie
    let filtered = salons;

    // Filtrer par catégorie
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(salon => 
        salon.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtrer par service
    if (searchService) {
      filtered = filtered.filter(salon =>
        salon.name?.toLowerCase().includes(searchService.toLowerCase()) ||
        salon.services?.some(service => 
          service.name?.toLowerCase().includes(searchService.toLowerCase())
        )
      );
    }

    // Filtrer par localisation
    if (searchLocation) {
      filtered = filtered.filter(salon =>
        salon.address?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    setFilteredSalons(filtered);
  }, [searchService, searchLocation, selectedCategory, salons]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Si les champs de recherche sont vides, afficher tous les salons
    if (!searchService && !searchLocation) {
      setFilteredSalons(salons);
      return;
    }

    // Utiliser l'API de recherche
    try {
      const params = new URLSearchParams();
      if (searchService) params.set('service', searchService);
      if (searchLocation) params.set('location', searchLocation);
      
      const response = await fetch(`${API_BASE}/salons/search?${params.toString()}`);
      const data = await response.json();
      setFilteredSalons(data);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      // En cas d'erreur, utiliser le filtrage local
      let filtered = salons;
      if (searchService) {
        filtered = filtered.filter(salon =>
          salon.name?.toLowerCase().includes(searchService.toLowerCase()) ||
          salon.services?.some(service => 
            service.name?.toLowerCase().includes(searchService.toLowerCase())
          )
        );
      }
      if (searchLocation) {
        filtered = filtered.filter(salon =>
          salon.address?.toLowerCase().includes(searchLocation.toLowerCase())
        );
      }
      setFilteredSalons(filtered);
    }
  };

  const handleCitySelect = (city) => {
    setSearchLocation(city.name);
    setShowCitySuggestions(false);
  };



  if (loading) return <div className="text-center p-10">Chargement des salons...</div>;

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec barre de recherche */}
      <div 
        className="bg-cover bg-center bg-no-repeat text-white py-16 px-4 relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(88, 28, 135, 0.85), rgba(157, 23, 77, 0.85)), url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Trouvez votre salon de beauté idéal
          </h1>
          <p className="text-center text-purple-200 mb-8">
            Réservez en ligne chez les meilleurs professionnels
          </p>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-gray-600 text-sm font-medium mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <label className="block text-gray-600 text-sm font-medium mb-2">Ville</label>
                <input
                  ref={cityInputRef}
                  type="text"
                  placeholder="Ex: Paris, Lyon, Marseille..."
                  value={searchLocation}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setShowCitySuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowCitySuggestions(searchLocation.length > 0)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
                {showCitySuggestions && searchLocation.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {allCities
                      .filter(city => city.name.toLowerCase().includes(searchLocation.toLowerCase()))
                      .slice(0, 5)
                      .map((city) => (
                        <div
                          key={city.name}
                          onClick={() => handleCitySelect(city)}
                          className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-gray-900"
                        >
                          {city.name}
                        </div>
                      ))}
                    {allCities.filter(city => city.name.toLowerCase().includes(searchLocation.toLowerCase())).length === 0 && (
                      <div className="px-4 py-2 text-gray-500">
                        Aucune ville trouvée
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-purple-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Liste des salons */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'Tous' ? 'Nos Salons Partenaires' : `Salons ${selectedCategory}`}
            <span className="text-gray-500 text-lg font-normal ml-2">({filteredSalons.length})</span>
          </h2>
        </div>

        {filteredSalons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun salon trouvé pour votre recherche.</p>
            <button
              onClick={() => {
                setSearchService('');
                setSearchLocation('');
                setSelectedCategory('Tous');
              }}
              className="mt-4 text-purple-900 font-bold hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <div key={salon.id} className="group cursor-pointer">
                <div className="h-72 overflow-hidden rounded-2xl mb-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  {salon.image ? (
                    <img
                      src={salon.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={salon.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{salon.name}</h3>
                  
                  {/* Adresse cliquable vers Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-600 text-sm mb-4 block underline transition-colors"
                  >
                    📍 {salon.address}
                  </a>
                  
                  {/* Horaires d'ouverture */}
                  {salonAvailabilities[salon.id] && salonAvailabilities[salon.id].length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">🕐 Horaires:</p>
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day, index) => {
                          const date = weekDates[index];
                          const avail = salonAvailabilities[salon.id].find(a => a.dayOfWeek === day.value);
                          return (
                            <div 
                              key={day.value}
                              className={`text-center p-2 rounded-lg text-xs ${
                                avail 
                                  ? 'bg-green-100 text-green-700 font-medium' 
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <div className="font-bold">
                                {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                              </div>
                              {avail ? (
                                <>
                                  <div className="text-[10px]">Matin</div>
                                  <div className="font-bold">{avail.startTime}</div>
                                  <div className="text-[10px]">Après-midi</div>
                                  <div className="font-bold">{avail.endTime}</div>
                                </>
                              ) : (
                                <div className="text-[10px]">Fermé</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Bouton Plus d'informations */}
                  <Link 
                    to={`/salon/${salon.id}`}
                    className="block text-center bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium mb-4"
                  >
                    Plus d'informations
                  </Link>
                  
                  <Link 
                    to={`/salon/${salon.id}`}
                    className="block text-center bg-pink-900 text-white py-2 rounded hover:bg-pink-600 transition-colors"
                  >
                    Prendre rendez-vous
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SalonList;
