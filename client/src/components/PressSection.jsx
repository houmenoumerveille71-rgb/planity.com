import React from 'react';

const PressSection = () => {
  const pressLogos = [
    { name: 'VOGUE', style: 'serif' },
    { name: 'GRAZIA', style: 'condensed' },
    { name: 'ELLE', style: 'wide' },
    { name: 'marie claire', style: 'lowercase' }
  ];

  const getLogoStyle = (style) => {
    switch (style) {
      case 'serif':
        return { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: '400', letterSpacing: '3px' };
      case 'condensed':
        return { fontFamily: "'Oswald', sans-serif", fontSize: '2.2rem', fontWeight: '300', letterSpacing: '6px' };
      case 'wide':
        return { fontFamily: "'Bodoni Moda', serif", fontSize: '2.5rem', fontWeight: '400', letterSpacing: '12px' };
      case 'lowercase':
        return { fontFamily: "'Montserrat', sans-serif", fontSize: '1.8rem', fontWeight: '400', letterSpacing: '1px', textTransform: 'lowercase' };
      default:
        return {};
    }
  };

  return (
    <div className="bg-black py-20 px-8 flex items-center justify-center">
      <div className="max-w-300 w-full text-center">
        <p className="text-sm font-bold tracking-widest text-gray-500 mb-4">PRESSE</p>
        <h2 className="text-3xl md:text-5xl font-normal text-white mb-16 font-sans">Ils parlent de nous</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {pressLogos.map((logo, idx) => (
            <LogoCard key={idx} logo={logo} getLogoStyle={getLogoStyle} />
          ))}
        </div>
      </div>
    </div>
  );
};

const LogoCard = ({ logo, getLogoStyle }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#1a1a1a';
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#000';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div 
      className="p-12 md:p-8 border border-gray-800 flex items-center justify-center min-h-40 transition-all cursor-pointer bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="text-white text-2xl font-normal tracking-wide"
        style={getLogoStyle(logo.style)}
      >
        {logo.name}
      </div>
    </div>
  );
};

export default PressSection;
