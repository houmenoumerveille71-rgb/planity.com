import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ResetPasswordForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Votre mot de passe a été réinitialisé avec succès !');
        setMessageType('success');
        setTimeout(() => {
          navigate('/account/settings');
        }, 2000);
      } else {
        setMessage(data.error || 'Erreur lors de la réinitialisation');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white px-4">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-black mb-4">Réinitialiser le mot de passe</h2>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase">Nouveau mot de passe *</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Entrez votre nouveau mot de passe"
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-black outline-none transition-all"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading || !newPassword}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/account/settings')}
            className="w-full text-blue-500 font-medium text-sm underline underline-offset-4 cursor-pointer hover:text-blue-700"
          >
            Retour à mes informations
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
