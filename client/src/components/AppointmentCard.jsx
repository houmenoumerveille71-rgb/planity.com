import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Trash2, Clock, X } from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const navigate = useNavigate();
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const handleAddToCalendar = () => {
    // Créer un fichier ICS pour ajouter à l'agenda
    const startTime = new Date(appointment.startTime);
    const endTime = appointment.endTime ? new Date(appointment.endTime) : new Date(startTime.getTime() + (appointment.service?.duration || 60) * 60000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${appointment.service?.name || 'Rendez-vous'} - ${appointment.salon?.name || 'Salon'}
DESCRIPTION:Service: ${appointment.service?.name || ''}
Prix: ${appointment.service?.price || 0} FCFA
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'rendez-vous.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancelConfirm = () => {
    if (onCancel) {
      onCancel(appointment.id);
    }
    setShowCancelModal(false);
  };

  const handleReschedule = () => {
    navigate(`/booking/${appointment.salonId}/${appointment.serviceId}`, {
      state: {
        reschedule: true,
        appointmentId: appointment.id,
        message: 'Déplacement de votre rendez-vous'
      }
    });
  };

  return (
    <>
      <div style={styles.card}>
        {/* Date Header */}
        <div style={styles.dateHeader}>
          {formatDate(appointment.startTime)}
        </div>

        {/* Card Content */}
        <div style={styles.cardContent}>
          {/* Image */}
          <div style={styles.imageContainer}>
            {appointment.salon?.image ? (
              <img 
                src={appointment.salon.image} 
                alt={appointment.salon?.name || 'Salon'} 
                style={styles.image}
              />
            ) : (
              <div style={styles.imagePlaceholder}>
                <Calendar size={40} style={{ color: '#9CA3AF' }} />
              </div>
            )}
          </div>

          {/* Details */}
          <div style={styles.details}>
            {/* Title */}
            <h3 style={styles.title}>
              {appointment.service?.name || 'Prestation'}
              {appointment.salon?.name && ` - ${appointment.salon.name}`}
            </h3>

            {/* Address */}
            {appointment.salon?.address && (
              <div style={styles.info}>
                <MapPin size={16} style={styles.icon} />
                <span style={styles.infoText}>{appointment.salon.address}</span>
              </div>
            )}

            {/* Service & Duration */}
            <div style={styles.info}>
              <Clock size={16} style={styles.icon} />
              <span style={styles.infoText}>
                {appointment.service?.name || 'Service'} - {appointment.service?.duration || 60}min
              </span>
            </div>

            {/* Price */}
            <div style={styles.info}>
              <span style={styles.priceIcon}>💵</span>
              <span style={styles.price}>{appointment.service?.price || 0} FCFA</span>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button 
                style={styles.buttonOutline}
                onClick={handleAddToCalendar}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                }}
              >
                <Calendar size={18} />
                Ajouter à mon agenda
              </button>

              <button 
                style={styles.buttonOutline}
                onClick={() => setShowCancelModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                  e.currentTarget.style.borderColor = '#EF4444';
                  e.currentTarget.style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                <Trash2 size={18} />
                Annuler le RDV
              </button>

              <button 
                style={styles.buttonPrimary}
                onClick={handleReschedule}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1F2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#111827';
                }}
              >
                Déplacer le RDV
              </button>
            </div>

            {/* Notification Toggle */}
            <div style={styles.notification}>
              <label style={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={notifyWhenAvailable}
                  onChange={(e) => setNotifyWhenAvailable(e.target.checked)}
                  style={styles.toggleInput}
                />
                <div style={{
                  ...styles.toggle,
                  backgroundColor: notifyWhenAvailable ? '#6366F1' : '#E5E7EB'
                }}>
                  <div style={{
                    ...styles.toggleCircle,
                    transform: notifyWhenAvailable ? 'translateX(24px)' : 'translateX(2px)'
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

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.modalClose}
              onClick={() => setShowCancelModal(false)}
            >
              <X size={24} />
            </button>
            
            <div style={styles.modalIcon}>
              <Trash2 size={48} style={{ color: '#EF4444' }} />
            </div>
            
            <h3 style={styles.modalTitle}>Annuler le rendez-vous</h3>
            <p style={styles.modalText}>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ?
            </p>
            <p style={styles.modalSubtext}>
              Cette action est irréversible.
            </p>
            
            <div style={styles.modalActions}>
              <button 
                style={styles.modalButtonSecondary}
                onClick={() => setShowCancelModal(false)}
              >
                Non, garder le RDV
              </button>
              <button 
                style={styles.modalButtonPrimary}
                onClick={handleCancelConfirm}
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    position: 'relative',
    textAlign: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
  },
  modalIcon: {
    marginBottom: '1rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  modalText: {
    fontSize: '1rem',
    color: '#4B5563',
    marginBottom: '0.5rem',
  },
  modalSubtext: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
    marginBottom: '1.5rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4B5563',
    cursor: 'pointer',
  },
  modalButtonPrimary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#EF4444',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#FFF',
    cursor: 'pointer',
  },
};

export default AppointmentCard;
