import React, { useState } from 'react';
import { Star, MapPin, Clock, Filter, ChevronDown } from 'lucide-react';

const SearchResults = () => {
  // Simulation de données
  const salons = [
    {
      id: 1,
      name: "Atelier de Coiffure - Antoine Martin",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400",
      rating: 4.9,
      reviews: 128,
      address: "12 Rue de la Paix, 75002 Paris",
      distance: "0.8 km",
      status: "Ouvert",
      category: "Coiffeur"
    },
    {
      id: 2,
      name: "L'Instant Beauté",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400",
      rating: 4.7,
      reviews: 85,
      address: "45 Avenue des Ternes, 75017 Paris",
      distance: "1.2 km",
      status: "Ferme bientôt",
      category: "Institut de beauté"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('Coiffure');
  const [selectedPrice, setSelectedPrice] = useState(null);

  const categories = ["Coiffure", "Soin du visage", "Épilation", "Massage"];
  const prices = ["FCA", "FCFA", "FCFA"];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Barre de recherche supérieure (déjà présente sur le site) */}
      <div className="bg-white border-b border-gray-100 py-4 px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex gap-4">
          <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="font-bold text-sm">Quoi ?</span>
            <input type="text" placeholder="Coiffeur, Manucure..." className="flex-1 outline-none text-sm" />
          </div>
          <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="font-bold text-sm">Où ?</span>
            <input type="text" placeholder="Paris, Lyon..." className="flex-1 outline-none text-sm" />
          </div>
          <button className="bg-black text-white px-8 rounded-xl font-bold">Rechercher</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
        
        {/* --- FILTRES (SIDEBAR GAUCHE) --- */}
        <aside className="w-full md:w-72 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Filtres</h2>
            <button className="text-sm font-bold text-gray-400 hover:text-black">Effacer</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-8">
            {/* Filtre Catégorie */}
            <div>
              <p className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Prestation</p>
              <div className="space-y-3">
                {categories.map((item) => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 accent-black"
                      checked={selectedCategory === item}
                      onChange={() => setSelectedCategory(item === selectedCategory ? null : item)}
                    />
                    <span className="text-sm font-medium group-hover:text-black text-gray-600">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtre Prix */}
            <div>
              <p className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Prix</p>
              <div className="flex gap-2">
                {prices.map((price) => (
                  <button 
                    key={price} 
                    className={`flex-1 py-2 border rounded-lg font-bold transition-all ${
                      selectedPrice === price 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-black'
                    }`}
                    onClick={() => setSelectedPrice(price === selectedPrice ? null : price)}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- RÉSULTATS (ZONE DROITE) --- */}
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{salons.length} établissements à Paris</h1>
            <button className="flex items-center gap-2 font-bold text-sm border border-gray-200 px-4 py-2 rounded-lg bg-white">
              Trier par : Recommandé <ChevronDown size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {salons.map((salon) => (
              <div 
                key={salon.id} 
                className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow border border-gray-50 cursor-pointer group"
              >
                {/* Image */}
                <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                  <img 
                    src={salon.image} 
                    alt={salon.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Détails */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-[#48BB78] uppercase mb-1">{salon.category}</p>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        <Star size={14} className="fill-black" />
                        <span className="text-sm font-bold">{salon.rating}</span>
                        <span className="text-xs text-gray-400">({salon.reviews})</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700">{salon.name}</h3>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <MapPin size={14} /> {salon.address} • {salon.distance}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Clock size={16} className="text-gray-400" />
                      {salon.status}
                    </div>
                    <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default SearchResults;
