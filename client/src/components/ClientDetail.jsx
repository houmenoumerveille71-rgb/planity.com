import React from 'react';
import { X, Calendar, DollarSign, Phone, Mail, Clock } from 'lucide-react';

const ClientDetail = ({ client, onClose }) => {
  if (!client) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#48BB78] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {client.profileImage ? (
                <img src={client.profileImage} alt={client.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                client.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <p className="text-gray-500">Client depuis le {formatDate(client.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Mail className="text-[#48BB78]" size={20} />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Phone className="text-[#48BB78]" size={20} />
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="font-medium">{client.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-[#48BB78]/10 rounded-xl">
            <DollarSign className="text-[#48BB78]" size={24} />
            <div>
              <p className="text-xs text-gray-500">Total dépensé</p>
              <p className="text-2xl font-bold text-[#48BB78]">{formatCurrency(client.totalSpent)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Calendar className="text-blue-500" size={24} />
            <div>
              <p className="text-xs text-gray-500">Rendez-vous</p>
              <p className="text-2xl font-bold text-blue-500">{client.totalAppointments || client.appointments?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Appointments History */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock size={20} />
            Historique des rendez-vous
          </h3>
          
          {client.appointments && client.appointments.length > 0 ? (
            <div className="space-y-3">
              {client.appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {apt.service?.image ? (
                        <img src={apt.service.image} alt={apt.service.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <Calendar className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{apt.service?.name || 'Service'}</p>
                      <p className="text-sm text-gray-500">{formatDate(apt.startTime)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#48BB78]">{formatCurrency(apt.service?.price)}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Aucun rendez-vous</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
