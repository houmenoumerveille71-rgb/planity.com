import React from 'react';

const PressSection = () => {
  const pressLogos = [
    { name: 'VOGUE', style: 'serif' },
    { name: 'GRAZIA', style: 'condensed' },
    { name: 'ELLE', style: 'wide' },
    { name: 'marie claire', style: 'lowercase' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <p style={styles.label}>PRESSE</p>
        <h2 style={styles.title}>Ils parlent de nous</h2>
        
        <div style={styles.logosGrid}>
          {pressLogos.map((logo, idx) => (
            <div 
              key={idx} 
              style={styles.logoCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{
                ...styles.logoText,
                ...(logo.style === 'serif' && styles.logoSerif),
                ...(logo.style === 'condensed' && styles.logoCondensed),
                ...(logo.style === 'wide' && styles.logoWide),
                ...(logo.style === 'lowercase' && styles.logoLowercase)
              }}>
                {logo.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#000',
    padding: '5rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '1200px',
    width: '100%',
    textAlign: 'center',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '2px',
    color: '#888',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '400',
    color: '#FFF',
    marginBottom: '4rem',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  logosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0',
    '@media (max-width: 968px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  logoCard: {
    padding: '3rem 2rem',
    border: '1px solid #222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '160px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#000',
  },
  logoText: {
    color: '#FFF',
    fontSize: '2rem',
    fontWeight: '400',
    letterSpacing: '0.5px',
  },
  logoSerif: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.5rem',
    fontWeight: '400',
    letterSpacing: '3px',
  },
  logoCondensed: {
    fontFamily: "'Oswald', sans-serif",
    fontSize: '2.2rem',
    fontWeight: '300',
    letterSpacing: '6px',
  },
  logoWide: {
    fontFamily: "'Bodoni Moda', serif",
    fontSize: '2.5rem',
    fontWeight: '400',
    letterSpacing: '12px',
  },
  logoLowercase: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '1.8rem',
    fontWeight: '400',
    letterSpacing: '1px',
    textTransform: 'lowercase',
  },
};

export default PressSection;
