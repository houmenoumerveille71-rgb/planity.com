import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, DollarSign, Calendar } from 'lucide-react';
import AddClientModal from './AddClientModal';
import EditClientModal from './EditClientModal';
import ClientDetail from './ClientDetail';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/professional/clients`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const response = await fetch(`${API_BASE}/professional/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });
      if (response.ok) {
        fetchClients();
        setShowAddModal(false);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout du client');
      }
    } catch (error) {
      console.error('Erreur ajout client:', error);
      throw error;
    }
  };

  const handleEditClient = async (clientId, clientData) => {
    try {
      const response = await fetch(`${API_BASE}/professional/clients/${clientId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      });
      if (response.ok) {
        fetchClients();
        setEditingClient(null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification client:', error);
      throw error;
    }
  };

  const handleViewClient = async (client) => {
    try {
      const response = await fetch(`${API_BASE}/professional/clients/${client.id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedClient(data);
      }
    } catch (error) {
      console.error('Erreur chargement détails client:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500">{clients.length} client(s)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#48BB78] text-white rounded-xl font-bold hover:bg-[#3da368]"
        >
          <Plus size={20} />
          Ajouter un client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
        />
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#48BB78]"></div>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">RDV</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Dépenses</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#48BB78] rounded-full flex items-center justify-center text-white font-bold">
                        {client.profileImage ? (
                          <img src={client.profileImage} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          client.name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {client.name}
                          {(!client.totalAppointments || client.totalAppointments === 0) && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">Depuis {formatDate(client.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium">{client.totalAppointments || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign size={16} className="text-[#48BB78]" />
                      <span className="font-bold text-[#48BB78]">{formatCurrency(client.totalSpent)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Voir détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setEditingClient(client)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun client trouvé</p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddClient}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onEdit={handleEditClient}
        />
      )}

      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default ClientList;
