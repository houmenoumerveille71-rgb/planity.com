import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PhoneInput from './PhoneInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Catégories de prestations disponibles
const CATEGORIES = [
  { id: 'coiffure', name: 'Coiffure', icon: '✂️' },
  { id: 'esthetique', name: 'Esthétique', icon: '💅' },
  { id: 'bien-etre', name: 'Bien-être', icon: '🧘' },
  { id: 'ongles', name: 'Ongles', icon: '💅' },
  { id: 'maquillage', name: 'Maquillage', icon: '💄' },
  { id: 'barbier', name: 'Barbier', icon: '🪒' },
];

const BookingModal = ({ salonId, onClose, isEdit = false, appointment = null, onUpdate = null }) => {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  
  // Étape du processus de réservation
  const [step, setStep] = useState(1);
  
  // Sélections
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(isEdit ? appointment?.startTime?.split('T')[0] || '' : '');
  const [selectedTime, setSelectedTime] = useState(isEdit ? appointment?.startTime?.split('T')[1]?.substring(0, 5) || '' : '');
  
  // Données
  const [salonInfo, setSalonInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  // États de chargement et messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  
  // Formulaire d'inscription (si non connecté)
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', phone: '' });

  // Récupérer les informations du salon
  useEffect(() => {
    const fetchSalonInfo = async () => {
      try {
        const response = await fetch(`${API_BASE}/salons/${salonId}`);
        if (response.ok) {
          const salon = await response.json();
          setSalonInfo(salon);
          setServices(salon.services || []);
          
          // Si édition, pré-sélectionner le service
          if (isEdit && appointment?.serviceId) {
            const service = salon.services?.find(s => s.id === appointment.serviceId);
            if (service) {
              setSelectedService(service);
              // Déterminer la catégorie basée sur le nom du service
              const category = CATEGORIES.find(cat => 
                service.name.toLowerCase().includes(cat.id) || 
                salon.category.toLowerCase().includes(cat.id)
              );
              if (category) setSelectedCategory(category);
            }
          }
        }
      } catch (err) {
        console.error('Erreur récupération salon:', err);
      }
    };
    fetchSalonInfo();
  }, [salonId, isEdit, appointment]);

  // Récupérer les créneaux disponibles quand la date change
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedDate]);

  const fetchAvailableTimes = async () => {
    try {
      const response = await fetch(`${API_BASE}/salons/${salonId}/availability?date=${selectedDate}`);
      if (response.ok) {
        const times = await response.json();
        setAvailableTimes(times);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('Erreur récupération disponibilités:', err);
      setAvailableTimes([]);
    }
  };

  // Filtrer les services par catégorie
  const getFilteredServices = () => {
    if (!selectedCategory) return services;
    return services.filter(service => {
      const serviceName = service.name.toLowerCase();
      const categoryId = selectedCategory.id;
      
      // Correspondance directe ou partielle
      if (serviceName.includes(categoryId)) return true;
      
      // Correspondances spécifiques par catégorie
      const categoryKeywords = {
        'coiffure': ['coupe', 'coiffure', 'brushing', 'coloration', 'shampoing', 'cheveux'],
        'esthetique': ['soin', 'épilation', 'gommage', 'masque', 'visage', 'corps'],
        'bien-etre': ['massage', 'relaxation', 'spa', 'bien-être', 'detente'],
        'ongles': ['ongle', 'manucure', 'pédicure', 'vernis', 'nail'],
        'maquillage': ['maquillage', 'makeup', 'lèvres', 'yeux'],
        'barbier': ['barbe', 'rasage', 'barbier', 'taille', 'moustache'],
      };
      
      return categoryKeywords[categoryId]?.some(keyword => serviceName.includes(keyword)) || false;
    });
  };

  // Gestion de l'inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      if (response.ok) {
        // Connecter automatiquement après inscription
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerData.email, password: registerData.password }),
        });
        
        if (loginResponse.ok) {
          const { token: newToken, user: newUser } = await loginResponse.json();
          login(newToken, newUser);
          setShowRegisterForm(false);
          setMessage('✅ Compte créé avec succès ! Vous pouvez maintenant réserver.');
          setMessageType('success');
        }
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.error || 'Erreur lors de l\'inscription'}`);
        setMessageType('error');
      }
    } catch (err) {
      setMessage('❌ Erreur réseau');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre la réservation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des étapes
    if (step === 1 && !selectedCategory) {
      setMessage('⚠️ Veuillez sélectionner une catégorie de prestation.');
      setMessageType('warning');
      return;
    }
    
    if (step === 2 && !selectedService) {
      setMessage('⚠️ Veuillez sélectionner un service.');
      setMessageType('warning');
      return;
    }
    
    if (step === 3 && (!selectedDate || !selectedTime)) {
      setMessage('⚠️ Veuillez sélectionner une date et une heure.');
      setMessageType('warning');
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (!user || !token) {
      setShowRegisterForm(true);
      setMessage('⚠️ Vous devez être connecté pour réserver.');
      setMessageType('warning');
      return;
    }

    // Passer à l'étape suivante ou soumettre
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Soumettre la réservation
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
    setLoading(true);

    try {
      const url = isEdit
        ? `${API_BASE}/appointments/${appointment.id}`
        : `${API_BASE}/appointments`;
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? JSON.stringify({ startTime: startTime.toISOString() })
        : JSON.stringify({
            salonId,
            serviceId: selectedService.id,
            startTime: startTime.toISOString(),
          });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body,
      });

      if (response.ok) {
        const data = await response.json();
        if (!isEdit) {
          // Payer l'acompte automatiquement
          const payResponse = await fetch(`${API_BASE}/invoices/${data.invoice.id}/pay`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (payResponse.ok) {
            setMessage('✅ Rendez-vous confirmé avec acompte payé ! Un email de confirmation vous a été envoyé.');
            setMessageType('success');
          } else {
            setMessage('✅ Rendez-vous créé, paiement en attente.');
            setMessageType('success');
          }
        } else {
          setMessage('✅ Rendez-vous modifié avec succès !');
          setMessageType('success');
        }
        setTimeout(() => {
          onClose();
          navigate('/');
          if (onUpdate) onUpdate();
        }, 3000);
      } else {
        const error = await response.json();
        setMessage(`❌ ${error.error || 'Erreur lors de la réservation.'}`);
        setMessageType('error');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('❌ Erreur réseau.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Revenir à l'étape précédente
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Réinitialiser le message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl w-full my-4 md:my-8 max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* En-tête avec indicateur de progression */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            {isEdit ? 'Modifier' : 'Prendre'} rendez-vous
          </h2>
          
          {/* Barre de progression */}
          <div className="flex items-center justify-between mb-4 px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                  step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Labels des étapes */}
          <div className="flex justify-between text-xs md:text-sm text-gray-600 px-0 md:px-2">
            <span className={step >= 1 ? 'font-bold text-purple-600' : ''}>Catégorie</span>
            <span className={step >= 2 ? 'font-bold text-purple-600' : ''}>Service</span>
            <span className={step >= 3 ? 'font-bold text-purple-600' : ''}>Date</span>
          </div>
        </div>

        {/* Message de notification */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {message}
          </div>
        )}

        {/* Formulaire d'inscription (si non connecté) */}
        {showRegisterForm && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-bold text-purple-900 mb-4">📝 Créer un compte pour réserver</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <PhoneInput
                  value={registerData.phone}
                  onChange={(phone) => setRegisterData({...registerData, phone })}
                  label="Téléphone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                  minLength="6"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer et réserver'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Étape 1: Sélection de catégorie */}
        {step === 1 && (
          <div>
            <h3 className="font-bold text-lg mb-4">📂 Choisissez une catégorie de prestation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory?.id === category.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2: Sélection de service */}
        {step === 2 && (
          <div>
            <h3 className="font-bold text-lg mb-4">💇 Choisissez votre prestation</h3>
            <div className="space-y-3">
              {getFilteredServices().length > 0 ? (
                getFilteredServices().map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedService?.id === service.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{service.name}</h4>
                        <p className="text-sm text-gray-600">Durée: {service.duration} min</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{service.price} FCFA</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun service disponible dans cette catégorie.</p>
                  <button
                    onClick={() => setStep(1)}
                    className="mt-2 text-purple-600 hover:underline"
                  >
                    Choisir une autre catégorie
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Étape 3: Sélection de date et heure */}
        {step === 3 && (
          <div>
            {/* Récapitulatif du service sélectionné */}
            {selectedService && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-purple-900 mb-3">📋 Récapitulatif de la prestation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-semibold text-gray-900">{selectedService.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Catégorie</p>
                    <p className="font-semibold text-gray-900">{selectedCategory?.name || salonInfo?.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-semibold text-gray-900">{selectedService.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix</p>
                    <p className="font-semibold text-gray-900">{selectedService.price} FCFA</p>
                  </div>
                </div>
              </div>
            )}

            {/* Règles du salon */}
            {salonInfo && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-blue-900 mb-3">📌 Règles du salon</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span>Validation : {salonInfo.validationMode === 'auto' ? 'Automatique' : 'Manuelle'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>⏰</span>
                    <span>Annulation : Jusqu'à {salonInfo.cancellationDelay || '24h'} avant le rendez-vous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>💳</span>
                    <span>Acompte : {salonInfo.depositRequired ? 'Requis (50%)' : 'Non requis'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📍</span>
                    <span>Adresse : {salonInfo.address}</span>
                  </li>
                </ul>
              </div>
            )}

            <h3 className="font-bold text-lg mb-4">📅 Choisissez date et heure</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Heure disponible</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  ) : selectedDate ? (
                    <p className="col-span-4 text-center text-orange-600 py-4">
                      ⚠️ Aucun créneau disponible pour cette date
                    </p>
                  ) : (
                    <p className="col-span-4 text-center text-gray-500 py-4">
                      Sélectionnez une date pour voir les créneaux disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Récapitulatif du paiement (étape 3) */}
        {step === 3 && selectedService && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <h3 className="font-bold text-green-900 mb-3">💳 Récapitulatif du paiement</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Prix total de la prestation</span>
                <span className="font-bold text-gray-900">{selectedService.price} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Acompte à payer maintenant (50%)</span>
                <span className="font-bold text-green-600">{(selectedService.price * 0.5).toFixed(2)} FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-300">
                <span className="text-gray-700">Reste à payer au salon</span>
                <span className="font-bold text-gray-900">{(selectedService.price * 0.5).toFixed(2)} FCFA</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 L'acompte sera débité automatiquement lors de la confirmation de votre rendez-vous.
            </p>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 font-medium"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || (step === 3 && (!selectedDate || !selectedTime || availableTimes.length === 0))}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
          >
            {loading ? 'Chargement...' : 
             step === 1 ? 'Suivant →' :
             step === 2 ? 'Suivant →' :
             (isEdit ? 'Modifier' : 'Confirmer la réservation')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
