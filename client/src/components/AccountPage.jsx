import React, { useEffect, useState } from 'react';
import { useAuth, isProfessionalUser } from '../AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from './Footer';
import AppointmentCard from './AppointmentCard';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AccountPage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect professionals to their dashboard
    if (user && isProfessionalUser(user)) {
      navigate('/professional/dashboard');
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [token, navigate, user]);

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
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Séparer les rendez-vous à venir et passés
  const now = new Date();
  const upcomingAppointments = appointments.filter(appt => new Date(appt.startTime) > now);
  const pastAppointments = appointments.filter(appt => new Date(appt.startTime) <= now);

  // Initialiser l'onglet en fonction du paramètre URL
  const [tab, setTab] = useState(searchParams.get('tab') === 'appointments' ? 'upcoming' : 'profile');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar avec fond blanc */}
      <nav className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        <h1 
          className="text-xl md:text-2xl font-bold tracking-tighter cursor-pointer text-black" 
          onClick={() => navigate('/')}
        >
          PLANITY
        </h1>
        
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => navigate('/professional')}
            className="hidden sm:block bg-gray-100 text-gray-800 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Je suis un professionnel
          </button>
          
          <button 
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Mes RDV
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-black transition-colors shadow-sm"
              >
                <span className="truncate max-w-25 md:max-w-none">{user.name || user.firstName || 'Mon compte'}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium hover:bg-black transition-colors shadow-sm"
            >
              Mon compte
            </button>
          )}
        </div>
      </nav>

      {/* Contenu avec plus d'espace */}
      <div className="bg-gray-100 min-h-screen py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Gauche */}
          <aside className="w-full md:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-8">Mon compte</h3>
            <ul className="space-y-6">
              <li className="font-bold border-l-4 border-black pl-3 -ml-6 cursor-pointer">
                Mes rendez-vous
              </li>
              <li 
                onClick={() => navigate('/account/settings')}
                className="text-gray-500 hover:text-black cursor-pointer pl-3 transition-colors"
              >
                Mes informations
              </li>
              <li 
                onClick={() => navigate('/account/proches')}
                className="text-gray-500 hover:text-black cursor-pointer pl-3 transition-colors"
              >
                Mes proches
              </li>
            </ul>
            <div className="mt-12 pt-8 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="text-red-400 font-semibold hover:text-red-600 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </aside>

          {/* Content Droite */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 h-fit">
              <h3 className="text-xl font-bold mb-6">Mes rendez-vous</h3>
              
              {/* Tabs */}
              <div className="mb-6">
                <button
                  onClick={() => setTab('upcoming')}
                  style={tab === 'upcoming' ? styles.tabActive : styles.tab}
                >
                  À venir ({upcomingAppointments.length})
                </button>
                <button
                  onClick={() => setTab('past')}
                  style={tab === 'past' ? styles.tabActive : styles.tab}
                >
                  Passés ({pastAppointments.length})
                </button>
              </div>
              
              {loading ? (
                <p className="text-gray-500">Chargement...</p>
              ) : tab === 'upcoming' ? (
                upcomingAppointments.length === 0 ? (
                  <>
                    <p className="text-gray-500 mb-8">Vous n'avez pas encore pris de rdv.</p>
                    <button 
                      onClick={() => navigate('/search')}
                      className="bg-[#1A1A1A] text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-all"
                    >
                      Prendre RDV
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        onCancel={cancelAppointment}
                      />
                    ))}
                  </div>
                )
              ) : (
                pastAppointments.length === 0 ? (
                  <p className="text-gray-500">Vous n'avez aucun rendez-vous passé.</p>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        onCancel={cancelAppointment}
                      />
                    ))}
                  </div>
                )
              )}

              {/* Bouton pour voir tous les RDV */}
              {upcomingAppointments.length > 0 && (
                <button 
                  onClick={() => navigate('/appointments')}
                  style={styles.viewAllButton}
                >
                  Voir tous mes rendez-vous →
                </button>
              )}
            </div>
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  viewAllButton: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '1.5rem',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    color: '#6B7280',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
  },
  tab: {
    padding: '0.5rem 1rem',
    backgroundColor: '#E5E7EB',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6B7280',
    marginRight: '0.5rem',
  },
  tabActive: {
    padding: '0.5rem 1rem',
    backgroundColor: '#111827',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#FFF',
    marginRight: '0.5rem',
  },
};

export default AccountPage;
