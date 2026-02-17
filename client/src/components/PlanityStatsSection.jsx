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
      value: '> 5 milliards FCFA',
      label: 'De rendez-vous vendus'
    }
  ];

  return (
    <section className="flex flex-col items-center justify-center min-h-50 bg-white py-16 px-8 text-center">
      {/* Surtitre avec la barre bleue */}
      <div className="flex flex-col items-center mb-6">
        <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Une forte croissance</span>
        <div className="w-12 h-0.5 bg-indigo-600 mt-2"></div>
      </div>

      {/* Titre Principal */}
      <h1 className="text-4xl md:text-2xl font-light text-slate-900 max-w-200 leading-tight">
        Vous êtes un professionnel de la{' '}
        <span className="font-medium">beauté ?</span> Découvrez la prise de RDV{' '}
        en ligne !
      </h1>

      {/* Container principal avec fond gris */}
      <div className="bg-gray-50 py-16 px-8 w-full mt-12">
        <div className="max-w-350 mx-auto flex flex-col gap-0">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {topStats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} navigate={navigate} isLarge={false} />
            ))}
          </div>

          {/* Bottom Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {bottomStats.map((stat, idx) => (
              <StatCard key={idx} stat={stat} navigate={navigate} isLarge={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, navigate, isLarge }) => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#F9FAFB';
    e.currentTarget.style.transform = 'translateY(-4px)';
    const btn = e.currentTarget.querySelector('.stats-pro-button');
    if (btn) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#FFF';
    e.currentTarget.style.transform = 'translateY(0)';
    const btn = e.currentTarget.querySelector('.stats-pro-button');
    if (btn) {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(10px)';
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 flex items-center justify-center aspect-[1/0.7] transition-all duration-300 cursor-pointer relative hover:bg-gray-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-6 w-full h-full">
        <div className={`font-bold text-gray-900 mb-2 font-sans ${isLarge ? 'text-5xl md:text-4xl' : 'text-5xl md:text-3xl'}`}>
          {stat.value}
        </div>
        <div className={`text-gray-500 ${isLarge ? 'text-lg md:text-base font-medium' : 'text-base md:text-sm'} max-w-70 leading-relaxed`}>
          {stat.label}
        </div>
        <button 
          className="stats-pro-button mt-4 py-3 px-6 bg-black text-white border-none rounded-lg text-sm font-semibold cursor-pointer opacity-0 translate-y-2.5 transition-all duration-300 hover:bg-gray-800"
          onClick={() => navigate('/professional')}
        >
          Je suis professionnel
        </button>
      </div>
    </div>
  );
};

export default PlanityStatsSection;
