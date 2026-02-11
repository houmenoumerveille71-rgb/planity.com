import React, { useState } from 'react';
import { MapPin, Calendar, Trash2, Clock } from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel }) => {
  const [notifyWhenAvailable, setNotifyWhenAvailable] = useState(false);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
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
              💅
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
              {appointment.service?.name || 'Service'} • {appointment.service?.duration || 30}min
            </span>
          </div>

          {/* Price */}
          <div style={styles.info}>
            <span style={styles.priceIcon}>💶</span>
            <span style={styles.price}>{appointment.service?.price || 0} €</span>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button 
              style={styles.buttonOutline}
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
              onClick={() => onCancel && onCancel(appointment.id)}
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
};

export default AppointmentCard;
