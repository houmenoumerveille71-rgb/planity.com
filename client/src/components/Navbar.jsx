import React from 'react';
import { User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, isProfessionalUser } from '../AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Check if we're on the home page (with hero section)
  const isHomePage = location.pathname === '/';

  // Categories color based on page (white on home, gray on other pages)
  const categoriesColor = isHomePage ? 'text-white/90' : 'text-gray-600';
  const categoriesHover = isHomePage ? 'hover:text-white' : 'hover:text-black';
  
  // Logo color based on page
  const logoColor = isHomePage ? 'text-white' : 'text-black';
  
  // Button styles for professional and appointments
  const secondaryButtonBg = isHomePage ? 'bg-white/20' : 'bg-gray-100';
  const secondaryButtonHoverBg = isHomePage ? 'hover:bg-white/30' : 'hover:bg-gray-200';
  const secondaryButtonText = isHomePage ? 'text-white' : 'text-gray-800';
  const secondaryButtonBorder = isHomePage ? 'border-white/30' : 'border-gray-200';

  const handleAccountClick = () => {
    if (user) {
      if (isProfessionalUser(user)) {
        navigate('/professional/dashboard');
      } else {
        navigate('/account');
      }
    } else {
      navigate('/login');
    }
  };



  return (
    <nav className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 bg-transparent py-3 px-6 flex items-center justify-between`}>
      {/* Logo Section */}
      <div className="flex items-center gap-8">
        <h1 className={`text-2xl font-bold tracking-tighter cursor-pointer ${logoColor}`} onClick={() => navigate('/')}>
          P L A N I T Y
        </h1>
        
         {/* Catégories - Visible sur desktop */}
        <div className={`hidden lg:flex items-center gap-6 text-[13px] font-medium ${categoriesColor} ${categoriesHover} transition-colors`}>
          <a href="/search?category=Coiffeur" className={categoriesHover}>Coiffeur</a>
          <a href="/search?category=Barbier" className={categoriesHover}>Barbier</a>
          <a href="/search?category=Manucure" className={categoriesHover}>Manucure</a>
          <a href="/search?category=Institut" className={categoriesHover}>Institut de beauté</a>
          <a href="/search?category=Bien-être" className={categoriesHover}>Bien-être</a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/professional')}
          className={`${secondaryButtonBg} backdrop-blur-sm ${secondaryButtonText} px-4 py-2.5 rounded-lg text-sm font-medium ${secondaryButtonHoverBg} transition-colors border ${secondaryButtonBorder} hidden sm:block`}
        >
          Je suis un professionnel de beauté
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAccountClick}
              className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
            >
              <User size={18} />
              <span>Compte</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAccountClick}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <User size={18} />
            <span>Mon compte</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
