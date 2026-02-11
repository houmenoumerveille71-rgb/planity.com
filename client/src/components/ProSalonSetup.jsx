import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import NavbarPro from './NavbarPro';
import { MapPin, Image, Clock, DollarSign, Scissors, Plus, Trash2, Save, Check, Upload } from 'lucide-react';

const ProSalonSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Récupérer le token directement du localStorage car AuthContext peut ne pas être à jour
  const [token, setToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger le token au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      // Pas de token, rediriger vers login
      navigate('/pro-login');
    }
    setLoadingToken(false);
  }, [navigate]);

  // État du formulaire salon
  const [salon, setSalon] = useState({
    name: '',
    address: '',
    city: '',
    category: 'salon',
    description: '',
    image: null,
    imagePreview: null,
    openingHours: {
      monday: { open: '09:00', close: '19:00', enabled: true },
      tuesday: { open: '09:00', close: '19:00', enabled: true },
      wednesday: { open: '09:00', close: '19:00', enabled: true },
      thursday: { open: '09:00', close: '19:00', enabled: true },
      friday: { open: '09:00', close: '19:00', enabled: true },
      saturday: { open: '09:00', close: '19:00', enabled: false },
      sunday: { open: '00:00', close: '00:00', enabled: false },
    },
    depositRequired: false,
    cancellationDelay: '24',
    validationMode: 'auto',
  });

  // État des prestations
  const [services, setServices] = useState([
    { name: '', price: '', duration: 30, active: true }
  ]);

  // Catégories
  const categories = [
    { value: 'salon', label: 'Salon de coiffure' },
    { value: 'institut', label: 'Institut de beauté' },
    { value: 'spa', label: 'Spa' },
    { value: 'barbier', label: 'Barbier' },
    { value: 'onglerie', label: 'Salon d\'onglerie' },
  ];

  // Vérifier si l'utilisateur a déjà un salon
  useEffect(() => {
    const checkExistingSalon = async () => {
      try {
        const currentToken = token || localStorage.getItem('token');
        if (!currentToken) return;
        
        const response = await fetch('http://localhost:5000/api/admin/salons', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        if (response.ok) {
          const salonData = await response.json();
          if (salonData) {
            // Rediriger vers le dashboard si le salon existe déjà
            navigate('/professional/dashboard');
          }
        }
      } catch (err) {
        console.log('Pas encore de salon');
      }
    };

    if (!loadingToken) {
      checkExistingSalon();
    }
  }, [user, token, navigate, loadingToken]);

  // Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSalon({
          ...salon,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Ajouter une prestation
  const addService = () => {
    setServices([...services, { name: '', price: '', duration: 30, active: true }]);
  };

  // Supprimer une prestation
  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Modifier une prestation
  const updateService = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  // Sauvegarder le salon
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Récupérer le token directement du localStorage
    const authToken = token || localStorage.getItem('token');
    
    if (!authToken) {
      setError('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      setTimeout(() => navigate('/pro-login'), 2000);
      return;
    }

    try {
      // Utiliser FormData si une image est présente
      let response;
      if (salon.image) {
        const formData = new FormData();
        formData.append('name', salon.name);
        formData.append('address', salon.address);
        formData.append('city', salon.city);
        formData.append('category', salon.category);
        formData.append('description', salon.description);
        formData.append('depositRequired', salon.depositRequired);
        formData.append('cancellationDelay', salon.cancellationDelay);
        formData.append('validationMode', salon.validationMode);
        formData.append('image', salon.image);
        
        response = await fetch('http://localhost:5000/api/admin/salons', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData,
        });
      } else {
        // Sans image, utiliser JSON
        response = await fetch('http://localhost:5000/api/admin/salons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            name: salon.name,
            address: salon.address,
            city: salon.city,
            category: salon.category,
            description: salon.description,
            depositRequired: salon.depositRequired,
            cancellationDelay: salon.cancellationDelay,
            validationMode: salon.validationMode,
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder les prestations
        for (const service of services) {
          if (service.name && service.price) {
            await fetch('http://localhost:5000/api/admin/services', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify(service),
            });
          }
        }

        setSuccess('Félicitations ! Votre salon est maintenant en ligne.');
        setTimeout(() => {
          navigate('/professional/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Étape 1: Informations du salon
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Informations de votre salon</h2>
      <p className="text-gray-600">Renseignez les informations de votre établissement</p>

      <div className="space-y-4">
        {/* Nom du salon */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nom du salon *</label>
          <input
            type="text"
            value={salon.name}
            onChange={(e) => setSalon({ ...salon, name: e.target.value })}
            placeholder="Ex: Planity Coiffure"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#48BB78] outline-none"
          />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Adresse exacte *</label>
          <div className="relative">
            <input
              type="text"
              value={salon.address}
              onChange={(e) => setSalon({ ...salon, address: e.target.value })}
              placeholder="123 Rue de la République"
              className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#48BB78] outline-none"
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ville *</label>
          <input
            type="text"
            value={salon.city}
            onChange={(e) => setSalon({ ...salon, city: e.target.value })}
            placeholder="Paris"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#48BB78] outline-none"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie *</label>
          <select
            value={salon.category}
            onChange={(e) => setSalon({ ...salon, category: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#48BB78] outline-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <textarea
            value={salon.description}
            onChange={(e) => setSalon({ ...salon, description: e.target.value })}
            placeholder="Décrivez votre salon..."
            rows={4}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#48BB78] outline-none"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Image / Logo</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#48BB78] transition-colors">
            {salon.imagePreview ? (
              <div className="relative">
                <img src={salon.imagePreview} alt="Aperçu" className="max-h-48 mx-auto rounded-lg" />
                <button
                  onClick={() => setSalon({ ...salon, image: null, imagePreview: null })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto text-gray-400" size={32} />
                <p className="text-gray-500">Cliquez ou glissez une image ici</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-4 py-2 bg-[#48BB78] text-white rounded-lg cursor-pointer hover:bg-[#3da368]"
                >
                  Choisir un fichier
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!salon.name || !salon.address || !salon.city}
        className="w-full py-4 bg-[#48BB78] text-white rounded-xl font-bold text-lg hover:bg-[#3da368] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant: Horaires et disponibilités
      </button>
    </div>
  );

  // Étape 2: Horaires
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Horaires d'ouverture</h2>
      <p className="text-gray-600">Définissez vos horaires d'ouverture</p>

      <div className="space-y-3">
        {Object.entries(salon.openingHours).map(([day, hours]) => (
          <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={hours.enabled}
                onChange={(e) => setSalon({
                  ...salon,
                  openingHours: {
                    ...salon.openingHours,
                    [day]: { ...hours, enabled: e.target.checked }
                  }
                })}
                className="w-5 h-5 rounded border-gray-300 text-[#48BB78] focus:ring-[#48BB78]"
              />
              <span className="font-medium capitalize">{day}</span>
            </div>
            {hours.enabled ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => setSalon({
                    ...salon,
                    openingHours: {
                      ...salon.openingHours,
                      [day]: { ...hours, open: e.target.value }
                    }
                  })}
                  className="p-2 border border-gray-200 rounded-lg"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => setSalon({
                    ...salon,
                    openingHours: {
                      ...salon.openingHours,
                      [day]: { ...hours, close: e.target.value }
                    }
                  })}
                  className="p-2 border border-gray-200 rounded-lg"
                />
              </div>
            ) : (
              <span className="text-gray-400">Fermé</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
        >
          Retour
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-4 bg-[#48BB78] text-white rounded-xl font-bold text-lg hover:bg-[#3da368]"
        >
          Suivant: Prestations
        </button>
      </div>
    </div>
  );

  // Étape 3: Prestations
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Vos prestations</h2>
      <p className="text-gray-600">Ajoutez les services que vous proposez</p>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Prestation {index + 1}</span>
              {services.length > 1 && (
                <button
                  onClick={() => removeService(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
                placeholder="Nom du service"
                className="p-3 border border-gray-200 rounded-lg"
              />
              <div className="relative">
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(index, 'price', e.target.value)}
                  placeholder="Prix"
                  className="w-full p-3 pr-8 border border-gray-200 rounded-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">FCA</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={service.duration}
                  onChange={(e) => updateService(index, 'duration', e.target.value)}
                  placeholder="Durée (min)"
                  className="w-full p-3 pr-12 border border-gray-200 rounded-lg"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">min</span>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addService}
          className="w-full py-3 border border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-[#48BB78] hover:text-[#48BB78] flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Ajouter une prestation
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
        >
          Retour
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex-1 py-4 bg-[#48BB78] text-white rounded-xl font-bold text-lg hover:bg-[#3da368]"
        >
          Suivant: Paramètres
        </button>
      </div>
    </div>
  );

  // Étape 4: Paramètres
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
      <p className="text-gray-600">Configurez les règles de votre établissement</p>

      <div className="space-y-4">
        {/* Acompte */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Exiger un acompte</h3>
              <p className="text-sm text-gray-500">Demander un acompte lors de la réservation</p>
            </div>
            <button
              onClick={() => setSalon({ ...salon, depositRequired: !salon.depositRequired })}
              className={`w-12 h-7 rounded-full transition-colors ${salon.depositRequired ? 'bg-[#48BB78]' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${salon.depositRequired ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Délai d'annulation */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block font-bold text-gray-900 mb-2">Délai d'annulation</label>
          <select
            value={salon.cancellationDelay}
            onChange={(e) => setSalon({ ...salon, cancellationDelay: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="0">Pas de délai (annulation gratuite)</option>
            <option value="24">24 heures avant</option>
            <option value="48">48 heures avant</option>
            <option value="72">72 heures avant</option>
          </select>
        </div>

        {/* Mode de validation */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block font-bold text-gray-900 mb-2">Publication du salon</label>
          <select
            value={salon.validationMode}
            onChange={(e) => setSalon({ ...salon, validationMode: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="auto">Publication automatique</option>
            <option value="manual">Validation par l'équipe Planity</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !salon.name}
          className="flex-1 py-4 bg-[#48BB78] text-white rounded-xl font-bold text-lg hover:bg-[#3da368] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Sauvegarde...' : (
            <>
              <Check size={24} />
              Finaliser et mettre en ligne
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPro />

      {/* Loading state pendant la vérification du token */}
      {loadingToken && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#48BB78] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Vérification de votre session...</p>
          </div>
        </div>
      )}

      {/* Message de succès */}
      {success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-[#48BB78]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#48BB78]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
            <p className="text-gray-600">{success}</p>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="fixed top-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg z-50">
          {error}
        </div>
      )}

      {/* Masquer le formulaire pendant la vérification du token */}
      {!loadingToken && (
        <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-[#48BB78]' : 'text-gray-400'}`}>Salon</span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-[#48BB78]' : 'text-gray-400'}`}>Horaires</span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-[#48BB78]' : 'text-gray-400'}`}>Services</span>
            <span className={`text-sm font-medium ${step >= 4 ? 'text-[#48BB78]' : 'text-gray-400'}`}>Paramètres</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#48BB78] rounded-full transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
        </div>
      )}
    </div>
  );
};

export default ProSalonSetup;
