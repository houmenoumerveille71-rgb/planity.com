import { useEffect, useState } from 'react';
import { useAuth, isProfessionalUser } from '../AuthContext';
import AppointmentCard from './AppointmentCard';
import BookingModal from './BookingModal';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Appointments = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [tab, setTab] = useState('upcoming'); // 'upcoming' or 'past'

  useEffect(() => {
    // Redirect professionals to their dashboard
    if (user && isProfessionalUser(user)) {
      navigate('/professional/dashboard');
      return;
    }

    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchAppointments();
  }, [token, user, navigate]);

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
      setMessage('Erreur réseau.');
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
        setMessage('Rendez-vous annulé avec succès.');
        fetchAppointments();
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Erreur lors de l\'annulation.');
      }
    } catch (err) {
      setMessage('Erreur réseau.');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleUpdate = () => {
    setEditingAppointment(null);
    fetchAppointments();
  };

  const handleReschedule = () => {
    fetchAppointments();
  };

  // Séparer les rendez-vous à venir et passés
  const now = new Date();
  const upcomingAppointments = appointments.filter(appt => 
    new Date(appt.startTime) > now && appt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(appt => 
    new Date(appt.startTime) <= now || appt.status === 'cancelled'
  );

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Mes rendez-vous</h1>
      {message && <p style={styles.message}>{message}</p>}

      {/* Tabs pour les rendez-vous */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab('upcoming')}
          style={{
            ...styles.tabButton,
            ...(tab === 'upcoming' ? styles.tabButtonActive : styles.tabButtonInactive)
          }}
        >
          À venir ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setTab('past')}
          style={{
            ...styles.tabButton,
            ...(tab === 'past' ? styles.tabButtonActive : styles.tabButtonInactive)
          }}
        >
          Passés ({pastAppointments.length})
        </button>
      </div>

      {tab === 'upcoming' ? (
        upcomingAppointments.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Vous n'avez aucun rendez-vous à venir.</p>
            <button
              onClick={() => window.location.href = '/'}
              style={styles.primaryButton}
            >
              Réserver un rendez-vous
            </button>
          </div>
        ) : (
          <div style={styles.appointmentsList}>
            {upcomingAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={cancelAppointment}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        )
      ) : (
        pastAppointments.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Vous n'avez aucun rendez-vous passé.</p>
          </div>
        ) : (
          <div style={styles.appointmentsList}>
            {pastAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={cancelAppointment}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        )
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

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #111827',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: {
    padding: '1rem',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  tabButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    backgroundColor: '#111827',
    color: '#FFF',
  },
  tabButtonInactive: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: '1rem',
    marginBottom: '1.5rem',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#111827',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
};

export default Appointments;
