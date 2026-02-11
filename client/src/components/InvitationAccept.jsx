import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from './Navbar';
import Footer from './Footer';

export default function InvitationAccept() {
  const { token: encodedToken } = useParams();
  // Décoder le token car il peut être encodé dans l'URL
  const token = encodedToken ? decodeURIComponent(encodedToken) : '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Vérifier l'invitation
    fetch(`http://localhost:5000/api/invitations/${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvitation(data);
          setFormData(prev => ({ ...prev, name: data.name || '' }));
        }
      })
      .catch(err => {
        setError('Erreur lors de la vérification de l\'invitation');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/invitations/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/professional/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError('Erreur lors de la création du compte');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation invalide</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full mx-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte créé avec succès!</h2>
          <p className="text-gray-600 mb-4">Bienvenue {formData.name}!</p>
          <p className="text-sm text-gray-500">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">Bienvenue!</h2>
            <p className="text-gray-600 mt-2">
              Vous avez été invité à rejoindre le salon <strong>{invitation?.salonName || 'Planity Pro'}</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Entrez votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="最小6 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Email: <strong>{invitation?.email}</strong>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
