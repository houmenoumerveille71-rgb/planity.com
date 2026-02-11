import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PhoneInput from './PhoneInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProfessionalAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [view, setView] = useState('landing'); // landing, login, register, demo-success
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    salonName: '',
    salonType: '',
    address: '',
    openingHours: '9h-19h',
    salonImage: null
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Vérifier si l'utilisateur vient de soumettre une demande de démo
  useEffect(() => {
    if (searchParams.get('demo') === 'submitted') {
      setView('demo-success');
      setSuccessMessage('Votre demande a été soumise avec succès ! Vous recevrez un email de confirmation sous 24h.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'salonImage' && files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ ...formData, salonImage: data.url });
        setMessage('Image uploadée avec succès !');
      } else {
        setMessage(data.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Si une image est sélectionnée, l'uploader d'abord
    if (view === 'register' && formData.salonImage instanceof File) {
      await handleImageUpload(e);
      return;
    }

    const url = view === 'login' ? '/auth/pro/login' : '/auth/register';
    const body = view === 'login'
      ? { email: formData.email, password: formData.password }
      : { 
          name: formData.name, 
          email: formData.email, 
          password: formData.password,
          phone: formData.phone,
          role: 'salon_owner',
          salonName: formData.salonName,
          salonType: formData.salonType,
          address: formData.address,
          openingHours: formData.openingHours,
          salonImage: formData.salonImage && typeof formData.salonImage === 'string' ? formData.salonImage : undefined
        };

    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (view === 'login') {
          if (data.user && (data.user.role === 'salon_owner' || data.user.role === 'employee')) {
            login(data.token, data.user);
            navigate('/professional/dashboard');
          } else {
            setMessage('Ce compte n\'est pas un compte professionnel. Veuillez vous connecter avec un compte professionnel.');
          }
        } else {
          setMessage('Compte professionnel créé avec succès ! Vous pouvez maintenant vous connecter.');
          setView('login');
          setFormData({ email: '', password: '', name: '', phone: '', salonName: '', salonType: '', address: '', openingHours: '9h-19h', salonImage: null });
        }
      } else {
        setMessage(data.error || 'Erreur lors de la connexion');
      }
    } catch (err) {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Page d'atterrissage professionnelle
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 font-sans">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div
              onClick={() => navigate('/')}
              className="text-2xl font-bold tracking-tighter cursor-pointer uppercase text-white"
            >
              PLANITY
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Développez votre activité, gérez vos rendez-vous en ligne
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Rejoignez des milliers de professionnels de la beauté et du bien-être qui font confiance à Planity pour développer leur clientèle.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-3">Agenda en ligne</h3>
              <p className="text-purple-100">
                Gérez vos disponibilités et vos rendez-vous en temps réel. Plus de double-réservation !
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-3">Nouveaux clients</h3>
              <p className="text-purple-100">
                Soyez visible par des milliers de clients potentiels qui cherchent des prestations près de chez eux.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Acomptes sécurisés</h3>
              <p className="text-purple-100">
                Recevez des acomptes pour sécuriser vos rendez-vous et réduire les annulations.
              </p>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView('login')}
              className="bg-white text-purple-700 px-12 py-5 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-xl"
            >
              Se connecter
            </button>
            <button
              onClick={() => setView('register')}
              className="bg-purple-500 text-white px-12 py-5 rounded-xl font-bold text-lg hover:bg-purple-400 transition-colors shadow-xl border-2 border-white/30"
            >
              Créer un compte professionnel
            </button>
          </div>

          {/* Retour */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-200 hover:text-white transition-colors"
            >
              ← Retour à l'accueil client
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Page de succès après soumission de demande de démo
  if (view === 'demo-success') {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 font-sans">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div
              onClick={() => navigate('/')}
              className="text-2xl font-bold tracking-tighter cursor-pointer uppercase text-white"
            >
              PLANITY
            </div>
          </div>
        </div>

        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Demande soumise avec succès !
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              {successMessage}
            </p>

            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-purple-900 mb-3">Prochaines étapes</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">📧</span>
                  Vérifiez votre email après 24h pour la confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">📋</span>
                  Votre demande sera traitée par notre équipe
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600">📞</span>
                  Nous vous contacterons si nécessaire
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setView('landing');
                  setSuccessMessage('');
                }}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                Retour à l'accueil professionnel
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-purple-600"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Formulaire de connexion ou inscription
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div
            onClick={() => navigate('/')}
            className="text-2xl font-bold tracking-tighter cursor-pointer uppercase text-purple-600"
          >
            PLANITY
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💼</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'login' ? 'Connexion Professionnel' : 'Créer un compte professionnel'}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {view === 'login' 
                ? 'Accédez à votre espace professionnel' 
                : 'Rejoignez Planity en tant que professionnel'}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg text-sm ${
              message.includes('succès') || message.includes('créé')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'register' && (
              <>
                {/* Informations du salon */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Informations du salon</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Nom du salon *</label>
                      <input
                        type="text"
                        name="salonName"
                        value={formData.salonName}
                        onChange={handleChange}
                        placeholder="Nom de votre salon"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Type d'activité *</label>
                      <select
                        name="salonType"
                        value={formData.salonType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        required
                      >
                        <option value="">Sélectionnez votre activité</option>
                        <option value="Coiffeur">Coiffeur</option>
                        <option value="Barbier">Barbier</option>
                        <option value="Manucure">Manucure</option>
                        <option value="Institut">Institut de beauté</option>
                        <option value="Bien-être">Bien-être / Massage</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Adresse / Localisation *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Adresse complète de votre salon"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Horaires d'ouverture *</label>
                      <input
                        type="text"
                        name="openingHours"
                        value={formData.openingHours}
                        onChange={handleChange}
                        placeholder="Ex: 9h-19h"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        required
                      />
                    </div>

                    {/* Image du salon */}
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Image du salon (optionnel)</label>
                      <input
                        type="file"
                        name="salonImage"
                        onChange={handleChange}
                        accept="image/*"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sélectionnez une image depuis votre appareil (JPG, PNG)
                      </p>
                    </div>
                  </div>
                </div>
 
                {/* Informations personnelles */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Nom complet *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(phone) => setFormData({ ...formData, phone })}
                        label="Téléphone *"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Email professionnel *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                required
                minLength={6}
              />
            </div>

            {view === 'register' && (
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-purple-600" required />
                <p className="text-sm text-gray-600 leading-tight">
                  J'accepte les <span className="underline font-medium cursor-pointer">conditions d'utilisation</span> et la <span className="underline font-medium cursor-pointer">politique de confidentialité</span> de Planity.
                </p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement...
                </span>
              ) : (
                view === 'login' ? 'Se connecter' : 'Créer mon compte professionnel'
              )}
            </button>
          </form>

          {/* Mot de passe oublié */}
          {view === 'login' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {view === 'login' ? 'Nouveau professionnel ?' : 'Vous avez déjà un compte professionnel ?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setMessage('');
                setFormData({ email: '', password: '', name: '', phone: '', salonName: '', salonType: '', address: '', openingHours: '9h-19h' });
              }}
              className="mt-2 text-purple-600 font-bold hover:text-purple-800 transition-colors"
            >
              {view === 'login' ? 'Créer un compte professionnel' : 'Se connecter'}
            </button>
          </div>

          {/* Retour */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour à l'accueil professionnel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalAccess;
