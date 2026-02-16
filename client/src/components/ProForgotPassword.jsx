import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth, isProfessionalUser } from '../AuthContext';

const ProForgotPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect clients to their dashboard if already logged in
  useEffect(() => {
    if (user && !isProfessionalUser(user)) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
      } else {
        setError(data.error || 'Erreur lors de la demande');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* SECTION GAUCHE : Formulaire */}
      <div className="w-full lg:w-[55%] flex flex-col p-8 md:p-16 lg:p-24 relative justify-center items-center">
        
        {/* Logo Header */}
        <div className="flex items-center gap-1 mb-20 cursor-pointer self-start lg:self-auto" onClick={() => navigate('/pro-landing')}>
          <span className="text-2xl font-black tracking-tighter text-[#2D3748]">PLANITY</span>
          <span className="text-[10px] font-bold text-[#718096] mt-1 uppercase tracking-widest">Pro</span>
        </div>

        <div className="w-full max-w-md lg:mx-0">
          <button 
            onClick={() => navigate('/pro-login')}
            className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <h1 className="text-4xl font-bold text-[#2D3748] mb-4">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 mb-8">
            Saisissez votre adresse email pour recevoir un lien de réinitialisation de votre mot de passe.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-[#EBFBF2] border border-[#C6F6D5] text-[#2F855A] rounded-lg flex items-center gap-3">
              <Check size={20} />
              <span>{message}</span>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-[#4A5568]">Adresse email</label>
                <input 
                  type="email" 
                  placeholder="Adresse email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#48BB78] focus:border-transparent outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  required
                />
              </div>

              {/* Bouton Envoyer */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#48BB78] hover:bg-[#38a169] text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Bannière verte */}
        <div className="mt-auto pt-10 flex items-center justify-between bg-[#F0FFF4] -mx-8 md:-mx-16 lg:-mx-24 px-8 md:px-16 lg:px-24 py-6 border-t border-[#C6F6D5] w-full">
          <p className="text-[#2F855A] font-semibold text-sm">
            Vous souhaitez équiper votre établissement avec la solution Planity ?
          </p>
          <button 
            onClick={() => navigate('/pro-landing')}
            className="bg-[#48BB78] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#38a169]"
          >
            Découvrir Planity
          </button>
        </div>
      </div>

      {/* SECTION DROITE : Information Panel */}
      <div className="hidden lg:flex w-[45%] bg-[#2D3748] text-white p-24 flex-col justify-center items-center">
        <div className="max-w-md text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Découvrez la plateforme qui développe votre activité !
          </h2>
          <p className="text-[#A0AEC0] text-lg mb-10">
            Équipez-vous de Planity et gagnez du temps au quotidien
          </p>

          <ul className="space-y-6 mb-12">
            {[
              "Plus de 50 000 professionnels de la beauté utilisent Planity au Bénin, au Nigeria et en Togo.",
              "Une prise de rendez-vous sans commission 24h/24h",
              "Une plateforme aux 10 millions de visiteurs par mois"
            ].map((text, i) => (
              <li key={i} className="flex gap-4">
                <Check className="text-[#48BB78] shrink-0" size={24} />
                <span className="text-[#CBD5E0] font-medium leading-tight">{text}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={() => navigate('/pro-landing')}
            className="bg-[#48BB78] hover:bg-[#38a169] text-white px-8 py-3 rounded-lg font-bold transition-all w-fit"
          >
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProForgotPassword;
