import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlanityStatsSection = () => {
  const navigate = useNavigate();

  const topStats = [
    {
      value: '+50%',
      label: "de fréquence sur les rdv pris en ligne"
    },
    {
      value: '4x',
      label: "moins d'oublis avec les rappels sms des rendez-vous"
    },
    {
      value: '50%',
      label: "des rdv en ligne pris en dehors des horaires d'ouverture"
    }
  ];

  const bottomStats = [
    {
      value: '+50 000',
      label: 'Salons & instituts'
    },
    {
      value: '5 RDV',
      label: 'Pris toutes les secondes'
    },
    {
      value: '> 5 milliards €',
      label: 'De rendez-vous vendus'
    }
  ];

  return (
    <section style={styles.heroSection}>
      {/* Surtitre avec la barre bleue */}
      <div style={styles.heroHeader}>
        <span style={styles.surtitre}>Une forte croissance</span>
        <div style={styles.barreBleue}></div>
      </div>

      {/* Titre Principal */}
      <h1 style={styles.titrePrincipal}>
        Vous êtes un professionnel de la{' '}
        <span style={styles.titreGras}>beauté ?</span> Découvrez la prise de RDV{' '}
        en ligne !
      </h1>

      {/* Container principal avec fond gris */}
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Top Stats Grid */}
          <div style={styles.statsGrid}>
            {topStats.map((stat, idx) => (
              <div 
                key={idx} 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  const btn = e.currentTarget.querySelector('.stats-pro-button');
                  if (btn) {
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const btn = e.currentTarget.querySelector('.stats-pro-button');
                  if (btn) {
                    btn.style.opacity = '0';
                    btn.style.transform = 'translateY(10px)';
                  }
                }}
              >
                <div style={styles.cardInner}>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                  <button 
                    className="stats-pro-button"
                    style={styles.proButton}
                    onClick={() => navigate('/professional')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  >
                    Je suis professionnel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stats Grid */}
          <div style={styles.statsGrid}>
            {bottomStats.map((stat, idx) => (
              <div 
                key={idx} 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  const btn = e.currentTarget.querySelector('.stats-pro-button');
                  if (btn) {
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const btn = e.currentTarget.querySelector('.stats-pro-button');
                  if (btn) {
                    btn.style.opacity = '0';
                    btn.style.transform = 'translateY(10px)';
                  }
                }}
              >
                <div style={styles.cardInner}>
                  <div style={styles.bigStatValue}>{stat.value}</div>
                  <div style={styles.bigStatLabel}>{stat.label}</div>
                  <button 
                    className="stats-pro-button"
                    style={styles.proButton}
                    onClick={() => navigate('/professional')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  >
                    Je suis professionnel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    backgroundColor: '#FFF',
    padding: '4rem 2rem 0',
    textAlign: 'center',
  },
  heroHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  surtitre: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.2em',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  barreBleue: {
    width: '48px',
    height: '2px',
    backgroundColor: '#4F46E5',
    marginTop: '0.5rem',
  },
  titrePrincipal: {
    fontSize: '2.5rem',
    fontWeight: '300',
    color: '#0F172A',
    maxWidth: '800px',
    lineHeight: '1.2',
  },
  titreGras: {
    fontWeight: '500',
  },
  container: {
    backgroundColor: '#F9FAFB',
    padding: '4rem 2rem',
    width: '100%',
    marginTop: '3rem',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0',
  },
  statCard: {
    backgroundColor: '#FFF',
    border: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1 / 0.7',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  cardInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    width: '100%',
    height: '100%',
  },
  statValue: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  statLabel: {
    fontSize: '1rem',
    color: '#6B7280',
    lineHeight: '1.5',
    maxWidth: '280px',
  },
  bigStatValue: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  bigStatLabel: {
    fontSize: '1.1rem',
    color: '#6B7280',
    fontWeight: '500',
  },
  proButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    opacity: '0',
    transform: 'translateY(10px)',
    transition: 'all 0.3s ease',
  },
};

export default PlanityStatsSection;
