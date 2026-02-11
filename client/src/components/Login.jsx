import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ADMIN_CONFIG } from '../config/adminConfig';
import PhoneInput from './PhoneInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Login = ({ isRegister = false }) => {
  const { login, user, token } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(!isRegister);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (token && user) {
      navigate('/account');
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (showForgotPassword) {
      // Forgot password
      try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await response.json();
        setMessage(data.message || 'Erreur');
      } catch (err) {
        setMessage('Erreur réseau');
      }
      return;
    }

    // Vérification des identifiants admin via le serveur
    if (formData.email === ADMIN_CONFIG.email && formData.password === ADMIN_CONFIG.motDePasse) {
      try {
        const response = await fetch(`${API_BASE}/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          window.location.href = '/admin/dashboard';
        } else {
          setMessage(data.error || 'Erreur de connexion admin');
        }
      } catch (err) {
        setMessage('Erreur réseau');
      }
      return;
    }

    const url = isLogin ? '/auth/login' : '/auth/register';
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          login(data.token, data.user);
          window.location.href = '/account';
        } else {
          setMessage('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
          setIsLogin(true);
        }
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
  };

  return (
<div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
<main className="max-w-md mx-auto px-6 py-12">
<h2 className="text-2xl font-medium text-center mb-8">
  {showForgotPassword ? 'Mot de passe oublié' : isLogin ? 'Connexion' : 'Nouveau sur Planity ?'}
</h2>
{message && <p className="mb-4 text-center text-sm text-red-600">{message}</p>}
<form onSubmit={handleSubmit} className="space-y-6">
  {showForgotPassword ? (
    <>
      {/* Email pour forgot password */}
      <div>
        <label className="block text-sm font-bold mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Votre email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition-colors"
          required
        />
      </div>
      <button className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-bold hover:bg-black transition-colors shadow-lg">
        Envoyer le lien de réinitialisation
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForgotPassword(false);
          setIsLogin(true);
        }}
        className="w-full text-gray-600 underline"
      >
        Retour à la connexion
      </button>
    </>
  ) : (
    <>
      {!isLogin && (
        <>
          {/* Nom */}
          <div>
            <label className="block text-sm font-bold mb-2">Nom *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition-colors"
              required
            />
          </div>
          {/* Téléphone */}
          <PhoneInput
            value={formData.phone}
            onChange={(phone) => setFormData({ ...formData, phone })}
            label="Téléphone portable *"
            required
          />
        </>
      )}
      {/* Email */}
      <div>
        <label className="block text-sm font-bold mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition-colors"
          required
        />
      </div>
      {/* Mot de passe */}
      <div>
        <label className="block text-sm font-bold mb-2">Mot de passe *</label>
        <div className="relative">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition-colors"
            required
          />
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>
      {!isLogin && (
        /* CGU */
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-5 h-5 accent-black" required />
          <p className="text-sm text-gray-600 leading-tight">
            J'accepte les <span className="underline font-medium cursor-pointer">CGU</span> de Planity.
          </p>
        </div>
      )}
      {/* Bouton */}
      <button className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-bold hover:bg-black transition-colors shadow-lg">
        {isLogin ? 'Se connecter' : 'Créer mon compte'}
      </button>
    </>
  )}
</form>
<p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
       Vos informations sont traitées par Planity, consultez notre <span className="underline">politique de confidentialité</span>. Ce site est protégé par reCAPTCHA et est soumis à la <span className="underline">Politique de Confidentialité</span> et aux <span className="underline">Conditions d'Utilisations</span> de Google.
</p>
       {/* Séparateur */}
<div className="relative my-10 flex items-center">
<div className="grow border-t border-gray-200"></div>
<span className="shrink mx-4 text-gray-400 text-sm">ou</span>
<div className="grow border-t border-gray-200"></div>
</div>
      {/* Toggle */}
<div className="text-center">
<h3 className="text-lg font-medium mb-4">
 {isLogin ? 'Nouveau sur Planity ?' : 'Vous avez déjà utilisé Planity ?'}
</h3>
<button
  type="button"
  onClick={() => {
    setIsLogin(!isLogin);
    setMessage('');
    setFormData({ name: '', email: '', password: '', phone: '' });
  }}
  className="w-full border-2 border-[#1a1a1a] py-4 rounded-lg font-bold hover:bg-gray-50 transition-colors"
>
  {isLogin ? 'Créer mon compte' : 'Se connecter'}
</button>
{isLogin && (
  <button
    type="button"
    onClick={() => setShowForgotPassword(true)}
    className="mt-4 text-sm text-gray-600 underline"
  >
    Mot de passe oublié ?
  </button>
)}
</div>
</main>
</div>
  );
};
export default Login;
