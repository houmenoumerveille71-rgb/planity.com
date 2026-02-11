import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import PressSection from './PressSection';
import PlanityStatsSection from './PlanityStatsSection';

const PlanityHomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const categories = [
    {
      title: 'Coiffeur',
      subtitle: 'Trouvez votre salon',
      description: 'Coupe, coloration et coiffure',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes']
    },
    {
      title: 'Barbier',
      subtitle: 'Barbe et rasage',
      description: 'Expertise homme',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille']
    },
    {
      title: 'Manucure',
      subtitle: 'Beauté des ongles',
      description: 'Manucure et Pédicure',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Bordeaux', 'Lille', 'Strasbourg']
    },
    {
      title: 'Institut',
      subtitle: 'Soins et bien-être',
      description: 'Épilation et soins',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Bordeaux', 'Lille']
    },
    {
      title: 'Massage',
      subtitle: 'Détente et relaxation',
      description: 'Massages & spa',
      cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux']
    }
  ];

  const otherCategories = [
    { title: 'Réflexologie', cities: ['Bordeaux', 'Strasbourg', 'Toulouse', 'Montpellier'] },
    { title: 'Esthéticienne', cities: ['Bordeaux', 'Lyon', 'Toulouse', 'Montpellier'] },
    { title: 'Hyperhidrose (Botox)', cities: ['Bordeaux', 'Lyon', 'Toulouse'] },
    { title: 'Maquillage permanent', cities: ['Bordeaux', 'Lyon', 'Toulouse', 'Montpellier', 'Nantes', 'Strasbourg'] }
  ];

  return (
    <>
      {/* Professionals Section with Carousel */}
      <section style={styles.professionalsSection}>
        <div style={styles.professionalsContent}>
          {/* Carousel Container */}
          <div style={styles.carouselContainer}>
            <button 
              style={styles.carouselButton} 
              onClick={prevImage}
              onMouseEnter={() => setIsAutoPlaying(false)}
            >
              <ChevronLeft size={24} />
            </button>

            <div style={styles.imageWrapper}>
              {carouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Professionnel ${index + 1}`}
                  style={{
                    ...styles.carouselImage,
                    opacity: index === currentImageIndex ? 1 : 0,
                    transform: index === currentImageIndex ? 'scale(1)' : 'scale(0.95)',
                  }}
                />
              ))}
            </div>

            <button 
              style={{...styles.carouselButton, right: '10px'}} 
              onClick={nextImage}
              onMouseEnter={() => setIsAutoPlaying(false)}
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div style={styles.indicators}>
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  style={{
                    ...styles.indicator,
                    backgroundColor: index === currentImageIndex ? '#6366F1' : '#D1D5DB',
                    width: index === currentImageIndex ? '30px' : '10px',
                  }}
                />
              ))}
            </div>
          </div>
          
          <div style={styles.textContent}>
            <h2 style={styles.sectionTitle}>Découvrez nos Professionnels</h2>
            <h3 style={styles.categoryTitle}>Coiffeur</h3>
            <p style={styles.description}>
              Envie de changer de tête ou simplement de rafraîchir votre coupe ? Vous avez besoin des conseils d'un expert pour sublimer votre style.
            </p>
            <p style={styles.description}>
              Quels sont les meilleurs salons de coiffure autour de chez vous ? Le portail de prises de rendez-vous Planity est votre meilleur allié.
            </p>
            <a href="#" style={styles.seeMoreLink}>Voir plus →</a>
          </div>
        </div>
      </section>

      {/* Press Section */}
      <PressSection />

      {/* Stats Section */}
      <PlanityStatsSection />

      {/* Recruitment Section */}
      <section style={styles.recruitmentSection}>
        <div style={styles.recruitmentContent}>
          
          {/* Colonne Gauche : Image */}
          <div style={styles.recruitmentImageContainer}>
            <div style={styles.recruitmentImageWrapper}>
              <img 
                src="/images/Image (10).jpeg" 
                alt="Équipe Planity" 
                style={styles.recruitmentImage}
              />
            </div>
          </div>

          {/* Colonne Droite : Contenu texte */}
          <div style={styles.recruitmentTextContent}>
            {/* Label Surtitre */}
            <div style={styles.recruitmentLabelWrapper}>
              <span style={styles.recruitmentLabel}>Professionnel</span>
              <div style={styles.recruitmentBar}></div>
            </div>

            {/* Titre */}
            <h2 style={styles.recruitmentTitle}>
              Planity recherche des profils dans toute la France pour digitaliser le secteur de la beauté
            </h2>

            {/* Signature */}
            <p style={styles.recruitmentSubtitle}>
              Antoine Puymirat - <span style={styles.recruitmentSubtitleGray}>CEO</span>
            </p>

            {/* Bouton CTA */}
            <button 
              style={styles.recruitmentButton}
              onClick={() => navigate('/careers')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
            >
              Découvrir nos offres
            </button>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section style={styles.locationsSection}>
        <div style={styles.locationsContent}>
          <p style={styles.locationsLabel}>PARTOUT EN FRANCE</p>
          <h2 style={styles.locationsTitle}>Trouvez votre établissement beauté partout en France</h2>
          
          <div style={styles.categoriesGrid}>
            {categories.map((category, idx) => (
              <div 
                key={idx} 
                style={styles.categoryCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={styles.categoryCardTitle}>{category.title}</h3>
                <p style={styles.categoryCardSubtitle}>{category.subtitle}</p>
                <p style={styles.categoryCardDescription}>{category.description}</p>
                <div style={styles.citiesList}>
                  {category.cities.map((city, cityIdx) => (
                    <a 
                      key={cityIdx} 
                      href="#" 
                      style={styles.cityLink}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.color = '#4F46E5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = '#6366F1';
                      }}
                    >
                      {city}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.otherCategoriesGrid}>
            {otherCategories.map((category, idx) => (
              <div 
                key={idx} 
                style={styles.otherCategory}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h4 style={styles.otherCategoryTitle}>{category.title}</h4>
                <div style={styles.citiesList}>
                  {category.cities.map((city, cityIdx) => (
                    <a 
                      key={cityIdx} 
                      href="#" 
                      style={styles.cityLink}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {city}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const styles = {
  // Professionals Section
  professionalsSection: {
    padding: '5rem 2rem',
    backgroundColor: '#F9FAFB',
  },
  professionalsContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },

  // Carousel Styles
  carouselContainer: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    aspectRatio: '1/1',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  indicators: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 10,
  },
  indicator: {
    height: '10px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  textContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.7',
    color: '#6B7280',
  },
  seeMoreLink: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6366F1',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  },

  // Recruitment Section
  recruitmentSection: {
    padding: '4rem 2rem',
    maxWidth: '1152px',
    margin: '0 auto',
  },
  recruitmentContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '3rem',
  },
  recruitmentImageContainer: {
    width: '50%',
  },
  recruitmentImageWrapper: {
    overflow: 'hidden',
    borderRadius: '1rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  recruitmentImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    filter: 'grayscale(100%)',
    transition: 'filter 0.5s ease',
  },
  recruitmentTextContent: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  recruitmentLabelWrapper: {
    marginBottom: '1.5rem',
  },
  recruitmentLabel: {
    fontSize: '0.625rem',
    fontWeight: '700',
    letterSpacing: '0.2em',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  recruitmentBar: {
    width: '40px',
    height: '2px',
    backgroundColor: '#4F46E5',
    marginTop: '0.25rem',
  },
  recruitmentTitle: {
    fontSize: '1.75rem',
    fontWeight: '300',
    color: '#0F172A',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
  },
  recruitmentSubtitle: {
    color: '#64748B',
    fontWeight: '500',
    marginBottom: '2.5rem',
  },
  recruitmentSubtitleGray: {
    color: '#94A3B8',
  },
  recruitmentButton: {
    padding: '1rem 2rem',
    backgroundColor: '#1a1a1a',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // Locations Section
  locationsSection: {
    padding: '5rem 2rem 5rem',
    backgroundColor: '#FFF',
  },
  locationsContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  locationsLabel: {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#6B7280',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  locationsTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '3rem',
    textAlign: 'center',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  categoryCard: {
    padding: '2rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  categoryCardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  categoryCardSubtitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: '0.5rem',
  },
  categoryCardDescription: {
    fontSize: '0.9rem',
    color: '#9CA3AF',
    marginBottom: '1.5rem',
  },
  citiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cityLink: {
    fontSize: '0.9rem',
    color: '#6366F1',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  otherCategoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  otherCategory: {
    padding: '1.5rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  otherCategoryTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
  },
};

export default PlanityHomePage;
