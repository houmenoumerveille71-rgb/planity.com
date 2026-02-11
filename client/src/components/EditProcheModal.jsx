import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PhoneInput from './PhoneInput';

const EditProcheModal = ({ isOpen, onClose, onSubmit, proche }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (proche && isOpen) {
      const nameParts = proche.nom.split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: proche.email || '',
        phone: proche.telephone || ''
      });
    }
  }, [proche, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: proche.id
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Header avec bouton fermer */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 pb-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Modifier le proche</h2>
            <p className="text-gray-600">Vous pouvez modifier les informations de ce proche.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase text-gray-700">Prénom *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase text-gray-700">Nom *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
                  required
                />
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase text-gray-700">Email (facultatif)</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <PhoneInput
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  label="Téléphone portable"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#1A1A1A] text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProcheModal;
