import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SalonAdmin = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState(null);
  const [editingSalon, setEditingSalon] = useState(false);
  const [salonForm, setSalonForm] = useState({
    name: '',
    address: '',
    category: '',
    description: '',
    openingHours: '',
    image: '',
    imageFile: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  useEffect(() => {
    if (user?.role === 'salon_owner') {
      fetchSalonAppointments();
      fetchSalonData();
    }
  }, [user]);

  const fetchSalonAppointments = async () => {
    try {
      // For demo, fetch all appointments (in real app, filter by salon)
      const response = await fetch(`${API_BASE}/appointments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const fetchSalonData = async () => {
    try {
      const response = await fetch(`${API_BASE}/salons/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSalon(data);
        setSalonForm({
          name: data.name || '',
          address: data.address || '',
          category: data.category || '',
          description: data.description || '',
          openingHours: data.openingHours || '',
          image: data.image || '',
          imageFile: null
        });
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement du salon:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Store the file for upload
      setSalonForm({ ...salonForm, imageFile: file });
    }
  };

  const handleSalonSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = salonForm.image;
      
      // If there's a new image file, upload it first
      if (salonForm.imageFile) {
        const formData = new FormData();
        formData.append('file', salonForm.imageFile);
        
        const uploadResponse = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          alert('Erreur lors du téléchargement de l\'image');
          return;
        }
      }
      
      // Update salon with the image URL
      const response = await fetch(`${API_BASE}/salons/${salon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: salonForm.name,
          address: salonForm.address,
          category: salonForm.category,
          description: salonForm.description,
          openingHours: salonForm.openingHours,
          image: imageUrl,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalon(data);
        setEditingSalon(false);
        alert('Salon mis à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour du salon');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la mise à jour du salon');
    }
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setNewImageFile(file);
    }
  };

  const handleAddImage = async () => {
    if (!newImageFile) {
      alert('Veuillez sélectionner une image');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', newImageFile);
      
      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        
        // Add image to salon's gallery (for demo, we'll just update the main image)
        const response = await fetch(`${API_BASE}/salons/${salon.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            image: uploadData.url,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSalon(data);
          setNewImageFile(null);
          setNewImagePreview(null);
          alert('Image ajoutée avec succès !');
        } else {
          alert('Erreur lors de l\'ajout de l\'image');
        }
      } else {
        alert('Erreur lors du téléchargement de l\'image');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'ajout de l\'image');
    }
  };

  if (!user || user.role !== 'salon_owner') {
    return <div className="p-8">Accès refusé</div>;
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Administration Salon</h1>
      
      {/* Section d'édition du salon */}
      {salon && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Informations du salon</h2>
            <button
              onClick={() => setEditingSalon(!editingSalon)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingSalon ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          {editingSalon ? (
            <form onSubmit={handleSalonSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du salon</label>
                  <input
                    type="text"
                    value={salonForm.name}
                    onChange={(e) => setSalonForm({ ...salonForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={salonForm.category}
                    onChange={(e) => setSalonForm({ ...salonForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Coiffeur">Coiffeur</option>
                    <option value="Esthéticienne">Esthéticienne</option>
                    <option value="Barbier">Barbier</option>
                    <option value="Spa">Spa</option>
                    <option value="Onglerie">Onglerie</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={salonForm.address}
                  onChange={(e) => setSalonForm({ ...salonForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={salonForm.description}
                  onChange={(e) => setSalonForm({ ...salonForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={salonForm.openingHours}
                  onChange={(e) => setSalonForm({ ...salonForm, openingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Lun - Sam: 9h00 - 19h00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image du salon</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <span className="text-4xl">📷</span>
                        <p className="text-sm text-gray-500 mt-2">Ajouter une image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Enregistrer les modifications
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSalon(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  {salon.image ? (
                    <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{salon.name}</h3>
                  <p className="text-gray-600">{salon.address}</p>
                  <p className="text-gray-600">{salon.category}</p>
                  {salon.description && (
                    <p className="text-gray-600 mt-2">{salon.description}</p>
                  )}
                  <p className="text-gray-600 mt-2">
                    <strong>Horaires:</strong> {salon.openingHours || 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Section galerie photos */}
      {salon && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Galerie photos</h2>
            <button
              onClick={() => setShowGalleryModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Ajouter une photo
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {salon.image && (
              <div className="relative group">
                <img
                  src={salon.image}
                  alt="Photo principale"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Principale
                </span>
              </div>
            )}
            {/* Placeholder pour ajouter plus de photos */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
              <span className="text-4xl text-gray-400">+</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal galerie photos */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Galerie photos</h2>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une nouvelle photo</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {newImagePreview && (
                      <div className="mt-4">
                        <img
                          src={newImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddImage}
                    disabled={!newImageFile}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Note: Pour l'instant, seule l'image principale est gérée. Vous pouvez ajouter plusieurs photos pour créer une galerie complète.
              </p>
              
              <button
                onClick={() => setShowGalleryModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Rendez-vous aujourd'hui</h3>
          <p className="text-2xl font-bold text-blue-600">
            {appointments.filter(appt =>
              new Date(appt.startTime).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total rendez-vous</h3>
          <p className="text-2xl font-bold text-green-600">{appointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Revenus totaux</h3>
          <p className="text-2xl font-bold text-purple-600">
            {appointments.reduce((sum, appt) => sum + (appt.invoice?.amount || 0), 0)} FCFA
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Tous les rendez-vous</h3>
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="border p-4 rounded">
              <p><strong>Client:</strong> {appt.user?.name}</p>
              <p><strong>Service:</strong> {appt.service?.name}</p>
              <p><strong>Date:</strong> {new Date(appt.startTime).toLocaleString('fr-FR')}</p>
              <p><strong>Statut paiement:</strong> {appt.invoice?.status === 'paid' ? 'Payé' : 'En attente'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonAdmin;