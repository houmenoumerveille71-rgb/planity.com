import React, { useState, useEffect } from 'react';
import { EyeOff, Upload, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isProfessionalUser } from '../AuthContext';
import Nav from './Navbar';
import Footer from './Footer';
import PhoneInput from './PhoneInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProfileSettings = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger vers le dashboard admin si c'est un admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    // Rediriger les professionnels vers leur dashboard
    if (user && isProfessionalUser(user)) {
      navigate('/professional/dashboard');
    }
  }, [user, navigate]);
  
  // Ne pas afficher si pas d'utilisateur, si admin ou si professionnel
  if (!user || isProfessionalUser(user) || user.role === 'admin') {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageMessage, setImageMessage] = useState('');
  const [imageMessageType, setImageMessageType] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setProfileImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(file);
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    setImageLoading(true);
    setImageMessage('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', profileImage);

      const response = await fetch(`${API_BASE}/users/profile-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, profileImage: data.profileImage });
        setImageMessage('Photo de profil mise à jour avec succès !');
        setImageMessageType('success');
      } else {
        setImageMessage(data.error || 'Erreur lors de l\'upload');
        setImageMessageType('error');
      }
    } catch (err) {
      setImageMessage('Erreur de connexion au serveur');
      setImageMessageType('error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    setImageLoading(true);
    setImageMessage('');

    try {
      const response = await fetch(`${API_BASE}/users/profile-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deleteImage: 'true' })
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, profileImage: null });
        setProfileImage(null);
        setProfileImagePreview(null);
        setImageMessage('Photo de profil supprimée');
        setImageMessageType('success');
      } else {
        setImageMessage(data.error || 'Erreur lors de la suppression');
        setImageMessageType('error');
      }
    } catch (err) {
      setImageMessage('Erreur de connexion au serveur');
      setImageMessageType('error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMessage('Vos informations ont été mises à jour avec succès !');
        setMessageType('success');
      } else {
        setMessage(data.error || 'Erreur lors de la mise à jour');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      const response = await fetch(`${API_BASE}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Votre mot de passe a été modifié avec succès !');
        setPasswordMessageType('success');
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        setPasswordMessage(data.error || 'Erreur lors de la modification du mot de passe');
        setPasswordMessageType('error');
      }
    } catch (err) {
      setPasswordMessage('Erreur de connexion au serveur');
      setPasswordMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  };

  return (
    <>
      <Nav />
      <div className="bg-[#F8F9FA] min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white rounded-2xl p-6 shadow-sm self-start">
          <h3 className="text-xl font-bold mb-8">Mon compte</h3>
          <ul className="space-y-6">
            <li 
              onClick={() => navigate('/account')}
              className="text-gray-500 font-semibold cursor-pointer hover:text-black transition-colors"
            >
              Mes rendez-vous
            </li>
            <li 
              className="text-black font-black border-l-4 border-black pl-3 -ml-6"
            >
              Mes informations
            </li>
            <li 
              onClick={() => navigate('/account/proches')}
              className="text-gray-500 font-semibold cursor-pointer hover:text-black transition-colors"
            >
              Mes proches
            </li>
          </ul>
          <div className="mt-12 pt-6 border-t">
            <button 
              onClick={handleLogout}
              className="text-red-500 font-bold hover:opacity-70 transition-opacity cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Formulaires */}
          <main className="flex-1 space-y-6">
            {/* Message de feedback image */}
            {imageMessage && (
              <div className={`p-4 rounded-lg ${imageMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {imageMessage}
              </div>
            )}

            {/* Section Photo de profil */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Photo de profil</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Photo de profil" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 font-bold">
                      {formData.firstName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-sm mb-4">
                    Cette photo sera visible dans votre espace professionnel et lors des échanges internes.
                  </p>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                      <Upload size={18} />
                      <span>Choisir une photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {profileImagePreview && (
                      <button 
                        onClick={handleDeleteImage}
                        disabled={imageLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>
                  {profileImage && (
                    <button 
                      onClick={handleImageUpload}
                      disabled={imageLoading}
                      className="mt-4 px-6 py-2 bg-[#48BB78] text-white rounded-lg hover:bg-[#3da368] transition-colors disabled:opacity-50"
                    >
                      {imageLoading ? 'Upload...' : 'Enregistrer la photo'}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Message de feedback */}
            {message && (
              <div className={`p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            {/* Section Coordonnées */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Mes coordonnées</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Prénom *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Prénom" 
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Nom *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Nom" 
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email" 
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <PhoneInput
                      value={formData.phone}
                      onChange={(phone) => setFormData({ ...formData, phone })}
                      label="Téléphone portable *"
                      required
                    />
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </section>

            {/* Section Cartes enregistrées */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Cartes enregistrées</h3>
            </section>

            {/* Section Mot de passe */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Mot de passe</h3>
              <p className="text-gray-500 text-sm mb-6">Pour modifier votre mot de passe, veuillez saisir votre mot de passe actuel pour confirmer votre identité.</p>
              
              {/* Message de feedback mot de passe */}
              {passwordMessage && (
                <div className={`p-4 rounded-lg mb-6 ${passwordMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {passwordMessage}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Mot de passe actuel *</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Entrez votre mot de passe actuel" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Nouveau mot de passe *</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Entrez votre nouveau mot de passe" 
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <EyeOff size={20} />
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                    className="w-fit px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </form>
            </section>
          </main>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ProfileSettings;
