import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import PressSection from './PressSection';
import PlanityStatsSection from './PlanityStatsSection';

const PlanityHomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Images pour le carousel
  const carouselImages = [
    '/images/Image (1).jpeg',
    '/images/Image (2).jpeg',
    '/images/Image (3).jpeg',
    '/images/Image (4).jpeg',
    '/images/Image (5).jpeg'
  ];

  // Auto-play du carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const commonCities = ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Abomey', 'Calavi', 'Ouidah', 'Lokossa', 'Kandi'];

  const categories = [
    {
      title: 'Coiffeur',
      subtitle: 'Trouvez votre salon',
      description: 'Coupe, coloration et coiffure',
      cities: commonCities
    },
    {
      title: 'Barbier',
      subtitle: 'Barbe et rasage',
      description: 'Expertise homme',
      cities: commonCities
    },
    {
      title: 'Manucure',
      subtitle: 'Beauté des ongles',
      description: 'Manucure et Pédicure',
      cities: commonCities
    },
    {
      title: 'Institut',
      subtitle: 'Soins et bien-être',
      description: 'Épilation et soins',
      cities: commonCities
    }
  ];

  const otherCategories = [
    { title: 'Réflexologie', cities: commonCities },
    { title: 'Esthéticienne', cities: commonCities },
    { title: 'Maquillage permanent', cities: commonCities },
    { title: 'Massage', cities: commonCities }
  ];

  return (
    <>
      {/* Professionals Section with Carousel */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center text-center md:text-left">
          {/* Carousel Container */}
          <div className="relative rounded-2xl overflow-hidden aspect-square shadow-xl">
            <button 
              className="absolute top-1/2 left-2.5 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center transition-all shadow-lg hover:bg-white"
              onClick={prevImage}
              onMouseEnter={() => setIsAutoPlaying(false)}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="relative w-full h-full">
              {carouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Professionnel ${index + 1}`}
                  className={`absolute w-full h-full object-cover transition-all duration-800 ${
                    index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out' }}
                />
              ))}
            </div>

            <button 
              className="absolute top-1/2 right-2.5 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 border-none cursor-pointer flex items-center justify-center transition-all shadow-lg hover:bg-white"
              onClick={nextImage}
              onMouseEnter={() => setIsAutoPlaying(false)}
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`h-2.5 rounded-full border-none cursor-pointer transition-all ${
                    index === currentImageIndex ? 'w-8 bg-indigo-500' : 'w-2.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Découvrez nos Professionnels</h2>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Coiffeur</h3>
            <p className="text-base md:text-lg leading-relaxed text-gray-500">
              Envie de changer de tête ou simplement de rafraîchir votre coupe ? Vous avez besoin des conseils d'un expert pour sublimer votre style.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-gray-500">
              Quels sont les meilleurs salons de coiffure autour de chez vous ? Le portail de prises de rendez-vous Planity est votre meilleur allié.
            </p>
            <a href="#" className="text-base font-semibold text-indigo-500 no-underline transition-all hover:text-indigo-600">Voir plus →</a>
          </div>
        </div>
      </section>

      {/* Press Section */}
      <PressSection />

      {/* Stats Section */}
      <PlanityStatsSection />

      {/* Recruitment Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          {/* Colonne Gauche : Image */}
          <div className="w-full md:w-1/2">
            <div className="overflow-hidden rounded-xl shadow-xl">
              <img 
                src="/images/Image (10).jpeg" 
                alt="Équipe Planity" 
                className="w-full h-auto object-cover grayscale transition-all duration-500 hover:grayscale-0"
              />
            </div>
          </div>

          {/* Colonne Droite : Contenu texte */}
          <div className="w-full md:w-1/2 flex flex-col items-start">
            {/* Label Surtitre */}
            <div className="mb-6">
              <span className="text-[0.625rem] font-bold tracking-widest text-slate-500 uppercase">Professionnel</span>
              <div className="w-10 h-0.5 bg-indigo-600 mt-1"></div>
            </div>

            {/* Titre */}
            <h2 className="text-xl md:text-3xl font-light text-slate-900 leading-tight mb-6">
              Planity recherche des profils dans tout le Bénin pour digitaliser le secteur de la beauté
            </h2>

            {/* Signature */}
            <p className="text-slate-500 font-medium mb-10">
              Antoine Puymirat - <span className="text-slate-400">CEO</span>
            </p>

            {/* Bouton CTA */}
            <button 
              className="py-4 px-8 bg-[#1a1a1a] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-slate-700"
              onClick={() => navigate('/careers')}
            >
              Découvrir nos offres
            </button>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-300 mx-auto">
          <p className="text-sm font-bold tracking-wider text-gray-500 mb-4 text-center">PARTOUT AU BÉNIN</p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Trouvez votre établissement beauté partout au Bénin</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {categories.map((category, idx) => (
              <CategoryCard key={idx} category={category} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {otherCategories.map((category, idx) => (
              <OtherCategoryCard key={idx} category={category} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const CategoryCard = ({ category }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div 
      className="p-8 md:p-6 bg-gray-50 rounded-xl transition-all cursor-pointer min-h-70 md:min-h-80"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{category.title}</h3>
      <p className="text-sm md:text-base font-semibold text-gray-500 mb-2">{category.subtitle}</p>
      <p className="text-xs md:text-sm text-gray-400 mb-6">{category.description}</p>
      <div className="flex flex-col gap-2">
        {category.cities.map((city, cityIdx) => (
          <a 
            key={cityIdx} 
            href={`/search?category=${encodeURIComponent(category.title)}&city=${encodeURIComponent(city)}`} 
            className="text-sm text-indigo-500 no-underline transition-all hover:underline hover:text-indigo-600"
          >
            {city}
          </a>
        ))}
      </div>
    </div>
  );
};

const OtherCategoryCard = ({ category }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#FFF';
    e.currentTarget.style.transform = 'translateY(-3px)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#F9FAFB';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <div 
      className="p-6 md:p-4 bg-gray-50 rounded-lg transition-all cursor-pointer min-h-37.5 md:min-h-45"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">{category.title}</h4>
      <div className="flex flex-col gap-2">
        {category.cities.map((city, cityIdx) => (
          <a 
            key={cityIdx} 
            href={`/search?category=${encodeURIComponent(category.title)}&city=${encodeURIComponent(city)}`} 
            className="text-sm text-indigo-500 no-underline transition-all hover:underline"
          >
            {city}
          </a>
        ))}
      </div>
    </div>
  );
};

export default PlanityHomePage;
