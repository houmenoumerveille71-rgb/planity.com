import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import PhoneInput from './PhoneInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { token, user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setLoading(false);
    }
  }, [token, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setMessage('Profil mis à jour avec succès !');
        setMessageType('success');
        setIsEditing(false);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Erreur lors de la mise à jour du profil.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('Erreur réseau.');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Informations personnelles</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Modifier
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <PhoneInput
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  label="Téléphone"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-500">Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{user.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Préférences */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-xl font-bold mb-6">Préférences de notification</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-gray-500">Recevoir les confirmations et rappels par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications SMS</p>
              <p className="text-sm text-gray-500">Recevoir les rappels par SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Section Sécurité */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-xl font-bold mb-6">Sécurité</h2>
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/reset-password'}
            className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex justify-between items-center"
          >
            <span>Changer mon mot de passe</span>
            <span>→</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex justify-between items-center"
          >
            <span>Se déconnecter</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
