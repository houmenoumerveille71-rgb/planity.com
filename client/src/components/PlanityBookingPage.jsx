import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Star, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Jours de la semaine en français (du lundi au dimanche)
const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Créneaux horaires dynamiques basés sur les disponibilités du professionnel
const generateTimeSlots = (availabilities) => {
  if (!availabilities || availabilities.length === 0) {
    // Créneaux par défaut si aucune disponibilité n'est définie
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
    ];
  }

  // Trouver l'heure d'ouverture la plus tôt et la fermeture la plus tard
  let earliestStart = '08:00';
  let latestEnd = '23:00';

  for (const avail of availabilities) {
    if (avail.startTime && avail.startTime < earliestStart) {
      earliestStart = avail.startTime;
    }
    if (avail.endTime && avail.endTime > latestEnd) {
      latestEnd = avail.endTime;
    }
  }

  // Générer tous les créneaux de 30 minutes
  const slots = [];
  const [startHour, startMin] = earliestStart.split(':').map(Number);
  const [endHour, endMin] = latestEnd.split(':').map(Number);

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === endHour && min >= endMin) break;
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }

  return slots;
};

const PlanityBookingPage = () => {
  const { salonId, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  
  // Mode reschedule (déplacement de rendez-vous)
  const isReschedule = location.state?.reschedule || false;
  const rescheduleAppointmentId = location.state?.appointmentId || null;
  const rescheduleMessage = location.state?.message || '';
  
  const [salon, setSalon] = useState(null);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState([]);
  const [availabilities, setAvailabilities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState('sans-preference');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [weekStart, setWeekStart] = useState(getStartOfWeek());

  // Récupérer le début de la semaine (aujourd'hui)
  function getStartOfWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  }

  // Formater une date en "mercredi 11 févr."
  function formatDayLabel(date) {
    // Convertir getDay() (0=Domingo, 1=Lundi) vers l'index du tableau (0=Lundi, 6=Domingo)
    const dayIndex = (date.getDay() + 6) % 7;
    const dayName = DAYS_OF_WEEK[dayIndex].toLowerCase();
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'short' });
    return { day: dayName, date: `${day} ${month}` };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for salonId:', salonId, 'serviceId:', serviceId);
        
        let salonData = null;
        
        // Récupérer les détails du salon (sans cache)
        const salonResponse = await fetch(`${API_BASE}/salons/${salonId}?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log('Salon response status:', salonResponse.status);
        
        if (salonResponse.ok) {
          salonData = await salonResponse.json();
          console.log('Salon data:', salonData);
          setSalon(salonData);
        } else {
          console.error('Salon response not OK');
        }

        // Récupérer les services du salon
        if (salonData && salonData.services) {
          console.log('Services from salon:', salonData.services);
          const servicesData = salonData.services;
          const selectedService = servicesData.find(s => s.id === parseInt(serviceId));
          console.log('Selected service:', selectedService, 'looking for id:', parseInt(serviceId));
          if (selectedService) {
            setService(selectedService);
          }
        }

        // Utiliser les disponibilités incluses dans la réponse du salon
        if (salonData && salonData.availabilities) {
          console.log('Availabilities from salon:', salonData.availabilities);
          console.log('Nombre de plages horaires:', salonData.availabilities.length);
          setAvailabilities(salonData.availabilities);
        } else {
          console.log('Aucune disponibilité trouvée dans salonData.availabilities');
        }

        // Récupérer les collaborateurs (simulés pour l'instant)
        const mockStaff = [
          { id: 'sans-preference', name: 'Sans préférence', avatar: '⚙️' },
          { id: '1', name: 'Jean Dupont', avatar: 'J' },
          { id: '2', name: 'Marie Martin', avatar: 'M' },
          { id: '3', name: 'Pierre Durand', avatar: 'P' }
        ];
        setStaff(mockStaff);

      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [salonId, serviceId]);

  // Générer les 7 jours de la semaine
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Naviguer vers la semaine précédente
  const goToPreviousWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newStart);
  };

  // Naviguer vers la semaine suivante
  const goToNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newStart);
  };

  // Vérifier si un créneau est disponible (basé sur les vraies données de la BDD)
  const isTimeAvailable = (date, time) => {
    const dayOfWeek = date.getDay();
    
    // Si pas de disponibilités en BDD, retourner true par défaut (tous les créneaux disponibles)
    if (!availabilities || !Array.isArray(availabilities) || availabilities.length === 0) {
      console.log(`[DEBUG] Pas de disponibilités, créneau ${time} disponible par défaut`);
      return true;
    }
    
    // Trouver les disponibilités pour ce jour
    const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);
    console.log(`[DEBUG] Jour ${dayOfWeek}, disponibilités:`, dayAvailabilities);
    
    // Si pas de disponibilité pour ce jour, retourne false
    if (dayAvailabilities.length === 0) {
      console.log(`[DEBUG] Aucune disponibilité pour le jour ${dayOfWeek}, créneau ${time} non disponible`);
      return false;
    }
    
    // Vérifier si l'heure est dans une des plages horaires
    for (const availability of dayAvailabilities) {
      const start = availability.startTime; // HH:MM
      const end = availability.endTime; // HH:MM
      console.log(`[DEBUG] Vérification: ${time} >= ${start} && ${time} < ${end}`);
      
      // Comparer les heures (format HH:MM)
      if (time >= start && time < end) {
        console.log(`[DEBUG] Créneau ${time} DISPONIBLE`);
        return true;
      }
    }
    
    console.log(`[DEBUG] Créneau ${time} non disponible (hors plage horaire)`);
    return false;
  };

  // Sélectionner un créneau
  const handleTimeSelect = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  // Confirmer la réservation ou le déplacement
  const handleConfirmBooking = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user || !token) {
      navigate('/login?redirect=' + encodeURIComponent(`/booking/${salonId}/${serviceId}`));
      return;
    }
    
    if (!selectedTime || !selectedDate) {
      return;
    }
    
    setBookingLoading(true);
    
    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (isReschedule && rescheduleAppointmentId) {
        // Mode déplacement de rendez-vous - utiliser PATCH
        const response = await fetch(`${API_BASE}/appointments/${rescheduleAppointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            startTime: startTime.toISOString(),
          }),
        });
        
        if (response.ok) {
          // Rediriger vers la page du compte avec message de succès
          navigate('/account?tab=appointments&message=rdv-deplace');
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors du déplacement du rendez-vous');
        }
      } else {
        // Nouvelle réservation
        const response = await fetch(`${API_BASE}/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            salonId: parseInt(salonId),
            serviceId: parseInt(serviceId),
            startTime: startTime.toISOString(),
            staffId: selectedStaff === 'sans-preference' ? null : selectedStaff,
          }),
        });
        
        if (response.ok) {
          // Rediriger vers la page du compte avec l'onglet rendez-vous
          navigate('/account?tab=appointments');
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de la réservation');
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur réseau lors de la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <p>{error}</p>
            <button style={styles.backButton} onClick={() => navigate(-1)}>
              Retour
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!salon) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <p>Salon non trouvé</p>
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Le salon avec l'ID {salonId} n'existe pas.</p>
            <button style={styles.backButton} onClick={() => navigate('/')}>
              Retour à l'accueil
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <p>Service non trouvé</p>
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Le service avec l'ID {serviceId} n'existe pas dans ce salon.</p>
            <button style={styles.backButton} onClick={() => navigate(`/salon/${salonId}`)}>
              Voir les services du salon
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const weekDays = getWeekDays();

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        {/* Message de déplacement de rendez-vous */}
        {isReschedule && (
          <div style={styles.rescheduleBanner}>
            <span style={styles.rescheduleIcon}>📅</span>
            <span>{rescheduleMessage || 'Déplacement de votre rendez-vous'}</span>
            <button 
              style={styles.rescheduleCancel}
              onClick={() => navigate('/account?tab=appointments')}
            >
              Annuler
            </button>
          </div>
        )}
        
        {/* Salon Header */}
        <div style={styles.salonHeader}>
          <div style={styles.salonHeaderContent}>
            <h1 style={styles.salonName}>{salon.name}</h1>
            <div style={styles.salonMeta}>
              <MapPin size={14} style={styles.icon} />
              <span style={styles.address}>{salon.address}</span>
              <span style={styles.separator}>·</span>
              <Star size={14} fill="#FFB800" color="#FFB800" />
              <span style={styles.rating}>4.9 (245 avis)</span>
              <span style={styles.separator}>·</span>
              <span style={styles.priceLevel}>FCFA</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Step 1: Selected Service */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Prestation sélectionnée</h2>
            
            <div style={styles.selectedService}>
              <div style={styles.serviceInfo}>
                <div style={styles.serviceName}>{service.name}</div>
                <div style={styles.serviceDetails}>
                  <span>{service.duration || 30}min</span>
                  <span style={styles.dot}>·</span>
                  <span style={styles.price}>{service.price}FCFA</span>
                </div>
              </div>
              <button style={styles.editButton} onClick={() => navigate(`/salon/${salonId}`)}>
                Modifier
              </button>
            </div>

            {/* Staff Selection */}
            <div style={styles.staffSection}>
              <h3 style={styles.subTitle}>
                <User size={16} style={{ marginRight: '8px' }} />
                Choisir avec qui ?
              </h3>
              
              <div style={styles.staffGrid}>
                {/* Sans préférence */}
                <label style={selectedStaff === 'sans-preference' ? {...styles.staffOption, ...styles.staffOptionSelected} : styles.staffOption}>
                  <input
                    type="radio"
                    name="staff"
                    value="sans-preference"
                    checked={selectedStaff === 'sans-preference'}
                    onChange={() => setSelectedStaff('sans-preference')}
                    style={styles.radio}
                  />
                  <div style={styles.staffContent}>
                    <span style={styles.gearIcon}>⚙️</span>
                    <span style={styles.staffName}>Sans préférence</span>
                  </div>
                </label>

                {/* Staff Members */}
                {staff.slice(1).map((member) => (
                  <label 
                    key={member.id} 
                    style={selectedStaff === member.id ? {...styles.staffOption, ...styles.staffOptionSelected} : styles.staffOption}
                  >
                    <input
                      type="radio"
                      name="staff"
                      value={member.id}
                      checked={selectedStaff === member.id}
                      onChange={() => setSelectedStaff(member.id)}
                      style={styles.radio}
                    />
                    <div style={styles.staffContent}>
                      <div style={styles.staffAvatar}>{member.avatar}</div>
                      <span style={styles.staffName}>{member.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Add Another Service */}
            <button style={styles.addButton}>
              + Ajouter une prestation à la suite
            </button>
          </div>

          {/* Step 2: Date & Time Selection */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Choix de la date & heure</h2>

            <div style={styles.calendar}>
              {/* Navigation */}
              <button style={styles.navButton} onClick={goToPreviousWeek}>
                <ChevronLeft size={20} />
              </button>

              {/* Days Grid */}
              <div style={styles.daysGrid}>
                {weekDays.map((date, index) => {
                  const dayLabel = formatDayLabel(date);
                  const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                  
                  return (
                    <div key={index} style={styles.dayColumn}>
                      <div style={isSelected ? {...styles.dayHeader, ...styles.dayHeaderSelected} : styles.dayHeader}>
                        <div style={styles.dayName}>{dayLabel.day}</div>
                        <div style={isSelected ? {...styles.dayDate, ...styles.dayDateSelected} : styles.dayDate}>{dayLabel.date}</div>
                      </div>

                      <div style={styles.timeSlotsColumn}>
                        {generateTimeSlots(availabilities).map((time) => {
                          const isAvailable = isTimeAvailable(date, time);
                          const isTimeSelected = selectedTime === time && isSelected;

                          if (!isAvailable) return null;

                          return (
                            <button
                              key={time}
                              style={{
                                ...styles.timeSlot,
                                ...(isTimeSelected ? styles.timeSlotSelected : {})
                              }}
                              onClick={() => handleTimeSelect(date, time)}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <button style={styles.navButton} onClick={goToNextWeek}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Selected Summary */}
            {selectedDate && selectedTime && (
              <div style={styles.summaryCard}>
                <div style={styles.summaryContent}>
                  <div style={styles.summaryIcon}>📅</div>
                  <div style={styles.summaryText}>
                    <div style={styles.summaryTitle}>Rendez-vous sélectionné</div>
                    <div style={styles.summaryDetails}>
                      {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedTime}
                    </div>
                  </div>
                </div>
                <button 
                  style={{
                    ...styles.confirmButton,
                    opacity: bookingLoading ? 0.7 : 1,
                    cursor: bookingLoading ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading 
                    ? (isReschedule ? 'Déplacement en cours...' : 'Réservation en cours...')
                    : (isReschedule ? 'Confirmer le déplacement' : 'Confirmer la réservation')
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    backgroundColor: '#F8F9FA',
    minHeight: '100vh',
    paddingBottom: '3rem',
  },

  // Reschedule banner
  rescheduleBanner: {
    backgroundColor: '#EEF2FF',
    borderBottom: '1px solid #C7D2FE',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  rescheduleIcon: {
    fontSize: '1.25rem',
  },
  rescheduleCancel: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: '#6366F1',
    cursor: 'pointer',
    fontSize: '0.875rem',
    textDecoration: 'underline',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '1rem',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTopColor: '#6366F1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '1rem',
    textAlign: 'center',
  },

  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // Salon Header
  salonHeader: {
    backgroundColor: '#FFF',
    borderBottom: '1px solid #E5E7EB',
    padding: '2rem 0',
  },
  salonHeaderContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  salonName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#111827',
  },
  salonMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6B7280',
  },
  icon: {
    flexShrink: 0,
  },
  address: {
    color: '#6B7280',
  },
  separator: {
    color: '#D1D5DB',
  },
  rating: {
    fontWeight: '500',
    color: '#111827',
  },
  priceLevel: {
    color: '#6B7280',
  },

  // Main Content
  mainContent: {
    maxWidth: '900px',
    margin: '2rem auto',
    padding: '0 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },

  // Section
  section: {
    backgroundColor: '#FFF',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#111827',
  },
  subTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
  },

  // Selected Service
  selectedService: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  serviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  serviceName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
  },
  serviceDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6B7280',
  },
  dot: {
    color: '#D1D5DB',
  },
  price: {
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6366F1',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Staff Section
  staffSection: {
    marginBottom: '1.5rem',
  },
  staffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  staffOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#FFF',
  },
  staffOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  radio: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  staffContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  gearIcon: {
    fontSize: '1.5rem',
  },
  staffAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
  },
  staffName: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#111827',
  },

  // Add Button
  addButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: '#000',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Calendar
  calendar: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    overflowX: 'auto',
    padding: '1rem 0',
  },
  navButton: {
    width: '40px',
    height: '40px',
    flexShrink: 0,
    backgroundColor: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#6B7280',
  },
  daysGrid: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  },
  dayColumn: {
    minWidth: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  dayHeader: {
    textAlign: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #E5E7EB',
    transition: 'all 0.2s',
  },
  dayHeaderSelected: {
    borderBottom: '2px solid #6366F1',
    backgroundColor: '#EEF2FF',
    borderRadius: '8px 8px 0 0',
    padding: '0.75rem',
    marginBottom: '-0.75rem',
  },
  dayName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
    marginBottom: '0.25rem',
  },
  dayDate: {
    fontSize: '0.8rem',
    color: '#6B7280',
  },
  dayDateSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  timeSlotsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  timeSlot: {
    padding: '0.5rem',
    backgroundColor: '#FFF',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#111827',
    textAlign: 'center',
  },
  timeSlotSelected: {
    padding: '0.5rem',
    backgroundColor: '#6366F1',
    border: '1px solid #6366F1',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#FFF',
    textAlign: 'center',
  },

  // Summary Card
  summaryCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#EEF2FF',
    borderRadius: '12px',
    border: '1px solid #C7D2FE',
  },
  summaryContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  summaryIcon: {
    fontSize: '2rem',
  },
  summaryText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  summaryTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#111827',
  },
  summaryDetails: {
    fontSize: '0.85rem',
    color: '#4F46E5',
    textTransform: 'capitalize',
  },
  confirmButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#6366F1',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default PlanityBookingPage;
