import React, { useState } from 'react';
import { X, Check, User, Mail, Phone, Key } from 'lucide-react';
import PhoneInput from './PhoneInput';

const AddClientModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await onAdd(formData);
      if (result && result.client) {
        setSuccessData(result);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#48BB78] flex items-center gap-2">
              <Check size={24} />
              Client ajouté avec succès
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#F0FFF4] border border-[#C6F6D5] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#48BB78] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {successData.client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{successData.client.name}</p>
                  <p className="text-sm text-gray-500">Client créé</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span>{successData.client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span>{successData.client.phone || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Key size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-800">Mot de passe temporaire</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Mot de passe : <code className="bg-white px-2 py-1 rounded">{successData.tempPassword}</code>
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Envoyez ces informations au client pour qu'il puisse se connecter.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-[#48BB78] text-white rounded-xl font-bold hover:bg-[#3da368]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Ajouter un client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom complet"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                required
              />
            </div>
          </div>

          <div>
            <PhoneInput
              value={formData.phone}
              onChange={(phone) => setFormData({ ...formData, phone })}
              label="Téléphone"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes sur le client..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#48BB78] text-white rounded-xl font-bold hover:bg-[#3da368] disabled:opacity-50"
            >
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;
