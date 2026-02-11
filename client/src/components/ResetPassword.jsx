import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage('Token manquant');
      // Facultatif : rediriger l’utilisateur
      // navigate('/forgot-password');
    }
  }, [token /*, navigate */]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setMessage('Token manquant');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ⚠️ Envoyer "password" pour matcher le backend le plus courant
        body: JSON.stringify({ token, password: newPassword }),
      });

      // Lecture tolérante : JSON ou texte
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (res.status === 400 ? 'Requête invalide' :
           res.status === 401 ? 'Token invalide ou expiré' :
           res.status === 404 ? 'Utilisateur introuvable' :
           'Erreur serveur');
        setMessage(msg);
        return;
      }

      setMessage(data.message || 'Mot de passe réinitialisé avec succès');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      <main className="max-w-md mx-auto px-6 py-12">
        <h2 className="text-2xl font-medium text-center mb-8">Réinitialiser le mot de passe</h2>

        {message && <p className="mb-4 text-center text-sm text-red-600">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Nouveau mot de passe *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition-colors"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Au moins 8 caractères (recommandé : mélange lettres, chiffres, symboles).
            </p>
          </div>

          <button
            className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-60"
            disabled={!token || loading}
          >
            {loading ? 'Patientez…' : 'Réinitialiser'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-gray-600 underline mt-4"
        >
          Retour à la connexion
        </button>
      </main>
    </div>
  );
};

export default ResetPassword;