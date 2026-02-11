import { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';

const DAYS = [
  { value: 0, label: 'Dim', short: 'Dim' },
  { value: 1, label: 'Lun', short: 'Lun' },
  { value: 2, label: 'Mar', short: 'Mar' },
  { value: 3, label: 'Mer', short: 'Mer' },
  { value: 4, label: 'Jeu', short: 'Jeu' },
  { value: 5, label: 'Ven', short: 'Ven' },
  { value: 6, label: 'Sam', short: 'Sam' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const SalonCard = ({ salon }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loadingHours, setLoadingHours] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      console.log('SalonCard: Fetching availabilities for salon.id =', salon.id);
      try {
        const response = await fetch(`${API_BASE}/salons/${salon.id}/availabilities`);
        console.log('SalonCard: Response status =', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('SalonCard: Error data =', errorData);
          setError(errorData.error || 'Erreur lors du chargement');
          setLoadingHours(false);
          return;
        }
        
        const data = await response.json();
        console.log('SalonCard: Availabilities data =', data);
        setAvailabilities(data);
      } catch (err) {
        console.error('SalonCard: Fetch error =', err);
        setError('Erreur de connexion');
      } finally {
        setLoadingHours(false);
      }
    };

    if (salon && salon.id) {
      fetchAvailabilities();
    } else {
      console.error('SalonCard: salon or salon.id is undefined', salon);
      setLoadingHours(false);
    }
  }, [salon.id]);

  return (
    <div className="group cursor-pointer">
      <div className="h-72 overflow-hidden rounded-2xl mb-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <img
          src={salon.image || "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={salon.name}
        />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{salon.name}</h3>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-purple-600 text-sm mb-4 block underline transition-colors"
        >
          📍 {salon.address}
        </a>
        
        {/* Catégorie du salon */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
            {salon.category}
          </span>
        </div>

        {/* Erreur de chargement */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Horaires d'ouverture */}
        {!loadingHours && !error && availabilities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">🕐 Horaires:</p>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(day => {
                const avail = availabilities.find(a => a.dayOfWeek === day.value);
                return (
                  <div 
                    key={day.value}
                    className={`text-center p-2 rounded-lg text-xs ${
                      avail 
                        ? 'bg-green-100 text-green-700 font-medium' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className="font-bold">{day.short}</div>
                    {avail ? (
                      <div className="text-[10px]">{avail.startTime}<br/>{avail.endTime}</div>
                    ) : (
                      <div className="text-[10px]">Fermé</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message si aucun horaire */}
        {!loadingHours && !error && availabilities.length === 0 && (
          <div className="mb-4 p-2 bg-gray-100 text-gray-500 text-xs rounded">
            Aucun horaire configuré
          </div>
        )}

        {/* Affichage des services s'ils existent */}
        {salon.services && salon.services.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">Services disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {salon.services.slice(0, 4).map(service => (
                <ServiceCard key={service.id} service={service} salonId={salon.id} />
              ))}
              {salon.services.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{salon.services.length - 4} autres
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonCard;
