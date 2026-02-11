import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavbarPro = () => {
  const navigate = useNavigate();
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  const solutions = [
    { title: "Réservation en ligne 24h/24", desc: "Avec une page d'établissement dédiée." },
    { title: "Gestion de votre agenda", desc: "Votre quotidien professionnel sous contrôle." },
    { title: "Logiciel de caisse certifiée NF525", desc: "Liée au système de rendez-vous, simple et fiable." },
    { title: "Terminal de paiement", desc: "Encaissez vos clients. Encouragez les pourboires." },
    { title: "Gestion du temps de travail", desc: "Absences et congés, harmonisés avec l'agenda." },
    { title: "Solutions marketing", desc: "Promouvoir son activité. Sans publicité." },
    { title: "Pilotage de l'établissement", desc: "Stocks, ventes, résultats. Centralisés." },
    { title: "Ventes additionnelles", desc: "Cartes cadeaux, cures et boutique en ligne." },
    { title: "Site sur-mesure", desc: "Site web personnalisé et blog optimisé.", isNew: true },
  ];

  // Catégories pour le dropdown Métier
  const categories = [
    { id: 'coiffure-femme', name: 'Coiffure Femme', icon: '💇‍♀️' },
    { id: 'coiffure-homme', name: 'Coiffure Homme', icon: '💇' },
    { id: 'barbier', name: 'Barbier', icon: '🪒' },
    { id: 'manucure', name: 'Manucure', icon: '💅' },
    { id: 'estheticienne', name: 'Esthétique', icon: '✨' },
    { id: 'spa', name: 'Spa & Massage', icon: '🧖' },
  ];

  const [isMetierOpen, setIsMetierOpen] = useState(false);
  const [isRessourcesOpen, setIsRessourcesOpen] = useState(false);

  const ressources = [
    { title: "Blog", desc: "Actualités et conseils pour votre salon." },
    { title: "Avis de nos clients", desc: "Découvrez ce que'ils pensent de nous." },
    { title: "Guides pratiques", desc: "Tutos et fiches pratiques pour vous aider." },
  ];

  return (
    <nav className="relative bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <div 
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <span className="text-xl font-black tracking-tighter">PLANITY</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Pro</span>
        </div>

        {/* Liens de navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* MENU MÉTIER */}
          <div 
            className="relative"
            onMouseEnter={() => setIsMetierOpen(true)}
            onMouseLeave={() => setIsMetierOpen(false)}
          >
            <button className={`flex items-center gap-1 font-semibold transition-colors py-2 ${isMetierOpen ? 'text-black' : 'text-gray-600'} hover:text-black`}>
              Métier <ChevronDown size={16} className={`transition-transform ${isMetierOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMetierOpen && (
              <div className="absolute top-full left-0 mt-0 w-150 bg-[#F9F9F9] shadow-2xl rounded-b-3xl p-8 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-3 gap-6">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-[15px] text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {cat.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MENU SOLUTIONS */}
          <div 
            className="relative"
            onMouseEnter={() => setIsSolutionsOpen(true)}
            onMouseLeave={() => setIsSolutionsOpen(false)}
          >
            <button className={`flex items-center gap-1 font-semibold transition-colors py-2 ${isSolutionsOpen ? 'text-black border-b-2 border-black' : 'text-gray-600'} hover:text-black`}>
              Solutions <ChevronDown size={16} className={`transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSolutionsOpen && (
              <div className="absolute top-full -left-37.5 w-200 bg-[#F9F9F9] shadow-2xl rounded-b-3xl p-10 grid grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
                {solutions.map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.isNew && (
                        <span className="bg-[#1A1A1A] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Nouveau</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MENU RESSOURCES */}
          <div 
            className="relative"
            onMouseEnter={() => setIsRessourcesOpen(true)}
            onMouseLeave={() => setIsRessourcesOpen(false)}
          >
            <button className={`flex items-center gap-1 font-semibold transition-colors py-2 ${isRessourcesOpen ? 'text-black border-b-2 border-black' : 'text-gray-600'} hover:text-black`}>
              Ressources <ChevronDown size={16} className={`transition-transform ${isRessourcesOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRessourcesOpen && (
              <div className="absolute top-full -left-25 w-100 bg-[#F9F9F9] shadow-2xl rounded-b-3xl p-8 animate-in fade-in slide-in-from-top-2 duration-200">
                {ressources.map((item, index) => (
                  <div key={index} className="group cursor-pointer py-3 border-b border-gray-200 last:border-0">
                    <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="font-semibold text-gray-600 hover:text-black transition-colors">
            Tarifs
          </button>
        </div>
      </div>

      {/* Boutons Droite */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/pro-login')}
          className="text-sm font-bold text-gray-700 hover:text-black"
        >
          Se connecter
        </button>
        <button 
          onClick={() => navigate('/pro-landing')}
          className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black shadow-lg transition-all"
        >
          Demander une démo
        </button>
      </div>
    </nav>
  );
};

export default NavbarPro;
