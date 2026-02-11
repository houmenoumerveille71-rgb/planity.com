import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { MapPin, Calendar, Trash2, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AccountPage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [token, navigate]);

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
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

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

  const [tab, setTab] = useState('upcoming'); // 'upcoming' or 'past'

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar avec fond blanc */}
      <nav className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between sticky top-0 z-50">
        <h1 
          className="text-2xl font-bold tracking-tighter cursor-pointer text-black" 
          onClick={() => navigate('/')}
        >
          PLANITY
        </h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/professional')}
            className="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Je suis un professionnel de beauté
          </button>
          
          <button 
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Mes rendez-vous
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-sm"
              >
                <span>{user.name || user.firstName || 'Mon compte'}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-sm"
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
                      <div key={appt.id} style={styles.card}>
                        {/* Date Header */}
                        <div style={styles.dateHeader}>
                          {formatDate(appt.startTime)}
                        </div>

                        {/* Card Content */}
                        <div style={styles.cardContent}>
                          {/* Image */}
                          <div style={styles.imageContainer}>
                            {appt.salon?.image ? (
                              <img 
                                src={appt.salon.image} 
                                alt={appt.salon?.name || 'Salon'} 
                                style={styles.image}
                              />
                            ) : (
                              <div style={styles.imagePlaceholder}>
                                💅
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div style={styles.details}>
                            {/* Title */}
                            <h3 style={styles.title}>
                              {appt.service?.name || 'Prestation'}
                              {appt.salon?.name && ` - ${appt.salon.name}`}
                            </h3>

                            {/* Address */}
                            {appt.salon?.address && (
                              <div style={styles.info}>
                                <MapPin size={16} style={styles.icon} />
                                <span style={styles.infoText}>{appt.salon.address}</span>
                              </div>
                            )}

                            {/* Service & Duration */}
                            <div style={styles.info}>
                              <Clock size={16} style={styles.icon} />
                              <span style={styles.infoText}>
                                {appt.service?.name || 'Service'} • {appt.service?.duration || 30}min
                              </span>
                            </div>

                            {/* Price */}
                            <div style={styles.info}>
                              <span style={styles.priceIcon}>💶</span>
                              <span style={styles.price}>{appt.service?.price || 0} €</span>
                            </div>

                            {/* Actions */}
                            <div style={styles.actions}>
                              <button style={styles.buttonOutline}>
                                <Calendar size={18} />
                                Ajouter à mon agenda
                              </button>

                              <button 
                                style={styles.buttonOutline}
                                onClick={() => cancelAppointment(appt.id)}
                              >
                                <Trash2 size={18} />
                                Annuler le RDV
                              </button>

                              <button 
                                style={styles.buttonPrimary}
                                onClick={() => navigate('/appointments')}
                              >
                                Déplacer le RDV
                              </button>
                            </div>

                            {/* Notification Toggle */}
                            <div style={styles.notification}>
                              <label style={styles.toggleLabel}>
                                <input
                                  type="checkbox"
                                  checked={notifyWhenAvailable[appt.id] || false}
                                  onChange={(e) => setNotifyWhenAvailable({...notifyWhenAvailable, [appt.id]: e.target.checked})}
                                  style={styles.toggleInput}
                                />
                                <div style={{
                                  ...styles.toggle,
                                  backgroundColor: notifyWhenAvailable[appt.id] ? '#6366F1' : '#E5E7EB'
                                }}>
                                  <div style={{
                                    ...styles.toggleCircle,
                                    transform: notifyWhenAvailable[appt.id] ? 'translateX(24px)' : 'translateX(2px)'
                                  }} />
                                </div>
                                <span style={styles.toggleText}>
                                  Me prévenir si un RDV se libère avant
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                pastAppointments.length === 0 ? (
                  <p className="text-gray-500">Vous n'avez aucun rendez-vous passé.</p>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appt) => (
                      <div key={appt.id} style={styles.card}>
                        {/* Date Header */}
                        <div style={styles.dateHeader}>
                          {formatDate(appt.startTime)}
                        </div>

                        {/* Card Content */}
                        <div style={styles.cardContent}>
                          {/* Image */}
                          <div style={styles.imageContainer}>
                            {appt.salon?.image ? (
                              <img 
                                src={appt.salon.image} 
                                alt={appt.salon?.name || 'Salon'} 
                                style={styles.image}
                              />
                            ) : (
                              <div style={styles.imagePlaceholder}>
                                💅
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div style={styles.details}>
                            {/* Title */}
                            <h3 style={styles.title}>
                              {appt.service?.name || 'Prestation'}
                              {appt.salon?.name && ` - ${appt.salon.name}`}
                            </h3>

                            {/* Address */}
                            {appt.salon?.address && (
                              <div style={styles.info}>
                                <MapPin size={16} style={styles.icon} />
                                <span style={styles.infoText}>{appt.salon.address}</span>
                              </div>
                            )}

                            {/* Service & Duration */}
                            <div style={styles.info}>
                              <Clock size={16} style={styles.icon} />
                              <span style={styles.infoText}>
                                {appt.service?.name || 'Service'} • {appt.service?.duration || 30}min
                              </span>
                            </div>

                            {/* Price */}
                            <div style={styles.info}>
                              <span style={styles.priceIcon}>💶</span>
                              <span style={styles.price}>{appt.service?.price || 0} €</span>
                            </div>
                          </div>
                        </div>
                      </div>
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
  },
  dateHeader: {
    backgroundColor: '#F9FAFB',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    borderBottom: '1px solid #E5E7EB',
  },
  cardContent: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
  },
  imageContainer: {
    flexShrink: 0,
  },
  image: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  info: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  icon: {
    color: '#6B7280',
    flexShrink: 0,
    marginTop: '2px',
  },
  priceIcon: {
    fontSize: '1rem',
  },
  infoText: {
    fontSize: '0.9rem',
    color: '#6B7280',
    lineHeight: '1.5',
  },
  price: {
    fontSize: '0.9rem',
    color: '#111827',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  buttonOutline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#111827',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#FFF',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  notification: {
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #F3F4F6',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  toggleInput: {
    display: 'none',
  },
  toggle: {
    position: 'relative',
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    transition: 'background-color 0.3s',
  },
  toggleCircle: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFF',
    transition: 'transform 0.3s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleText: {
    fontSize: '0.875rem',
    color: '#6B7280',
    fontWeight: '500',
  },
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
