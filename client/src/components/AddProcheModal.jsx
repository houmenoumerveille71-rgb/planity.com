import React, { useState } from 'react';
import { X } from 'lucide-react';
import PhoneInput from './PhoneInput';

const AddProcheModal = ({ isOpen, onClose, onSubmit }) => {
  const [phone, setPhone] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: phone,
      authorized: formData.get('authorized') === 'on'
    };
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Header avec bouton fermer */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <h2 className="text-2xl font-bold text-center mb-2">Ajouter un proche</h2>
          <p className="text-gray-500 text-center mb-6">Remplissez les informations ci-dessous</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase text-gray-700">Prénom *</label>
                <input 
                  name="firstName"
                  required
                  placeholder="Prénom"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase text-gray-700">Nom *</label>
                <input 
                  name="lastName"
                  required
                  placeholder="Nom"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold uppercase text-gray-700">Email (facultatif)</label>
              <input 
                name="email"
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all" 
              />
            </div>
            
            <div className="space-y-1.5">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                label="Téléphone portable"
              />
            </div>

            {/* Checkbox d'autorisation */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                name="authorized"
                id="auth" 
                className="mt-1 w-5 h-5 accent-purple-900" 
              />
              <label htmlFor="auth" className="text-sm text-gray-600 leading-relaxed">
                J'autorise ce proche à prendre des rendez-vous en mon nom et à recevoir des notifications concernant ses rendez-vous.
              </label>
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 bg-[#4F46E5] text-white rounded-xl font-bold text-lg hover:bg-[#4338ca] transition-colors"
            >
              Ajouter ce proche
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProcheModal;
