import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isProfessionalUser } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PlanityProRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedCGV, setAcceptedCGV] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Redirect clients to their dashboard if already logged in
  useEffect(() => {
    if (user && !isProfessionalUser(user)) {
      navigate('/account');
    }
  }, [user, navigate]);

  // Récupérer les données du parcours d'inscription stockées
  const onboardingData = JSON.parse(localStorage.getItem('pro_onboarding_data') || '{}');

  // Initialiser les données depuis les données onboarding
  useEffect(() => {
    if (onboardingData.gerant) {
      setName(onboardingData.gerant);
    }
    if (onboardingData.telephone) {
      setPhone(onboardingData.telephone);
    }
    if (onboardingData.email) {
      setEmail(onboardingData.email);
    }
  }, []);

  // Critères de validation du mot de passe
  const validations = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    special: /[0-9!@#$%^&*]/.test(password),
  };

  const isPasswordValid = validations.length && validations.letter && validations.special;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = email && name && isPasswordValid && doPasswordsMatch && acceptedCGV;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!name) {
      setError('Veuillez entrer votre nom');
      return;
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères de validation');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptedCGV) {
      setError('Vous devez accepter les CGV pour créer un compte');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/pro/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
          phone: phone || '',
          siret: onboardingData.siret || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Nettoyer les données d'inscription
        localStorage.removeItem('pro_onboarding_data');
        
        // Rediriger vers la création du salon
        navigate('/pro-salon-setup');
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* --- SECTION GAUCHE : FORMULAIRE --- */}
      <div className="w-full lg:w-[55%] flex flex-col p-8 md:p-12 lg:p-20 relative overflow-y-auto justify-center items-center">
        
        {/* Logo Header */}
        <div className="flex items-center gap-1 mb-12 cursor-pointer self-start lg:self-auto" onClick={() => navigate('/pro-landing')}>
          <span className="text-2xl font-black tracking-tighter text-gray-800">PLANITY</span>
          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Pro</span>
        </div>

        <div className="max-w-115 w-full lg:mx-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Bienvenue !</h1>
            <button className="text-sm font-semibold text-gray-500 flex items-center gap-1">
              Français <span className="text-[10px]">▼</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
              {/* Nom */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nom complet</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Antoine Martin"
                  className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#48BB78] outline-none transition-all shadow-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Adresse email professionnelle</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: antoine.martin@monsalon.fr"
                  className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#48BB78] outline-none transition-all shadow-sm"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 06 12 34 56 78"
                  className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#48BB78] outline-none transition-all shadow-sm"
                />
              </div>

            {/* Mot de passe */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#48BB78] outline-none shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicateurs de force du mot de passe */}
              <div className="space-y-2 py-1">
                <div className={`flex items-center gap-2 text-[13px] ${validations.letter ? 'text-[#48BB78]' : 'text-gray-400'}`}>
                  <Check size={16} strokeWidth={3} className={validations.letter ? 'opacity-100' : 'opacity-30'} />
                  Contient au moins une lettre
                </div>
                <div className={`flex items-center gap-2 text-[13px] ${validations.special ? 'text-[#48BB78]' : 'text-gray-400'}`}>
                  <Check size={16} strokeWidth={3} className={validations.special ? 'opacity-100' : 'opacity-30'} />
                  Contient au moins un chiffre ou un caractère spécial
                </div>
                <div className={`flex items-center gap-2 text-[13px] ${validations.length ? 'text-[#48BB78]' : 'text-gray-400'}`}>
                  <Check size={16} strokeWidth={3} className={validations.length ? 'opacity-100' : 'opacity-30'} />
                  Contient au moins 8 caractères
                </div>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Confirmez votre mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3.5 border rounded-lg focus:ring-2 focus:ring-[#48BB78] outline-none shadow-sm ${
                    confirmPassword.length > 0 
                      ? (doPasswordsMatch ? 'border-[#48BB78]' : 'border-red-400') 
                      : 'border-gray-200'
                  }`}
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {doPasswordsMatch ? (
                      <Check size={20} className="text-[#48BB78]" />
                    ) : (
                      <span className="text-red-400 text-sm">✗</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Case CGV */}
            <div className="flex gap-3 pt-2">
              <input 
                type="checkbox" 
                id="cgv" 
                checked={acceptedCGV}
                onChange={(e) => setAcceptedCGV(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#48BB78] focus:ring-[#48BB78]" 
              />
              <label htmlFor="cgv" className="text-[13px] text-gray-700 leading-relaxed">
                J'accepte les <a href="#" className="underline font-bold text-black">CGV</a> et je m'engage, en tant que représentant légal de l'établissement...
              </label>
            </div>

            {/* Bouton Créer mon compte */}
            <button 
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-[#48BB78] hover:bg-[#3da368] text-white py-4 rounded-lg font-bold text-lg shadow-md transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Liens bas de page */}
          <div className="mt-8 flex justify-between items-center text-sm font-bold">
            <a href="/pro-login" className="text-black hover:underline">J'ai déjà un compte</a>
            <button className="text-black hover:underline">Mot de passe oublié ?</button>
          </div>
        </div>

        {/* Footer Bannière verte */}
        <div className="mt-auto pt-10 -mx-8 md:-mx-12 lg:-mx-20 w-full">
          <div className="bg-[#EBFBF2] px-8 md:px-20 py-5 border-t border-[#C6F6D5] flex items-center justify-between">
            <p className="text-[#2F855A] font-semibold text-sm max-w-[70%]">
              Vous souhaitez équiper votre établissement avec la solution Planity ?
            </p>
            <button 
              onClick={() => navigate('/pro-landing')}
              className="bg-[#48BB78] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#3da368]"
            >
              Découvrir Planity
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION DROITE : INFO --- */}
      <div className="hidden lg:flex w-[45%] bg-[#2D3748] text-white p-20 flex-col justify-center">
        <h2 className="text-3xl font-bold mb-6 leading-tight max-w-sm">
          Découvrez la plateforme qui développe votre activité !
        </h2>
        <p className="text-gray-400 mb-10">Équipez-vous de Planity et gagnez du temps au quotidien</p>
        
        <ul className="space-y-6">
            {[
              "Plus de 50 000 professionnels de la beauté utilisent Planity au Bénin, au Nigeria et en Togo.",
              "Une prise de rendez-vous sans commission 24h/24h",
            "Une plateforme aux 10 millions de visiteurs par mois"
          ].map((text, i) => (
            <li key={i} className="flex gap-4">
              <Check className="text-[#48BB78] shrink-0" size={24} />
              <span className="text-gray-300 font-medium">{text}</span>
            </li>
          ))}
        </ul>
        <button 
          onClick={() => navigate('/pro-landing')}
          className="mt-12 bg-[#48BB78] text-white px-8 py-3 rounded-lg font-bold w-fit hover:bg-[#3da368]"
        >
          En savoir plus
        </button>
      </div>
    </div>
  );
};

export default PlanityProRegister;
