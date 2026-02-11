import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const checkAuth = () => {
  const token = localStorage.getItem('adminToken');
  const userStr = localStorage.getItem('adminUser');
  if (!token || !userStr) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Invalid admin user data in localStorage:', e);
    return null;
  }
};

const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    approved: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-orange-100 text-orange-800',
  };
  const labels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    approved: 'Approuvé',
    published: 'Publié',
    active: 'Actif',
    suspended: 'Suspendu',
    inactive: 'Inactif',
    completed: 'Terminé',
    cancelled: 'Annulé',
    paid: 'Payé',
    unpaid: 'En attente',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'salons', label: 'Salons', icon: '🏪' },
  { id: 'professionals', label: 'Professionnels', icon: '👤' },
  { id: 'clients', label: 'Clients', icon: '👥' },
  { id: 'appointments', label: 'Rendez-vous', icon: '📅' },
  { id: 'payments', label: 'Paiements', icon: '💳' },
  { id: 'communications', label: 'Communications', icon: '📩' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [salonSearch, setSalonSearch] = useState('');
  const [salonStatusFilter, setSalonStatusFilter] = useState('');
  
  // Data states
  const [stats, setStats] = useState({});
  const [salons, setSalons] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  
  // Filters
  const [salonFilter, setSalonFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const adminUser = checkAuth();
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch stats
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (e) {
        console.error('Erreur stats:', e);
      }

      // Fetch salons
      try {
        const salonsRes = await fetch('http://localhost:5000/api/admin/all-salons', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (salonsRes.ok) {
          setSalons(await salonsRes.json());
        }
      } catch (e) {
        console.error('Erreur salons:', e);
      }

      // Fetch professionals
      try {
        const prosRes = await fetch('http://localhost:5000/api/admin/professionals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (prosRes.ok) {
          setProfessionals(await prosRes.json());
        }
      } catch (e) {
        console.error('Erreur professionnels:', e);
      }

      // Fetch clients
      try {
        const clientsRes = await fetch('http://localhost:5000/api/admin/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (clientsRes.ok) {
          setClients(await clientsRes.json());
        }
      } catch (e) {
        console.error('Erreur clients:', e);
      }

      // Fetch appointments
      try {
        const aptsRes = await fetch('http://localhost:5000/api/admin/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aptsRes.ok) {
          setAppointments(await aptsRes.json());
        }
      } catch (e) {
        console.error('Erreur appointments:', e);
      }

      // Fetch payments
      try {
        const paysRes = await fetch('http://localhost:5000/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (paysRes.ok) {
          setPayments(await paysRes.json());
        }
      } catch (e) {
        console.error('Erreur payments:', e);
      }

      // Fetch demo requests
      try {
        const demoRes = await fetch('http://localhost:5000/api/demo-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (demoRes.ok) {
          setDemoRequests(await demoRes.json());
        }
      } catch (e) {
        console.error('Erreur demo requests:', e);
      }

      // Fetch categories
      try {
        const catRes = await fetch('http://localhost:5000/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
      } catch (e) {
        console.error('Erreur categories:', e);
      }

      // Fetch settings
      try {
        const setRes = await fetch('http://localhost:5000/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (setRes.ok) {
          setSettings(await setRes.json());
        }
      } catch (e) {
        console.error('Erreur settings:', e);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // === Actions ===

  const handleAcceptDemo = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/demo-requests/${id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Demande approuvée avec succès!' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleRejectDemo = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/demo-requests/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Demande refusée' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Erreur' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleApproveSalon = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/salons/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Salon approuvé avec succès' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'approbation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleRejectSalon = async (id) => {
    const reason = prompt('Raison du refus (optionnel):');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/salons/${id}/reject`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Salon refusé' });
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors du refus' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handlePublishSalon = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/salons/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Salon publié' });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleToggleSalon = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/salons/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Statut du salon mis à jour' });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleTogglePro = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/professionals/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Statut du professionnel mis à jour' });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleResetPassword = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/professionals/${id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: `Mot de passe réinitialisé: ${data.tempPassword}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleToggleClient = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/clients/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Statut du client mis à jour' });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Rendez-vous annulé' });
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const handleExportPayments = () => {
    window.open('http://localhost:5000/api/admin/payments/export', '_blank');
  };

  const handleViewSalon = (salon) => {
    setSelectedSalon(salon);
    setShowSalonModal(true);
  };

  const handleEditSalon = (salon) => {
    setEditForm({
      id: salon.id,
      name: salon.name,
      address: salon.address || '',
      city: salon.city || '',
      category: salon.category || '',
      description: salon.description || '',
      depositRequired: salon.depositRequired || false,
      cancellationDelay: salon.cancellationDelay || '24',
    });
    setShowEditModal(true);
  };

  const handleSaveSalon = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/salons/${editForm.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Salon modifié avec succès' });
        setShowEditModal(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la modification' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // === Renders ===

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vue générale</h2>
        <span className="text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right">✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Salons actifs</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeSalons || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏪</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Professionnels</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalProfessionals || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">👤</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Clients</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalClients || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">RDV aujourd'hui</p>
                  <p className="text-3xl font-bold mt-1">{stats.appointmentsToday || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">📅</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">RDV cette semaine</p>
                  <p className="text-3xl font-bold mt-1">{stats.appointmentsWeek || 0}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">📆</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">RDV ce mois</p>
                  <p className="text-3xl font-bold mt-1">{stats.appointmentsMonth || 0}</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">🗓️</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Chiffre d'affaires</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalRevenue?.toFixed(0) || '0'} FCA</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Acomptes encaissés</p>
                  <p className="text-3xl font-bold mt-1">{stats.depositsCollected?.toFixed(0) || '0'} FCA</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">💵</div>
              </div>
            </div>
          </div>

          {/* Quick actions row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setActiveTab('salons')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="font-semibold">Gérer les salons</p>
              <p className="text-sm text-gray-500">{stats.totalSalons || 0} salons</p>
            </button>
            <button onClick={() => setActiveTab('communications')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="font-semibold">Demandes de démo</p>
              <p className="text-sm text-gray-500">{stats.pendingDemoRequests || 0} en attente</p>
            </button>
            <button onClick={() => setActiveTab('payments')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="font-semibold">Voir les paiements</p>
              <p className="text-sm text-gray-500">{payments.length || 0} transactions</p>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSalons = () => {
    const pendingSalons = salons.filter(s => s.approvalStatus === 'pending');
    const filteredSalons = salons.filter(salon => {
      const matchesSearch = salonSearch === '' || 
        salon.name.toLowerCase().includes(salonSearch.toLowerCase()) ||
        salon.city?.toLowerCase().includes(salonSearch.toLowerCase()) ||
        salon.user?.name?.toLowerCase().includes(salonSearch.toLowerCase());
      const matchesStatus = salonStatusFilter === '' || salon.approvalStatus === salonStatusFilter;
      return matchesSearch && matchesStatus;
    });
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Gestion des salons</h2>
          <span className="text-gray-500">{filteredSalons.length} / {salons.length} salons</span>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Rechercher un salon..."
                value={salonSearch}
                onChange={(e) => setSalonSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSalonStatusFilter('')}
                className={`px-4 py-2 rounded-lg text-sm ${salonStatusFilter === '' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} hover:bg-purple-700 transition`}
              >
                Tous
              </button>
              <button 
                onClick={() => setSalonStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm ${salonStatusFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'} hover:bg-orange-600 transition`}
              >
                En attente
              </button>
              <button 
                onClick={() => setSalonStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm ${salonStatusFilter === 'approved' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'} hover:bg-blue-600 transition`}
              >
                Approuvés
              </button>
              <button 
                onClick={() => setSalonStatusFilter('published')}
                className={`px-4 py-2 rounded-lg text-sm ${salonStatusFilter === 'published' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'} hover:bg-green-600 transition`}
              >
                Publiés
              </button>
              <button 
                onClick={() => setSalonStatusFilter('suspended')}
                className={`px-4 py-2 rounded-lg text-sm ${salonStatusFilter === 'suspended' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'} hover:bg-red-600 transition`}
              >
                Suspendus
              </button>
            </div>
          </div>
        </div>

        {/* Pending approvals */}
        {pendingSalons.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">Salons en attente d'approbation ({pendingSalons.length})</h3>
            <div className="space-y-3">
              {pendingSalons.map((salon) => (
                <div key={salon.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                      {salon.category === 'salon' ? '💇' : salon.category === 'barbier' ? '🪒' : salon.category === 'institut' ? '💅' : '✨'}
                    </div>
                    <div>
                      <p className="font-medium">{salon.name}</p>
                      <p className="text-sm text-gray-500">{salon.user?.name} • {salon.city || 'Ville non spécifiée'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewSalon(salon)} className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600">
                      Voir
                    </button>
                    <button onClick={() => handleApproveSalon(salon.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                      Approuver
                    </button>
                    <button onClick={() => handleRejectSalon(salon.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All salons table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Salon</th>
                <th className="p-4">Propriétaire</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Ville</th>
                <th className="p-4">Type</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalons.map((salon) => (
                <tr key={salon.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                        {salon.category === 'salon' ? '💇' : salon.category === 'barbier' ? '🪒' : salon.category === 'institut' ? '💅' : '✨'}
                      </div>
                      <span className="font-medium">{salon.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{salon.user?.name || 'Non spécifié'}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p>{salon.user?.email || '-'}</p>
                      <p className="text-gray-500">{salon.user?.phone || '-'}</p>
                    </div>
                  </td>
                  <td className="p-4">{salon.city || 'Non spécifiée'}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {salon.category === 'salon' ? 'Coiffure' : salon.category === 'barbier' ? 'Barbier' : salon.category === 'institut' ? 'Institut' : salon.category === 'spa' ? 'Spa' : salon.category}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(salon.approvalStatus || 'pending')}
                    {salon.isActive && salon.approvalStatus === 'published' && (
                      <span className="ml-2 inline-flex items-center text-xs text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        En ligne
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleViewSalon(salon)} className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600" title="Voir les détails">
                        👁️
                      </button>
                      <button onClick={() => handleEditSalon(salon)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600" title="Modifier">
                        ✏️
                      </button>
                      {salon.approvalStatus === 'approved' && (
                        <button onClick={() => handlePublishSalon(salon.id)} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600" title="Publier">
                          📢
                        </button>
                      )}
                      {(salon.approvalStatus === 'published' || salon.approvalStatus === 'approved') && (
                        <button onClick={() => handleToggleSalon(salon.id)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600" title={salon.isActive ? 'Suspendre' : 'Réactiver'}>
                          {salon.isActive ? '⏸️' : '▶️'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSalons.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Aucun salon trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfessionals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des professionnels</h2>
        <span className="text-gray-500">{professionals.length} professionnels</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Salon</th>
              <th className="p-4">Inscription</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map((pro) => (
              <tr key={pro.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{pro.name}</td>
                <td className="p-4">{pro.email}</td>
                <td className="p-4">{pro.phone}</td>
                <td className="p-4">{pro.salon}</td>
                <td className="p-4">{pro.createdAt}</td>
                <td className="p-4">{getStatusBadge(pro.status)}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleTogglePro(pro.id)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600">
                      {pro.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => handleResetPassword(pro.id)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                      Reset MDP
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {professionals.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Aucun professionnel</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des clients</h2>
        <span className="text-gray-500">{clients.length} clients</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4">Nom</th>
              <th className="p-4">Email</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">RDV</th>
              <th className="p-4">Total dépensé</th>
              <th className="p-4">Dernière visite</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{client.name}</td>
                <td className="p-4">{client.email}</td>
                <td className="p-4">{client.phone}</td>
                <td className="p-4">{client.totalAppointments}</td>
                <td className="p-4">{client.totalSpent?.toFixed(0) || '0'} FCA</td>
                <td className="p-4">{client.lastVisit}</td>
                <td className="p-4">{getStatusBadge(client.status)}</td>
                <td className="p-4">
                  <button onClick={() => handleToggleClient(client.id)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600">
                    {client.status === 'active' ? 'Suspendre' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">Aucun client</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAppointments = () => {
    const filteredAppointments = appointments.filter(apt => {
      if (salonFilter && apt.salon !== salonFilter) return false;
      if (statusFilter && apt.status !== statusFilter) return false;
      if (dateFilter && apt.date !== dateFilter) return false;
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestion des rendez-vous</h2>
          <span className="text-gray-500">{appointments.length} rendez-vous</span>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select className="p-2 border rounded-lg" value={salonFilter} onChange={e => setSalonFilter(e.target.value)}>
            <option value="">Tous les salons</option>
            {[...new Set(appointments.map(a => a.salon))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" className="p-2 border rounded-lg" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          <select className="p-2 border rounded-lg" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Client</th>
                <th className="p-4">Salon</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date</th>
                <th className="p-4">Heure</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Paiement</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{apt.client}<br/><span className="text-xs text-gray-500">{apt.clientEmail}</span></td>
                  <td className="p-4">{apt.salon}</td>
                  <td className="p-4">{apt.service}</td>
                  <td className="p-4">{apt.date}</td>
                  <td className="p-4">{apt.time}</td>
                  <td className="p-4">{apt.price} FCA</td>
                  <td className="p-4">{getStatusBadge(apt.status)}</td>
                  <td className="p-4">{getStatusBadge(apt.paid ? 'paid' : 'unpaid')}</td>
                  <td className="p-4">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button onClick={() => handleCancelAppointment(apt.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr><td colSpan="9" className="p-8 text-center text-gray-500">Aucun rendez-vous</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPayments = () => {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Paiements & finances</h2>
          <button onClick={handleExportPayments} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Total transactions</p>
            <p className="text-3xl font-bold mt-1">{payments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Montant total</p>
            <p className="text-3xl font-bold mt-1">{totalAmount.toFixed(0)} FCA</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Payé</p>
            <p className="text-3xl font-bold mt-1">{paidAmount.toFixed(0)} FCA</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Salon</th>
                <th className="p-4">Client</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">#{payment.id}</td>
                  <td className="p-4">{payment.date}</td>
                  <td className="p-4">{payment.type}</td>
                  <td className="p-4">{payment.amount.toFixed(0)} FCA</td>
                  <td className="p-4">{payment.salon}</td>
                  <td className="p-4">{payment.client}</td>
                  <td className="p-4">{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Aucun paiement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDemoRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Demandes de démo</h2>
        <button onClick={fetchData} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Rafraîchir
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="p-4">Salon</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Email</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Ville</th>
              <th className="p-4">Date</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoRequests.map((request) => (
              <tr key={request.id} className="border-t">
                <td className="p-4 font-medium">{request.salonName || 'Non spécifié'}</td>
                <td className="p-4">{request.contactName}</td>
                <td className="p-4">{request.email}</td>
                <td className="p-4">{request.phone || 'Non spécifié'}</td>
                <td className="p-4">{request.city || 'Non spécifiée'}</td>
                <td className="p-4">{new Date(request.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="p-4">{getStatusBadge(request.status)}</td>
                <td className="p-4">
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptDemo(request.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Accepter</button>
                      <button onClick={() => handleRejectDemo(request.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Refuser</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {demoRequests.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">Aucune demande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Communications</h2>
      
      {/* Demo requests section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Demandes de démo en attente</h3>
        <p className="text-gray-500 mb-4">{demoRequests.filter(r => r.status === 'pending').length} demandes</p>
        <button onClick={() => setActiveTab('communications')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Gérer les demandes
        </button>
      </div>

      {/* Send email section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Envoyer un email</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/admin/send-email', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            if (response.ok) {
              setMessage({ type: 'success', text: 'Email envoyé avec succès' });
              e.target.reset();
            }
          } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' });
          }
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Destinataires</label>
            <select name="target" className="w-full p-2 border rounded-lg">
              <option value="all">Tous les utilisateurs</option>
              <option value="professionals">Professionnels uniquement</option>
              <option value="clients">Clients uniquement</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sujet</label>
            <input type="text" name="subject" className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Contenu (HTML)</label>
            <textarea name="content" className="w-full p-2 border rounded-lg h-32" required></textarea>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );

  const renderSettings = () => {
    const [activeSection, setActiveSection] = useState('categories');
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '' });
    
    const handleAddCategory = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/admin/categories', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(newCategory)
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Catégorie ajoutée' });
          setNewCategory({ name: '', slug: '', icon: '' });
          fetchData();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de l\'ajout' });
      }
    };

    const handleDeleteCategory = async (id) => {
      if (!confirm('Supprimer cette catégorie ?')) return;
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Catégorie supprimée' });
          fetchData();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    };

    const handleSaveSettings = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/admin/settings', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès' });
          fetchData();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
      }
    };

    const handleSaveSecurity = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/admin/settings/security', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Paramètres de sécurité mis à jour' });
          fetchData();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur' });
      }
    };

    const handleSaveCancellation = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/admin/settings/cancellation', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          setMessage({ type: 'success', text: 'Règles d\'annulation mises à jour' });
          fetchData();
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur' });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Paramètres globaux</h2>
          <span className="text-gray-500">Administration du système</span>
        </div>

        {message && (
          <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right">✕</button>
          </div>
        )}

        {/* Section tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'categories', label: 'Catégories', icon: '📁' },
            { id: 'commissions', label: 'Commissions', icon: '💰' },
            { id: 'cancellation', label: 'Annulations', icon: '🚫' },
            { id: 'security', label: 'Sécurité', icon: '🔒' },
            { id: 'roles', label: 'Rôles & Permissions', icon: '👥' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeSection === tab.id ? 'bg-purple-600 text-white' : 'bg-white border hover:bg-gray-50'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div className="space-y-6">
            {/* Add category form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Ajouter une catégorie</h3>
              <form onSubmit={handleAddCategory} className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Nom (ex: Salon de coiffure)"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1 min-w-48 p-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (ex: salon)"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-32 p-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Icône (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-24 p-2 border rounded-lg"
                />
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Ajouter
                </button>
              </form>
            </div>

            {/* Categories list */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Catégories existantes ({categories.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon || '📁'}</span>
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="col-span-4 text-gray-500 text-center py-8">Aucune catégorie définie</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Commissions Section */}
        {activeSection === 'commissions' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Commissions de la plateforme</h3>
            <form onSubmit={handleSaveSettings}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Commission plateforme (%)</label>
                  <input
                    type="number"
                    name="platformFee"
                    defaultValue={settings.platformFee || 10}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pourcentage prélevé sur chaque transaction</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Acompte minimum (%)</label>
                  <input
                    type="number"
                    name="minDepositPercent"
                    defaultValue={settings.minDepositPercent || 20}
                    min="0"
                    max="100"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pourcentage minimum pour valider une réservation</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Frais de service fixe (FCA)</label>
                  <input
                    type="number"
                    name="fixedServiceFee"
                    defaultValue={settings.fixedServiceFee || 100}
                    min="0"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Frais additionnels par réservation</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Réservation maximum (jours)</label>
                  <input
                    type="number"
                    name="maxAdvanceBookingDays"
                    defaultValue={settings.maxAdvanceBookingDays || 90}
                    min="1"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Délai maximum pour réservations à venir</p>
                </div>
              </div>
              <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Enregistrer les commissions
              </button>
            </form>

            {/* Commission summary */}
            <div className="mt-8 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-2">Récapitulatif financier</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Commission actuelle</p>
                  <p className="font-bold text-purple-700">{settings.platformFee || 10}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Acompte minimum</p>
                  <p className="font-bold">{settings.minDepositPercent || 20}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Frais fixes</p>
                  <p className="font-bold">{settings.fixedServiceFee || 100} FCA</p>
                </div>
                <div>
                  <p className="text-gray-500">Réservation max</p>
                  <p className="font-bold">{settings.maxAdvanceBookingDays || 90} jours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Rules Section */}
        {activeSection === 'cancellation' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Règles d'annulation</h3>
            <form onSubmit={handleSaveCancellation}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Délai d'annulation gratuit (heures)</label>
                  <input
                    type="number"
                    name="freeCancellationHours"
                    defaultValue={settings.freeCancellationHours || 24}
                    min="0"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Avant le RDV pour annulation sans frais</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Délai modification (heures)</label>
                  <input
                    type="number"
                    name="modificationHours"
                    defaultValue={settings.modificationHours || 12}
                    min="0"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Délai minimum pour modifier un RDV</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pénalité d'annulation tardive (%)</label>
                  <input
                    type="number"
                    name="lateCancellationPenalty"
                    defaultValue={settings.lateCancellationPenalty || 50}
                    min="0"
                    max="100"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pourcentage de l'acompte retenu</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">RDV max par jour (client)</label>
                  <input
                    type="number"
                    name="maxAppointmentsPerDay"
                    defaultValue={settings.maxAppointmentsPerDay || 3}
                    min="1"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Limiter les réservations abusives</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowNoShowPenalty"
                    defaultChecked={settings.allowNoShowPenalty}
                    className="w-5 h-5 rounded"
                  />
                  <span>Autoriser la pénalité pour non-présentation (no-show)</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requireDepositAll"
                    defaultChecked={settings.requireDepositAll}
                    className="w-5 h-5 rounded"
                  />
                  <span>Exiger un acompte pour toutes les réservations</span>
                </label>
              </div>

              <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Enregistrer les règles
              </button>
            </form>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Paramètres de sécurité</h3>
            <form onSubmit={handleSaveSecurity}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Longueur min. mot de passe</label>
                  <input
                    type="number"
                    name="passwordMinLength"
                    defaultValue={settings.passwordMinLength || 8}
                    min="4"
                    max="32"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Session timeout (heures)</label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    defaultValue={settings.sessionTimeout || 24}
                    min="1"
                    max="168"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max tentatives de connexion</label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    defaultValue={settings.maxLoginAttempts || 5}
                    min="1"
                    max="10"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Avant verrouillage du compte</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Verrouillage temporaire (minutes)</label>
                  <input
                    type="number"
                    name="lockoutMinutes"
                    defaultValue={settings.lockoutMinutes || 30}
                    min="5"
                    max="1440"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="requireUppercase" defaultChecked={settings.requireUppercase} className="w-5 h-5 rounded" />
                  <span>Exiger une majuscule dans le mot de passe</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="requireNumber" defaultChecked={settings.requireNumber} className="w-5 h-5 rounded" />
                  <span>Exiger un chiffre dans le mot de passe</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="requireSpecialChar" defaultChecked={settings.requireSpecialChar} className="w-5 h-5 rounded" />
                  <span>Exiger un caractère spécial dans le mot de passe</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="twoFactorAuth" defaultChecked={settings.twoFactorAuth} className="w-5 h-5 rounded" />
                  <span>Activer l'authentification à deux facteurs (2FA)</span>
                </label>
              </div>

              <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Enregistrer la sécurité
              </button>
            </form>
          </div>
        )}

        {/* Roles & Permissions Section */}
        {activeSection === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Rôles du système</h3>
              <div className="space-y-4">
                {[
                  { name: 'Super Admin', color: 'bg-red-100 text-red-800', permissions: ['all'] },
                  { name: 'Admin', color: 'bg-orange-100 text-orange-800', permissions: ['manage_users', 'manage_salons', 'view_analytics', 'manage_settings'] },
                  { name: 'Modérateur', color: 'bg-yellow-100 text-yellow-800', permissions: ['manage_salons', 'view_analytics'] },
                  { name: 'Support', color: 'bg-blue-100 text-blue-800', permissions: ['view_users', 'view_salons', 'manage_tickets'] },
                  { name: 'Comptable', color: 'bg-green-100 text-green-800', permissions: ['view_payments', 'export_data'] },
                ].map((role, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>{role.name}</span>
                      <span className="text-sm text-gray-500">
                        {role.permissions.includes('all') ? 'Toutes les permissions' : role.permissions.join(', ')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {index === 0 ? 'Système' : index} rôle(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Permissions disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {['manage_users', 'manage_salons', 'manage_appointments', 'manage_payments', 'view_analytics', 'manage_settings', 'manage_communications', 'export_data', 'manage_categories', 'manage_roles'].map(perm => (
                  <div key={perm} className="p-2 bg-gray-50 rounded">
                    <code className="text-xs text-purple-600">{perm}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Déconnexion
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'salons': return renderSalons();
      case 'professionals': return renderProfessionals();
      case 'clients': return renderClients();
      case 'appointments': return renderAppointments();
      case 'payments': return renderPayments();
      case 'communications': return renderDemoRequests();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-purple-600">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                activeTab === item.id 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
