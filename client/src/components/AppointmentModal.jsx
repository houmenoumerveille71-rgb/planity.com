import React from 'react';
import { X, Clock, User, Phone, Mail, Scissors, DollarSign } from 'lucide-react';

const AppointmentModal = ({ appointment, onClose, onCancel }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Rendez-vous</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Horaire */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Clock size={20} className="text-[#48BB78]" />
            <div>
              <p className="text-sm text-gray-500">Heure</p>
              <p className="font-bold">
                {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={20} className="text-[#48BB78]" />
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-bold">{appointment.user?.name || 'Client'}</p>
            </div>
          </div>

          {/* Téléphone */}
          {appointment.user?.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone size={20} className="text-[#48BB78]" />
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-bold">{appointment.user.phone}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {appointment.user?.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={20} className="text-[#48BB78]" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-bold">{appointment.user.email}</p>
              </div>
            </div>
          )}

          {/* Service */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Scissors size={20} className="text-[#48BB78]" />
            <div>
              <p className="text-sm text-gray-500">Service</p>
              <p className="font-bold">{appointment.service?.name || 'Service'}</p>
            </div>
          </div>

          {/* Prix */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <DollarSign size={20} className="text-[#48BB78]" />
            <div>
              <p className="text-sm text-gray-500">Prix</p>
              <p className="font-bold text-[#48BB78]">{appointment.service?.price || 0} FCFA</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onCancel(appointment.id)}
            className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#48BB78] text-white rounded-xl font-bold hover:bg-[#3da368]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
