import React, { useState, useEffect } from 'react';
import { Clock, Save, Trash2 } from 'lucide-react';

const DAYS = [
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
  { value: 0, label: 'Dimanche', short: 'Dim' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function OpeningHoursManager({ salonId, readOnly = false, onUpdate }) {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (salonId) fetchAvailabilities();
  }, [salonId]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/salons/${salonId}/availabilities`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(data);
      }
    } catch (err) {
      console.error('Erreur chargement horaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayValue) => {
    setAvailabilities(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayValue);
      if (existing) {
        return prev.filter(a => a.dayOfWeek !== dayValue);
      } else {
        const newList = [...prev, {
          dayOfWeek: dayValue,
          startTime: '09:00',
          endTime: '19:00'
        }];
        // Tri par jour de la semaine pour garder l'ordre logique
        return newList.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      }
    });
  };

  const handleTimeChange = (dayValue, field, value) => {
    setAvailabilities(prev => prev.map(a => 
      a.dayOfWeek === dayValue ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.');
      setSaving(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/salons/${salonId}/availabilities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // IMPORTANT: On envoie un objet avec la clé "availabilities"
        body: JSON.stringify({ availabilities }) 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Horaires enregistrés avec succès !');
        setTimeout(() => setSuccess(''), 3000);
        if (onUpdate) onUpdate();
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#48BB78]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock size={24} className="text-[#48BB78]" />
            Horaires d'ouverture
          </h3>
          <p className="text-sm text-gray-500 mt-1">Définissez vos créneaux d'activité hebdomadaires.</p>
        </div>
        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-[#48BB78] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3da368] transition-all disabled:opacity-50 shadow-lg shadow-green-100"
          >
            {saving ? <div className="h-5 w-5 animate-spin border-2 border-white/30 border-t-white rounded-full"/> : <Save size={20} />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm">{success}</div>}

      {/* Days List */}
      <div className="space-y-4">
        {DAYS.map(day => {
          const availability = availabilities.find(a => a.dayOfWeek === day.value);
          const isOpen = !!availability;

          return (
            <div 
              key={day.value}
              className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                isOpen ? 'bg-green-50/50 border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-80'
              }`}
            >
              {/* Day Label & Toggle */}
              <div className="flex items-center justify-between md:w-48">
                <span className={`font-bold text-base ${isOpen ? 'text-green-700' : 'text-gray-400'}`}>
                  {day.label}
                </span>
                
                {!readOnly && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={() => handleToggleDay(day.value)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#48BB78]"></div>
                  </label>
                )}
              </div>

              {/* Time Inputs */}
              <div className="flex items-center gap-3 flex-1">
                {isOpen ? (
                  <>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      <input
                        type="time"
                        value={availability.startTime}
                        onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                        disabled={readOnly}
                        className="focus:outline-none text-sm font-medium text-gray-700 bg-transparent"
                      />
                    </div>
                    <span className="text-gray-400 font-medium">à</span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                      <input
                        type="time"
                        value={availability.endTime}
                        onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                        disabled={readOnly}
                        className="focus:outline-none text-sm font-medium text-gray-700 bg-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm font-medium italic px-1">Fermé ce jour</span>
                )}
              </div>

              {/* Status Badge */}
              {isOpen && (
                <div className="hidden lg:block">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-green-600 bg-white border border-green-100 px-3 py-1 rounded-full shadow-sm">
                    Ouvert
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}