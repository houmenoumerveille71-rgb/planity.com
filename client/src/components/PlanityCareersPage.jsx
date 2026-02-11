import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const PlanityCareersPage = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const values = [
    {
      icon: '💜',
      title: 'Culture de l\'excellence',
      description: 'Nous visons l\'excellence dans tout ce que nous faisons, avec passion et rigueur.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'Nous encourageons la créativité et l\'innovation pour transformer le secteur de la beauté.'
    },
    {
      icon: '🤝',
      title: 'Esprit d\'équipe',
      description: 'La collaboration est au cœur de notre réussite collective et individuelle.'
    },
    {
      icon: '🎯',
      title: 'Esprit entrepreneurial',
      description: 'Nous valorisons l\'initiative et encourageons chacun à prendre des responsabilités.'
    }
  ];

  const benefits = [
    {
      icon: '🏠',
      title: 'Carte Swile',
      description: 'Une carte restaurant avec 60% pris en charge par Planity et des avantages exclusifs pour vos repas.'
    },
    {
      icon: '🏖️',
      title: 'Mutuelle Alan',
      description: 'Une mutuelle santé de qualité prise en charge à 100% par Planity pour vous et votre famille.'
    },
    {
      icon: '💻',
      title: 'Équipement professionnel',
      description: 'Tout le matériel dont vous avez besoin pour travailler dans les meilleures conditions.'
    }
  ];

  const jobs = [
    {
      title: 'Sales Development Lead',
      location: 'Paris, France',
      type: 'CDI'
    },
    {
      title: 'Développeur Full Stack (React + Ruby)',
      location: 'Paris, France',
      type: 'CDI'
    }
  ];

  const faqs = [
    { question: "Qu'est-ce qui rend la culture Planity unique ?", answer: "Notre culture repose sur l'excellence, l'innovation et l'esprit d'équipe..." },
    { question: "Y a-t-il des opportunités de développement professionnel ?", answer: "Oui, nous investissons dans la formation continue..." },
    { question: "Quels sont les avantages de travailler chez Planity ?", answer: "Nous offrons de nombreux avantages..." },
    { question: "Comment se déroule le processus de recrutement ?", answer: "Le processus comprend plusieurs étapes..." },
    { question: "Planity propose-t-il du télétravail ?", answer: "Oui, nous offrons une flexibilité..." },
    { question: "Des formations sont-elles proposées en interne ou externalisées ?", answer: "Nous proposons les deux..." },
    { question: "Y a-t-il des événements d'équipe réguliers ?", answer: "Oui, nous organisons régulièrement..." },
    { question: "Quels sont les avantages liés au transport ?", answer: "Nous prenons en charge 50%..." },
    { question: "Quels sont les critères d'éligibilité pour l'Alan ?", answer: "Tous nos employés en CDI..." },
    { question: "Y a-t-il un programme de parrainage ?", answer: "Oui, nous avons un programme..." }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section with Video Background */}
      <div style={styles.hero}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={styles.heroVideo}
        >
          <source src="/videos/MicrosoftTeams-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.logoSmall}>PLANITY</div>
            <h1 style={styles.heroTitle}>Bienvenue chez Planity</h1>
            <p style={styles.heroSubtitle}>Rejoignez une équipe passionnée qui transforme le secteur de la beauté</p>
            <div style={styles.scrollIndicator}>↓</div>
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div style={styles.section}>
        <div style={styles.sectionContent}>
          <div style={styles.textImageGrid}>
            <div style={styles.textBlock}>
              <h2 style={styles.sectionTitle}>Ce que nous faisons</h2>
              <p style={styles.paragraph}>
                Planity est la plateforme n°1 qui a complètement révolutionné la réservation en ligne dans le secteur de la beauté.
              </p>
              <p style={styles.paragraph}>
                Notre mission est de simplifier la vie des professionnels de la beauté et de leurs clients en proposant une solution innovante, simple et accessible 24h/24.
              </p>
              <p style={styles.paragraph}>
                Avec plus de 50 000 établissements partenaires et des millions de rendez-vous pris chaque année, nous continuons à grandir et à innover chaque jour.
              </p>
            </div>
            <div style={styles.imageBlock}>
              <img src="/images/Image (10).jpeg" alt="Team" style={styles.image} />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div style={styles.sectionGray}>
        <div style={styles.sectionContent}>
          <div style={styles.centerText}>
            <h2 style={styles.sectionTitle}>Notre mission</h2>
            <p style={styles.paragraphCenter}>
              Nous croyons profondément que personne ne doit se priver de moments de bien-être et de beauté.
            </p>
            <p style={styles.paragraphCenter}>
              Notre ambition est de rendre ces services accessibles à tous, partout et à tout moment. Nous travaillons chaque jour pour simplifier la réservation, optimiser la gestion des établissements et offrir une expérience client exceptionnelle.
            </p>
            <p style={styles.quote}>
              "Notre objectif : démocratiser l'accès à la beauté et au bien-être."
            </p>
            <button style={styles.buttonPrimary}>Découvrir nos valeurs</button>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitleCenter}>Nos valeurs</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, idx) => (
              <div key={idx} style={styles.valueCard}>
                <div style={styles.valueIcon}>{value.icon}</div>
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueDescription}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={styles.sectionGray}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitleCenter}>Nos avantages</h2>
          <div style={styles.benefitsGrid}>
            {benefits.map((benefit, idx) => (
              <div key={idx} style={styles.benefitCard}>
                <div style={styles.benefitIcon}>{benefit.icon}</div>
                <h3 style={styles.benefitTitle}>{benefit.title}</h3>
                <p style={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div style={styles.section}>
        <div style={styles.sectionContent}>
          <div style={styles.centerText}>
            <h2 style={styles.sectionTitle}>Pourquoi nous rejoindre ?</h2>
            <p style={styles.paragraphCenter}>
              Rejoindre Planity, c'est intégrer une équipe ambitieuse, créative et passionnée qui révolutionne un secteur entier.
            </p>
            <p style={styles.paragraphCenter}>
              Nous recherchons des personnes talentueuses, motivées et prêtes à relever des défis pour continuer à grandir ensemble.
            </p>
            <p style={styles.paragraphCenter}>
              Que tu sois développeur, commercial, designer ou expert marketing, il y a une place pour toi chez Planity si tu partages notre vision et nos valeurs.
            </p>
            <button style={styles.buttonPrimary}>Consulter nos offres</button>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div style={styles.sectionGray}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitleCenter}>Nos offres d'emploi</h2>
          <div style={styles.jobsList}>
            {jobs.map((job, idx) => (
              <div key={idx} style={styles.jobCard}>
                <div style={styles.jobInfo}>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <div style={styles.jobMeta}>
                    <MapPin size={16} />
                    <span>{job.location}</span>
                    <span style={styles.jobDot}>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <button style={styles.jobButton}>Postuler</button>
              </div>
            ))}
          </div>
          <div style={styles.centerButton}>
            <button style={styles.buttonSecondary}>Voir toutes les offres</button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div style={styles.mapSection}>
        <div style={styles.mapPlaceholder}>
          <div style={styles.mapMarker}>📍</div>
          <p style={styles.mapText}>Paris, France</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitleCenter}>FAQ</h2>
          <div style={styles.faqList}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={styles.faqItem}>
                <button
                  style={styles.faqQuestion}
                  onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      ...styles.faqIcon,
                      transform: activeFAQ === idx ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
                {activeFAQ === idx && (
                  <div style={styles.faqAnswer}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: '#FFF',
  },

  // Hero Section
  hero: {
    position: 'relative',
    height: '600px',
    overflow: 'hidden',
  },
  heroVideo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '100%',
    minHeight: '100%',
    width: 'auto',
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    objectFit: 'cover',
    zIndex: 1,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroContent: {
    textAlign: 'center',
    color: '#FFF',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 3,
  },
  logoSmall: {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '3px',
    marginBottom: '2rem',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    fontWeight: '300',
    maxWidth: '600px',
    margin: '0 auto',
  },
  scrollIndicator: {
    fontSize: '2rem',
    marginTop: '3rem',
    opacity: 0.7,
  },

  // Sections
  section: {
    padding: '5rem 2rem',
    backgroundColor: '#FFF',
  },
  sectionGray: {
    padding: '5rem 2rem',
    backgroundColor: '#F9FAFB',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: '#111827',
  },
  sectionTitleCenter: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '3rem',
    color: '#111827',
    textAlign: 'center',
  },

  // Text & Image Grid
  textImageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'center',
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  imageBlock: {
    borderRadius: '12px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  paragraph: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#6B7280',
  },

  // Center Text
  centerText: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  paragraphCenter: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#6B7280',
    marginBottom: '1.5rem',
  },
  quote: {
    fontSize: '1.5rem',
    fontStyle: 'italic',
    color: '#111827',
    margin: '2rem 0',
    fontWeight: '500',
  },

  // Buttons
  buttonPrimary: {
    padding: '1rem 2.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  buttonSecondary: {
    padding: '1rem 2.5rem',
    backgroundColor: '#FFF',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // Values
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
  },
  valueCard: {
    textAlign: 'center',
  },
  valueIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  valueTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#111827',
  },
  valueDescription: {
    fontSize: '0.95rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },

  // Benefits
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  benefitCard: {
    backgroundColor: '#FFF',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  benefitIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  benefitTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#111827',
  },
  benefitDescription: {
    fontSize: '0.95rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },

  // Jobs
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  },
  jobCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: '#FFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#111827',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6B7280',
  },
  jobDot: {
    color: '#D1D5DB',
  },
  jobButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  centerButton: {
    textAlign: 'center',
  },

  // Map
  mapSection: {
    padding: '0 2rem 4rem',
  },
  mapPlaceholder: {
    height: '400px',
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'linear-gradient(45deg, #E5E7EB 25%, transparent 25%), linear-gradient(-45deg, #E5E7EB 25%, transparent 25%)',
    backgroundSize: '20px 20px',
  },
  mapMarker: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  mapText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#6B7280',
  },

  // FAQ
  faqList: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  faqItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
  },
  faqQuestion: {
    width: '100%',
    padding: '1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqIcon: {
    color: '#6B7280',
    transition: 'transform 0.3s',
  },
  faqAnswer: {
    padding: '0 1.5rem 1.5rem',
    fontSize: '0.95rem',
    color: '#6B7280',
    lineHeight: '1.6',
  },
};

export default PlanityCareersPage;
