import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import NavbarPro from './NavbarPro';
import PhoneInput from './PhoneInput';
import { useAuth, isProfessionalUser } from '../AuthContext';

const ProLandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (user) {
      if (isProfessionalUser(user)) {
        navigate('/professional/dashboard');
      } else {
        navigate('/account');
      }
    }
  }, [user, navigate]);
  
  // État pour l'onboarding
  const [step, setStep] = useState(1);
  const [requestId, setRequestId] = useState(null);
  const [formData, setFormData] = useState({
    gerant: '',
    telephone: '',
    email: '',
    lieuExercice: '',
    anciennete: '',
    rythme: '',
    siret: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Catégories de salons
  const categories = [
    { 
      id: 'coiffure-femme', 
      name: 'Coiffure Femme', 
      icon: '💇‍♀️', 
      description: 'Coupe, coloration, brushing',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=400'
    },
    { 
      id: 'coiffure-homme', 
      name: 'Coiffure Homme', 
      icon: '💇', 
      description: 'Coupe, barbe, shaving',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400'
    },
    { 
      id: 'barbier', 
      name: 'Barbier', 
      icon: '🪒', 
      description: 'Rasage, taille de barbe',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400'
    },
    { 
      id: 'manucure', 
      name: 'Manucure', 
      icon: '💅', 
      description: 'Ongles, Vernis, Extensions',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400'
    },
    { 
      id: 'estheticienne', 
      name: 'Esthétique', 
      icon: '✨', 
      description: 'Soins visage, épilation',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400'
    },
    { 
      id: 'spa', 
      name: 'Spa & Massage', 
      icon: '🧖', 
      description: 'Relaxation, bien-être',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400'
    },
  ];

  const onboardingCategories = [
    "Salon de coiffure ou barbershop",
    "Institut de beauté ou bar à ongles",
    "Spa ou centre de bien-être"
  ];

  // Fonction pour sauvegarder chaque étape
  const saveStep = async (currentStep, stepData) => {
    try {
      const response = await fetch('http://localhost:5000/api/demo-requests/save-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          step: currentStep,
          stepData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRequestId(data.requestId);
        return true;
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
        return false;
      }
    } catch (error) {
      console.error('Erreur sauvegarde étape:', error);
      setError('Erreur de connexion au serveur');
      return false;
    }
  };

  // Navigation vers l'étape suivante avec sauvegarde
  const goToStep = async (nextStep, currentStepData) => {
    setError('');
    const saved = await saveStep(step, currentStepData);
    if (saved || step === 1) {
      setStep(nextStep);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Sauvegarder l'étape SIRET
      await saveStep(7, formData.siret);

      const experienceMap = {
        "En création d'activité": 'creation',
        "Moins d'une année": 'moins_1_an',
        "Plus d'une année": 'plus_1_an'
      };

      const rhythmMap = {
        'Quelques heures par semaine': 'heures_partielles',
        'À temps partiel': 'temps_partiel',
        'À temps plein': 'temps_plein'
      };

      const workLocationMap = {
        'mon_domicile': 'domicile',
        'domicile_clients': 'chez_clients'
      };

      // Mettre à jour le statut de la demande
      const response = await fetch(`http://localhost:5000/api/demo-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonName: formData.gerant ? `Salon de ${formData.gerant}` : null,
          contactName: formData.gerant,
          email: formData.email,
          phone: formData.telephone,
          workLocation: formData.lieuExercice ? workLocationMap[formData.lieuExercice] : null,
          experience: formData.anciennete ? experienceMap[formData.anciennete] : null,
          workRhythm: formData.rythme ? rhythmMap[formData.rythme] : null,
          siret: formData.siret,
          status: 'pending'
        })
      });

      if (response.ok) {
        // Afficher le message de confirmation
        setShowConfirmation(true);
      } else {
        setError('Erreur lors de la finalisation');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidSiret = formData.siret.replace(/\s/g, '').length === 14;

  // Rendre la section Onboarding
  const renderOnboardingStep = () => {
    return (
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-12 min-h-screen">
        
        {/* Barre de progression dynamique */}
        <div className="w-full max-w-md flex gap-1.5 mb-16">
          {step >= 7 ? (
            [...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < 7 ? 'bg-black' : 'bg-gray-200'
                }`}
              ></div>
            ))
          ) : step >= 6 ? (
            [...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < 6 ? 'bg-black' : 'bg-gray-200'
                }`}
              ></div>
            ))
          ) : step >= 5 ? (
            [...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < 5 ? 'bg-black' : 'bg-gray-200'
                }`}
              ></div>
            ))
          ) : step >= 4 ? (
            [...Array(7)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < 4 ? 'bg-black' : 'bg-gray-200'
                }`}
              ></div>
            ))
          ) : step === 3 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
            ))
          ) : step === 2 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
            ))
          ) : (
            [...Array(3)].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 1 ? 'bg-black' : 'bg-gray-200'}`}></div>
            ))
          )}
        </div>

        {error && (
          <div className="w-full max-w-md mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          
          {showConfirmation ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Merci !</h2>
              <p className="text-gray-600 text-lg">Merci, notre équipe vous contactera rapidement.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-6 w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700"
              >
                Retour à l'accueil
              </button>
            </div>
          ) : step === 1 ? (
            <>
              <div className="space-y-4">
                {onboardingCategories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(2, cat)}
                    className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                  >
                    <span className="text-lg font-semibold text-gray-900">{cat}</span>
                    <ArrowRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={20} />
                  </button>
                ))}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Je ne suis pas un professionnel de beauté, je souhaite prendre rendez-vous sur{" "}
                  <a href="/" className="text-gray-900 font-bold underline underline-offset-4">planity.com</a>
                </p>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                Exercez-vous dans un local commercial ?
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={() => goToStep(3, 'oui')}
                  className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <span className="text-lg font-semibold text-gray-900">Oui</span>
                  <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                </button>
                <button 
                  onClick={() => goToStep(4, 'non')}
                  className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                >
                  <span className="text-lg font-semibold text-gray-900">Non, j'exerce mon activité à domicile</span>
                  <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-900 font-bold mx-auto pt-8 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={20} />
                <span>Retour</span>
              </button>
            </>
          ) : step === 7 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                Quel est votre numéro de SIRET ?
              </h2>

              <div className="space-y-6">
                <input 
                  type="text" 
                  maxLength="14"
                  placeholder="Ex: 12345678900012"
                  value={formData.siret}
                  onChange={(e) => setFormData({...formData, siret: e.target.value})}
                  className="w-full p-5 border border-indigo-200 rounded-xl focus:border-indigo-600 outline-none transition-all text-lg placeholder:text-gray-300 font-medium"
                />

                <button 
                  onClick={handleSubmit}
                  disabled={!isValidSiret || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                    isValidSiret && !isSubmitting 
                      ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] cursor-pointer' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-900 font-bold mx-auto pt-4 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={18} />
                <span>Retour</span>
              </button>
            </>
          ) : step === 3 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                Pourriez-vous nous fournir vos coordonnées ?
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">Gérant de l'établissement*</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Antoine Martin" 
                    className="w-full p-4 border border-indigo-200 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300"
                    value={formData.gerant}
                    onChange={(e) => setFormData({...formData, gerant: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <PhoneInput
                    value={formData.telephone}
                    onChange={(telephone) => setFormData({...formData, telephone })}
                    label="Numéro de téléphone *"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">Email*</label>
                  <input 
                    type="email" 
                    placeholder="Ex : antoine.martin@gmail.com" 
                    className="w-full p-4 border border-indigo-200 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <button 
                  onClick={() => goToStep(7, { gerant: formData.gerant, telephone: formData.telephone, email: formData.email })}
                  disabled={!formData.gerant || !formData.email}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                    formData.gerant && formData.email 
                      ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Valider
                </button>
              </div>

              <div className="text-center space-y-6">
                <button 
                  onClick={() => setStep(6)}
                  className="flex items-center gap-2 text-gray-900 font-bold mx-auto hover:opacity-70 transition-opacity"
                >
                  <ArrowLeft size={18} />
                  <span>Retour</span>
                </button>
                
                <p className="text-[13px] text-gray-500">
                  <a href="#" className="underline underline-offset-4 decoration-gray-300 hover:text-black">
                    En savoir plus sur la collecte de vos données personnelles
                  </a>
                </p>
              </div>
            </>
          ) : step === 4 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                Où exercez-vous votre activité ?
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setFormData({...formData, lieuExercice: 'mon_domicile'});
                    goToStep(5, 'mon_domicile');
                  }}
                  className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <span className="text-lg font-semibold text-gray-900">À mon domicile</span>
                  <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                </button>
                <button 
                  onClick={() => {
                    setFormData({...formData, lieuExercice: 'domicile_clients'});
                    goToStep(5, 'domicile_clients');
                  }}
                  className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                >
                  <span className="text-lg font-semibold text-gray-900">Au domicile de mes clients</span>
                  <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                </button>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-900 font-bold mx-auto pt-8 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={18} />
                <span>Retour</span>
              </button>
            </>
          ) : step === 5 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                Depuis quand exercez-vous votre activité ?
              </h2>
              <div className="space-y-4">
                {[
                  "En création d'activité",
                  "Moins d'une année",
                  "Plus d'une année"
                ].map((label, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setFormData({...formData, anciennete: label});
                      goToStep(6, label);
                    }}
                    className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                  >
                    <span className="text-lg font-semibold text-gray-900">{label}</span>
                    <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(4)}
                className="flex items-center gap-2 text-gray-900 font-bold mx-auto pt-8 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={18} />
                <span>Retour</span>
              </button>
            </>
          ) : step === 6 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                Quel est votre rythme de travail ?
              </h2>
              <div className="space-y-4">
                {[
                  "Quelques heures par semaine",
                  "À temps partiel",
                  "À temps plein"
                ].map((rythme, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setFormData({...formData, rythme: rythme});
                      goToStep(3, rythme);
                    }}
                    className="w-full flex items-center justify-between p-6 border border-indigo-100 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group text-left"
                  >
                    <span className="text-lg font-semibold text-gray-900">{rythme}</span>
                    <ArrowRight className="text-gray-300 group-hover:text-indigo-500" size={20} />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(5)}
                className="flex items-center gap-2 text-gray-900 font-bold mx-auto pt-8 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={18} />
                <span>Retour</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  // Rendu principal avec section gauche et droite
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Pro */}
      <NavbarPro />
      
      <div className="flex flex-col lg:flex-row">
        {/* Section Onboarding (gauche) */}
        {renderOnboardingStep()}

        {/* Section Droite - Contenu différent selon l'étape */}
        <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#1a1a2e] to-[#16213e] text-white p-12 flex-col justify-center relative overflow-hidden">
          {/* Formes décoratives */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-indigo-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-indigo-400/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Gagnez en visibilité et simplifiez votre quotidien
            </h2>
            <p className="text-xl text-indigo-200 mb-10">
              rejoignez plus de 50 000 professionnels qui font confiance à Planity
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Check className="text-indigo-300" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Prise de rendez-vous 24h/24</h3>
                  <p className="text-indigo-300">Vos clients peuvent réserver à tout moment, sans intermédiaire</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Check className="text-indigo-300" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Gestion simplifiée</h3>
                  <p className="text-indigo-300">Organisez votre planning et vos clients en un clic</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Check className="text-indigo-300" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Sans engagement</h3>
                  <p className="text-indigo-300">Essayez gratuitement pendant 15 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProLandingPage;
