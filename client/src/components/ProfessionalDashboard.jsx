import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Scissors, Settings,
  BarChart3, Bell, Plus, Search, LogOut,
  ChevronLeft, ChevronRight, Clock, User, DollarSign, TrendingUp,
  Trash2, Edit, Mail, Phone, MoreVertical, X, Check, Ban, Lock, Image, Menu
} from 'lucide-react';
import { useAuth, isProfessionalUser } from '../AuthContext';
import PhoneInput from './PhoneInput';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import AppointmentModal from './AppointmentModal';
import ClientList from './ClientList';
import OpeningHoursManager from './OpeningHoursManager';
import GalleryManager from './GalleryManager';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const ProDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('Planning');
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect clients to their dashboard
  useEffect(() => {
    if (user && !isProfessionalUser(user)) {
      navigate('/account');
    }
  }, [user, navigate]);
  
  // Modals
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Settings state
  const [settingsData, setSettingsData] = useState({
    name: '',
    address: '',
    phone: '',
    description: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [period, setPeriod] = useState('day');
  
  // Closed days and blocked slots
  const [closedDays, setClosedDays] = useState([0, 6]); // 0 = Sunday, 6 = Saturday
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSlotToBlock, setSelectedSlotToBlock] = useState(null);
  const [showClosedDaysModal, setShowClosedDaysModal] = useState(false);

  // Gallery modal state
  const [showGallery, setShowGallery] = useState(false);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Planning', icon: <Calendar size={20} /> },
    { name: 'Clients', icon: <Users size={20} /> },
    { name: 'Services', icon: <Scissors size={20} /> },
    { name: 'Équipe', icon: <Users size={20} /> },
    { name: 'Galerie', icon: <Image size={20} /> },
    { name: 'Statistiques', icon: <BarChart3 size={20} /> },
    { name: 'Paramètres', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/pro-login');
  };

  // Fonction pour charger les données du salon
  const fetchSalonData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('Veuillez vous connecter');
      return;
    }

    try {
      const salonRes = await fetch(`${API_BASE}/admin/salons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (salonRes.status === 404) {
        navigate('/pro-salon-setup');
        return;
      }

      if (salonRes.status === 401) {
        setError('Session expirée');
        logout();
        navigate('/pro-login');
        return;
      }

      if (salonRes.ok) {
        const salonData = await salonRes.json();
        setSalon(salonData);
        setServices(salonData.services || []);

        const appointmentsRes = await fetch(`${API_BASE}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (appointmentsRes.ok) {
          const appts = await appointmentsRes.json();
          setAppointments(appts);
          
          const uniqueClients = [...new Map(appts.map(apt => [apt.user?.id, apt.user])).values()];
          setClients(uniqueClients.filter(c => c));
        }
      } else {
        const errorData = await salonRes.json();
        setError(errorData.error || 'Erreur lors du chargement');
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du salon au montage
  useEffect(() => {
    fetchSalonData();
  }, [navigate, logout]);

  // Mettre à jour settingsData quand salon change
  useEffect(() => {
    if (salon) {
      setSettingsData({
        name: salon.name || '',
        address: salon.address || '',
        phone: salon.user?.phone || '',
        description: salon.description || ''
      });
    }
  }, [salon]);

  // Navigation du calendrier
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Vérifier si un jour est fermé
  const isDayClosed = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return closedDays.includes(dayOfWeek);
  };

  // Vérifier si un créneau est bloqué
  const isSlotBlocked = (date, hour) => {
    const dateStr = new Date(date).toDateString();
    return blockedSlots.some(slot => 
      new Date(slot.date).toDateString() === dateStr && 
      slot.hour === hour
    );
  };

  // Bloquer un créneau
  const blockSlot = (date, hour, reason = '') => {
    const newBlock = {
      id: Date.now(),
      date: new Date(date),
      hour,
      reason,
      createdAt: new Date()
    };
    setBlockedSlots([...blockedSlots, newBlock]);
    setShowBlockModal(false);
    setSelectedSlotToBlock(null);
  };

  // Débloquer un créneau
  const unblockSlot = (blockId) => {
    setBlockedSlots(blockedSlots.filter(slot => slot.id !== blockId));
  };

  // Ajouter un jour fermé
  const addClosedDay = (dayOfWeek) => {
    if (!closedDays.includes(dayOfWeek)) {
      setClosedDays([...closedDays, dayOfWeek].sort());
    }
  };

  // Retirer un jour fermé
  const removeClosedDay = (dayOfWeek) => {
    setClosedDays(closedDays.filter(day => day !== dayOfWeek));
  };

  // Obtenir les rendez-vous pour une date spécifique
  const getAppointmentsForDate = (date) => {
    const dateStr = new Date(date).toDateString();
    return appointments.filter(apt => new Date(apt.startTime).toDateString() === dateStr);
  };

  // Obtenir les jours de la semaine actuelle
  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Calculer les stats du jour
  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.startTime).toDateString() === today
  );
  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

  // Statistiques du mois
  const monthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.getMonth() === currentDate.getMonth() && 
           aptDate.getFullYear() === currentDate.getFullYear();
  });
  const monthRevenue = monthAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

  // Ajouter un service
  const handleAddService = async (serviceData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Veuillez vous connecter');
      return;
    }

    try {
      console.log('Envoi des données:', serviceData);
      const response = await fetch(`${API_BASE}/admin/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });
      
      const data = await response.json();
      console.log('Réponse:', data);
      
      if (response.ok) {
        setServices([...services, data]);
        setShowAddService(false);
        setSuccess('Service ajouté avec succès');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout du service');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    }
  };

  // Modifier un service
  const handleUpdateService = async (serviceData) => {
    const token = localStorage.getItem('token');
    if (!token || !editingService) return;

    try {
      const response = await fetch(`${API_BASE}/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        const updatedService = await response.json();
        setServices(services.map(s => s.id === editingService.id ? updatedService : s));
        setEditingService(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Supprimer un service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setServices(services.filter(s => s.id !== serviceId));
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Annuler un rendez-vous
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAppointments(appointments.filter(a => a.id !== appointmentId));
        setShowAppointmentModal(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  // Rendu du calendrier - Vue jour
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 19h
    const isClosed = isDayClosed(currentDate);
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">{dayAppointments.length} rendez-vous</p>
            {isClosed && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Ban size={12} /> Jour fermé
              </span>
            )}
          </div>
        </div>
        
        {isClosed ? (
          <div className="p-8 text-center">
            <Ban size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Ce jour est fermé</p>
          </div>
        ) : (
          <div className="max-h-125 overflow-y-auto">
            {hours.map(hour => {
              const hourAppointments = dayAppointments.filter(apt => new Date(apt.startTime).getHours() === hour);
              const isBlocked = isSlotBlocked(currentDate, hour);
              const blockedSlot = blockedSlots.find(slot => 
                new Date(slot.date).toDateString() === currentDate.toDateString() && 
                slot.hour === hour
              );
              const isOccupied = hourAppointments.length > 0;
              const isFree = !isOccupied && !isBlocked;
              
              return (
                <div key={hour} className="flex border-b border-gray-50">
                  <div className={`w-16 py-3 px-2 text-xs text-right border-r border-gray-100 ${isFree ? 'text-gray-400' : 'text-gray-500'}`}>
                    {hour}h00
                  </div>
                  <div className="flex-1 py-1 px-2">
                    {/* Créneau bloqué */}
                    {isBlocked && (
                      <div className="bg-gray-100 border-l-4 border-gray-400 p-2 rounded mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock size={14} className="text-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-600">Créneau bloqué</p>
                            {blockedSlot?.reason && (
                              <p className="text-xs text-gray-500">{blockedSlot.reason}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => unblockSlot(blockedSlot.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    
                    {/* Créneaux occupés (rendez-vous) */}
                    {hourAppointments.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => { setSelectedAppointment(apt); setShowAppointmentModal(true); }}
                        className="bg-[#48BB78]/10 border-l-4 border-[#48BB78] p-2 rounded mb-1 cursor-pointer hover:bg-[#48BB78]/20 transition-colors"
                      >
                        <p className="font-medium text-sm">
                          {new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm">{apt.user?.name || 'Client'}</p>
                        <p className="text-xs text-gray-500">{apt.service?.name}</p>
                      </div>
                    ))}
                    
                    {/* Créneau libre */}
                    {isFree && (
                      <button
                        onClick={() => setSelectedSlotToBlock({ date: currentDate, hour, reason: '' })}
                        className="w-full py-2 text-xs text-gray-400 hover:text-[#48BB78] hover:bg-[#48BB78]/5 rounded transition-colors flex items-center gap-2"
                      >
                        <Plus size={12} />
                        <span>Créneau libre</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Rendu du calendrier - Vue semaine
  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* En-tête des jours - scrollable sur mobile */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-125 md:min-w-0 border-b border-gray-100">
            {weekDays.map((day, idx) => {
              const isClosed = isDayClosed(day);
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = new Date(day).toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={idx}
                  onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                  className={`py-3 text-center cursor-pointer hover:bg-gray-50 ${
                    isClosed 
                      ? 'bg-red-50' 
                      : isToday 
                        ? 'bg-[#48BB78]/10' 
                        : ''
                  }`}
                >
                  <p className={`text-xs ${isClosed ? 'text-red-400' : 'text-gray-500'}`}>{DAYS[idx]}</p>
                  <p className={`font-bold ${
                    isClosed 
                      ? 'text-red-400' 
                      : isToday 
                        ? 'text-[#48BB78]' 
                        : ''
                  }`}>
                    {new Date(day).getDate()}
                  </p>
                  {isClosed && (
                    <Ban size={14} className="mx-auto text-red-400 mt-1" />
                  )}
                  {!isClosed && dayAppointments.length > 0 && (
                    <span className="text-xs text-[#48BB78] font-medium">{dayAppointments.length} RDV</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Contenu des jours - scrollable sur mobile */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-125 md:min-w-0">
            {weekDays.map((day, idx) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isClosed = isDayClosed(day);
              const hasBlockedSlots = blockedSlots.some(slot => 
                new Date(slot.date).toDateString() === new Date(day).toDateString()
              );
              
              return (
                <div 
                  key={idx} 
                  className={`min-h-50 md:min-h-75 border-r border-gray-50 last:border-r-0 p-1 ${
                    isClosed ? 'bg-red-50/50' : ''
                  }`}
                  onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                >
                  {isClosed ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Ban size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400">Fermé</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Afficher les créneaux bloqués */}
                      {blockedSlots
                        .filter(slot => new Date(slot.date).toDateString() === new Date(day).toDateString())
                        .slice(0, 2)
                        .map(slot => (
                          <div
                            key={slot.id}
                            className="bg-gray-100 border-l-2 border-gray-400 p-1 rounded mb-1 text-xs flex items-center gap-1"
                          >
                            <Lock size={10} className="text-gray-500" />
                            <span className="truncate">{slot.hour}:00</span>
                          </div>
                        ))}
                      
                      {/* Afficher les rendez-vous */}
                      {dayAppointments.slice(0, 3).map(apt => (
                        <div
                          key={apt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); setShowAppointmentModal(true); }}
                          className="bg-[#48BB78]/10 border-l-2 border-[#48BB78] p-1 rounded mb-1 cursor-pointer hover:bg-[#48BB78]/20 text-xs"
                        >
                          <p className="font-medium truncate">
                            {new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="truncate">{apt.user?.name || 'Client'}</p>
                        </div>
                      ))}
                      
                      {/* Indicateur s'il y a plus de rendez-vous */}
                      {dayAppointments.length > 3 && (
                        <p className="text-xs text-gray-400 text-center">+{dayAppointments.length - 3} autres</p>
                      )}
                      
                      {/* Indicateur s'il y a des créneaux bloqués en plus */}
                      {blockedSlots.filter(slot => new Date(slot.date).toDateString() === new Date(day).toDateString()).length > 2 && (
                        <p className="text-xs text-gray-400 text-center">
                          +{blockedSlots.filter(slot => new Date(slot.date).toDateString() === new Date(day).toDateString()).length - 2} bloqués
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Rendu du calendrier - Vue mois
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* En-tête des jours - scrollable sur mobile */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-125 md:min-w-0 border-b border-gray-100">
            {DAYS.map(day => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
        </div>
        {/* Contenu du mois - scrollable sur mobile */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-125 md:min-w-0">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={idx} className="min-h-15 md:min-h-20 bg-gray-50 border-r border-gray-50"></div>;
              }
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = new Date(day).toDateString() === new Date().toDateString();
              const isClosed = isDayClosed(day);
              const hasBlockedSlots = blockedSlots.some(slot => 
                new Date(slot.date).toDateString() === new Date(day).toDateString()
              );
              
              return (
                <div
                  key={idx}
                  onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                  className={`min-h-15 md:min-h-20 border-r border-gray-50 last:border-r-0 p-1 cursor-pointer hover:bg-gray-50 ${
                    isClosed 
                      ? 'bg-red-50' 
                      : isToday 
                        ? 'bg-[#48BB78]/5' 
                        : ''
                  }`}
                >
                  <p className={`text-xs md:text-sm text-right ${
                    isClosed 
                      ? 'text-red-400' 
                      : isToday 
                        ? 'font-bold text-[#48BB78]' 
                        : ''
                  }`}>
                    {day.getDate()}
                  </p>
                  
                  {isClosed ? (
                    <div className="flex items-center justify-center mt-1">
                      <Ban size={14} className="text-red-300" />
                    </div>
                  ) : (
                    <>
                      {dayAppointments.length > 0 && (
                        <div className="mt-1">
                          {dayAppointments.slice(0, 2).map(apt => (
                            <div key={apt.id} className="bg-[#48BB78]/10 text-[8px] md:text-[10px] p-0.5 rounded mb-0.5 truncate">
                              {new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {apt.user?.name?.split(' ')[0]}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <p className="text-[8px] md:text-[10px] text-gray-400">+{dayAppointments.length - 2}</p>
                          )}
                        </div>
                      )}
                      
                      {hasBlockedSlots && !isClosed && (
                        <div className="mt-1 flex items-center gap-1">
                          <Lock size={10} className="text-gray-400" />
                          <span className="text-[8px] md:text-[10px] text-gray-400">
                            {blockedSlots.filter(slot => new Date(slot.date).toDateString() === new Date(day).toDateString()).length}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPlanning = () => (
    <div className="space-y-6">
      {/* Gestion du planning */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Sélecteur de période */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-1">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === 'day' 
                ? 'bg-[#48BB78] text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === 'week' 
                ? 'bg-[#48BB78] text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === 'month' 
                ? 'bg-[#48BB78] text-white' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mois
          </button>
        </div>
        
        {/* Boutons de gestion */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowClosedDaysModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Ban size={16} />
            Jours fermés
          </button>
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Lock size={16} />
            Bloquer un créneau
          </button>
        </div>
      </div>

      {/* Navigation du calendrier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevious} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">
            {viewMode === 'day' && DAYS[currentDate.getDay()] + ' ' + currentDate.getDate() + ' ' + MONTHS[currentDate.getMonth()]}
            {viewMode === 'week' && 'Semaine du ' + DAYS[new Date(currentDate).getDay()] + ' ' + currentDate.getDate() + ' ' + MONTHS[currentDate.getMonth()]}
            {viewMode === 'month' && MONTHS[currentDate.getMonth()] + ' ' + currentDate.getFullYear()}
          </h2>
          <button onClick={goToNext} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-[#48BB78] text-white rounded-lg font-medium text-sm hover:bg-[#3da368] transition-colors"
          >
            Aujourd'hui
          </button>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
          </select>
        </div>
      </div>

      {/* Calendrier */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Liste des RDV du jour (pour vue jour) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-bold mb-4">Détails des rendez-vous</h3>
          {getAppointmentsForDate(currentDate).length > 0 ? (
            <div className="space-y-2">
              {getAppointmentsForDate(currentDate).map(apt => (
                <div
                  key={apt.id}
                  onClick={() => { setSelectedAppointment(apt); setShowAppointmentModal(true); }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#48BB78]/10 rounded-full flex items-center justify-center">
                      <User size={18} className="text-[#48BB78]" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.user?.name || 'Client'}</p>
                      <p className="text-sm text-gray-500">{apt.service?.name} - {new Date(apt.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#48BB78]">{apt.service?.price} FCFA</span>
                    <MoreVertical size={18} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun rendez-vous ce jour</p>
          )}
        </div>
      )}
    </div>
  );

  const renderClients = () => <ClientList />;

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Services</h2>
        <button 
          onClick={() => setShowAddService(true)}
          className="bg-[#48BB78] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#3da368] transition-colors"
        >
          <Plus size={18} />
          Ajouter un service
        </button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <span className="text-xs text-[#48BB78] bg-[#F0FFF4] px-2 py-1 rounded-full">{service.category || 'Service'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingService(service)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {service.duration} min
                </span>
                <span className="font-bold text-[#48BB78] text-lg">{service.price} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
          <Scissors size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">Aucun service configuré</p>
          <button 
            onClick={() => setShowAddService(true)}
            className="bg-[#48BB78] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#3da368]"
          >
            Ajouter votre premier service
          </button>
        </div>
      )}
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mon Équipe</h2>
        <button className="bg-[#48BB78] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#3da368] transition-colors">
          <Plus size={18} />
          Inviter un membre
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
        <Users size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Aucun membre d'équipe pour le moment</p>
        <p className="text-sm text-gray-400 mt-2">Invitez vos collaborateurs pour gérer votre salon ensemble</p>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Galerie Photos</h2>
        <button 
          onClick={() => setShowGallery(true)}
          className="bg-[#48BB78] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#3da368] transition-colors"
        >
          <Plus size={18} />
          Ajouter des photos
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <p className="text-gray-500 text-center mb-4">
          Gérez les photos de votre salon pour les rendre visibles en ligne
        </p>
        <button 
          onClick={() => setShowGallery(true)}
          className="mx-auto flex items-center gap-2 bg-[#48BB78] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#3da368] transition-colors"
        >
          <Image size={20} />
          Ouvrir la galerie
        </button>
      </div>
    </div>
  );

  const renderStats = () => {
    // Calculer les statistiques selon la période sélectionnée
    const now = new Date();
    let startDate, endDate;
    
    if (period === 'day') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    const periodAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= startDate && aptDate <= endDate;
    });
    
    const periodRevenue = periodAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    const upcomingAppointments = appointments.filter(apt => new Date(apt.startTime) > new Date());
    const todayAppointmentsCount = appointments.filter(apt => 
      new Date(apt.startTime).toDateString() === new Date().toDateString()
    ).length;
    
    // Calculer l'acompte (30% du prix)
    const depositsCollected = periodRevenue * 0.3;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Statistiques</h2>
          
          {/* Sélecteur de période */}
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 p-1">
            <button
              onClick={() => setPeriod('day')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === 'day' 
                  ? 'bg-[#48BB78] text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === 'week' 
                  ? 'bg-[#48BB78] text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === 'month' 
                  ? 'bg-[#48BB78] text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Mois
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total RDV */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">Total RDV</p>
            <p className="text-3xl font-black">{periodAppointments.length}</p>
          </div>
          
          {/* RDV à venir */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">RDV à venir</p>
            <p className="text-3xl font-black text-[#48BB78]">{upcomingAppointments.length}</p>
          </div>
          
          {/* RDV du jour */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">RDV du jour</p>
            <p className="text-3xl font-black text-blue-600">{todayAppointmentsCount}</p>
          </div>
          
          {/* Chiffre d'affaires */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">Chiffre d'affaires</p>
            <p className="text-3xl font-black text-purple-600">{periodRevenue.toFixed(0)} FCFA</p>
          </div>
          
          {/* Acomptes encaissés */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">Acomptes encaissés</p>
            <p className="text-3xl font-black text-orange-500">{depositsCollected.toFixed(0)} FCFA</p>
          </div>
          
          {/* Période */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-xs mb-2">Période</p>
            <p className="text-lg font-bold text-gray-700">
              {period === 'day' && 'Aujourd\'hui'}
              {period === 'week' && 'Cette semaine'}
              {period === 'month' && 'Ce mois'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleSaveSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setSettingsLoading(true);
      try {
        const formData = new FormData();
        formData.append('name', settingsData.name);
        formData.append('address', settingsData.address);
        formData.append('description', settingsData.description);

        const response = await fetch(`${API_BASE}/admin/salons`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (response.ok) {
          setSalon({ ...salon, ...settingsData });
          setSuccess('Paramètres sauvegardés');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setSettingsLoading(false);
      }
    };

    const handleChangePassword = async () => {
      setPasswordError('');
      setPasswordSuccess('');
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Token manquant - Veuillez vous reconnecter');
        return;
      }

      console.log('Tentative de changement de mot de passe');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'absent');
      
      setPasswordLoading(true);
      try {
        console.log('Envoi de la requête vers:', `${API_BASE}/users/change-password`);
        const response = await fetch(`${API_BASE}/users/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          })
        });

        console.log('Réponse reçue, status:', response.status);
        const data = await response.json();
        console.log('Données:', data);
        
        if (response.ok) {
          setPasswordSuccess('Mot de passe modifié avec succès');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setPasswordError(data.error || 'Erreur lors de la modification');
        }
      } catch (err) {
        console.error('Erreur complète:', err);
        setPasswordError('Erreur de connexion: ' + err.message);
      } finally {
        setPasswordLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Paramètres</h2>
        
        {success && <div className="p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}
        {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Informations du salon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du salon</label>
              <input 
                type="text" 
                value={settingsData.name}
                onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
            <div>
              <PhoneInput
                value={settingsData.phone}
                onChange={(phone) => setSettingsData({ ...settingsData, phone })}
                label=""
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input 
                type="text" 
                value={settingsData.address}
                onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={settingsData.description}
                onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSaveSettings}
              disabled={settingsLoading}
              className="bg-[#48BB78] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#3da368] disabled:opacity-50"
            >
              {settingsLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Sécurité</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]" 
              />
            </div>
            <button 
              onClick={handleChangePassword}
              disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="bg-[#48BB78] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#3da368] disabled:opacity-50"
            >
              {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
            </button>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}
          </div>
        </div>

        {/* Horaires d'ouverture */}
        {salon && (
          <OpeningHoursManager 
            salonId={salon.id} 
            onUpdate={() => fetchSalonData()}
          />
        )}

        <div className="bg-white rounded-3xl border border-red-100 p-6">
          <h3 className="text-lg font-bold text-red-600 mb-4">Zone de danger</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Supprimer le salon</p>
              <p className="text-sm text-gray-400">Cette action est irréversible</p>
            </div>
            <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Planning': return renderPlanning();
      case 'Clients': return renderClients();
      case 'Services': return renderServices();
      case 'Équipe': return renderTeam();
      case 'Galerie': return renderGallery();
      case 'Statistiques': return renderStats();
      case 'Paramètres': return renderSettings();
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8F9FA] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#48BB78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] text-white flex flex-col transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tighter">PLANITY</span>
              <span className="text-[9px] font-bold bg-white text-black px-1 rounded ml-1">PRO</span>
            </div>
            <button 
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          {salon && <p className="text-xs text-gray-400 mt-2 truncate">{salon.name}</p>}
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.name 
                  ? 'bg-[#48BB78] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{activeTab}</h1>
                <p className="text-gray-500 text-sm md:text-base">Gérez votre salon</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} className="text-gray-500" />
              </button>
              {salon?.image && <img src={salon.image} alt="Salon" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />}
            </div>
          </div>
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {showAddService && (
        <AddServiceModal 
          onClose={() => setShowAddService(false)} 
          onAdd={handleAddService}
          existingCategories={[...new Set(services.map(s => s.category).filter(Boolean))]}
        />
      )}
      {editingService && (
        <EditServiceModal 
          service={editingService}
          onClose={() => setEditingService(null)}
          onUpdate={handleUpdateService}
          existingCategories={[...new Set(services.map(s => s.category).filter(Boolean))]}
        />
      )}
      {showAppointmentModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => { setShowAppointmentModal(false); setSelectedAppointment(null); }}
          onCancel={handleCancelAppointment}
        />
      )}
      
      {/* Modal pour gérer les jours fermés */}
      {showClosedDaysModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">Jours fermés</h3>
              <button onClick={() => setShowClosedDaysModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">Sélectionnez les jours de la semaine qui sont fermés :</p>
              <div className="flex flex-wrap gap-2">
                {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, index) => (
                  <button
                    key={day}
                    onClick={() => closedDays.includes(index) ? removeClosedDay(index) : addClosedDay(index)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      closedDays.includes(index)
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 w-full">Jours actuellement fermés :</span>
                {closedDays.length > 0 ? (
                  closedDays.map(dayIndex => (
                    <span key={dayIndex} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][dayIndex]}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Aucun jour fermé</span>
                )}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setShowClosedDaysModal(false)}
                className="px-4 py-2 bg-[#48BB78] text-white rounded-xl font-medium hover:bg-[#3da368] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour bloquer un créneau */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">Bloquer un créneau</h3>
              <button onClick={() => { setShowBlockModal(false); setSelectedSlotToBlock(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">Sélectionnez la date et l'heure du créneau à bloquer :</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedSlotToBlock?.date ? new Date(selectedSlotToBlock.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedSlotToBlock({ ...selectedSlotToBlock, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <select
                    value={selectedSlotToBlock?.hour || 9}
                    onChange={(e) => setSelectedSlotToBlock({ ...selectedSlotToBlock, hour: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={hour}>
                        {hour}:00 - {hour + 1}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Congés, maintenance..."
                    value={selectedSlotToBlock?.reason || ''}
                    onChange={(e) => setSelectedSlotToBlock({ ...selectedSlotToBlock, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Créneaux bloqués */}
              {blockedSlots.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Créneaux actuellement bloqués :</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {blockedSlots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{new Date(slot.date).toLocaleDateString('fr-FR')} - {slot.hour}:00</p>
                          {slot.reason && <p className="text-xs text-gray-500">{slot.reason}</p>}
                        </div>
                        <button
                          onClick={() => unblockSlot(slot.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => { setShowBlockModal(false); setSelectedSlotToBlock(null); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const date = selectedSlotToBlock?.date || new Date().toISOString().split('T')[0];
                  const hour = selectedSlotToBlock?.hour || 9;
                  blockSlot(date, hour, selectedSlotToBlock?.reason);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Lock size={16} />
                Bloquer le créneau
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Galerie Photos */}
      {showGallery && (
        <GalleryManager 
          salon={salon}
          onClose={() => setShowGallery(false)}
        />
      )}
    </div>
  );
};

export default ProDashboard;
