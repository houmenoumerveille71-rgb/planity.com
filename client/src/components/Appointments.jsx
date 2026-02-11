import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import BookingModal from './BookingModal';
import CalendarView from './CalendarView';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Appointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [tab, setTab] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        setMessage('Erreur lors de la récupération des rendez-vous.');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMessage('Rendez-vous annulé avec succès.');
        fetchAppointments(); // Refresh list
      } else {
        setMessage('Erreur lors de l\'annulation.');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('Erreur réseau.');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleUpdate = () => {
    setEditingAppointment(null);
    fetchAppointments(); // Refresh list
  };

  const handlePay = async (invoiceId) => {
    // Simulation de paiement
    try {
      // En réalité, utiliser Stripe pour le paiement
      // Pour la démo, on marque comme payé
      const response = await fetch(`${API_BASE}/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setMessage('Paiement effectué avec succès.');
        fetchAppointments();
      } else {
        setMessage('Erreur lors du paiement.');
      }
    } catch (err) {
      setMessage('Erreur réseau.');
    }
  };

  // Séparer les rendez-vous à venir et passés
  const now = new Date();
  const upcomingAppointments = appointments.filter(appt => new Date(appt.startTime) > now);
  const pastAppointments = appointments.filter(appt => new Date(appt.startTime) <= now);

  // Calculer les statistiques
  const totalSpent = pastAppointments.reduce((sum, appt) => {
    return sum + (appt.service?.price || 0);
  }, 0);

  const uniqueSalons = [...new Set(pastAppointments.map(appt => appt.salon?.name))].length;
  const uniqueServices = [...new Set(pastAppointments.map(appt => appt.service?.name))].length;

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Mes rendez-vous</h1>
      {message && <p className="mb-4 text-sm">{message}</p>}

      {/* Statistiques */}
      {pastAppointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600">Total dépensé</p>
            <p className="text-2xl font-bold text-purple-600">{totalSpent.toFixed(2)} FCFA</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600">Salons visités</p>
            <p className="text-2xl font-bold text-blue-600">{uniqueSalons}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600">Services réservés</p>
            <p className="text-2xl font-bold text-green-600">{uniqueServices}</p>
          </div>
        </div>
      )}

      {/* Toggle view */}
      <div className="mb-6">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-l ${view === 'list' ? 'bg-black text-white' : 'bg-gray-200'}`}
        >
          Liste
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-r ${view === 'calendar' ? 'bg-black text-white' : 'bg-gray-200'}`}
        >
          Calendrier
        </button>
      </div>

      {view === 'list' && (
        <>
          {/* Tabs pour les rendez-vous */}
          <div className="mb-6">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-4 py-2 rounded-l ${tab === 'upcoming' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              À venir ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-4 py-2 rounded-r ${tab === 'past' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              Passés ({pastAppointments.length})
            </button>
          </div>

          {tab === 'upcoming' ? (
            upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Vous n'avez aucun rendez-vous à venir.</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="mt-4 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
                >
                  Réserver un rendez-vous
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <h3 className="font-bold text-lg">{appt.service.name}</h3>
                      <p className="text-gray-600">{appt.salon.name} - {appt.salon.address}</p>
                      <p className="text-sm text-gray-500">
                        📅 {new Date(appt.startTime).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        ⏰ {new Date(appt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">
                        ⏱️ {appt.service.duration} min
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {appt.invoice && appt.invoice.status === 'paid' && (
                        <span className="text-green-600 font-bold text-sm">✓ Acompte payé</span>
                      )}
                      {appt.invoice && appt.invoice.status === 'unpaid' && (
                        <button
                          onClick={() => handlePay(appt.invoice.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                        >
                          Payer {appt.invoice.amount} FCFA
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(appt)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => cancelAppointment(appt.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            pastAppointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Vous n'avez aucun rendez-vous passé.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appt) => (
                  <div key={appt.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-700">{appt.service.name}</h3>
                        <p className="text-gray-600">{appt.salon.name} - {appt.salon.address}</p>
                        <p className="text-sm text-gray-500">
                          📅 {new Date(appt.startTime).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500">
                          ⏰ {new Date(appt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{appt.service.price} FCFA</p>
                        <p className="text-sm text-gray-500">{appt.service.duration} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {view === 'calendar' && (
        <CalendarView appointments={appointments} />
      )}

      {editingAppointment && (
        <BookingModal
          salonId={editingAppointment.salonId}
          onClose={() => setEditingAppointment(null)}
          isEdit={true}
          appointment={editingAppointment}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default Appointments;
