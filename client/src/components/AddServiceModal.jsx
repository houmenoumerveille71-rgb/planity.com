import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddServiceModal = ({ onClose, onAdd, existingCategories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 30,
    category: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Catégories par défaut si aucune n'existe encore
  const defaultCategories = ['Coiffure', 'Coloration', 'Coupe', 'Soin', 'Barbe', 'Manucure', 'Pédicure', 'Maquillage', 'Épilation', 'Autre'];

  // Combiner les catégories existantes avec les catégories par défaut
  const availableCategories = existingCategories.length > 0 
    ? existingCategories 
    : defaultCategories;

  useEffect(() => {
    if (existingCategories.length > 0) {
      setFormData(prev => ({ ...prev, category: existingCategories[0] }));
    } else if (defaultCategories.length > 0) {
      setFormData(prev => ({ ...prev, category: defaultCategories[0] }));
    }
  }, [existingCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Si l'utilisateur a entré une nouvelle catégorie, l'utiliser
    const categoryToUse = showNewCategoryInput && newCategory.trim() 
      ? newCategory.trim() 
      : formData.category;

    onAdd({
      ...formData,
      category: categoryToUse,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Ajouter un service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Coupe homme"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="25"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
                min="5"
                step="5"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            {!showNewCategoryInput ? (
              <div className="space-y-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="text-sm text-[#48BB78] hover:underline"
                >
                  + Nouvelle catégorie
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nouvelle catégorie"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim()) {
                        setFormData({ ...formData, category: newCategory.trim() });
                      }
                      setShowNewCategoryInput(false);
                    }}
                    className="px-3 py-1 bg-[#48BB78] text-white text-sm rounded-lg"
                  >
                    Valider
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory('');
                      setShowNewCategoryInput(false);
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du service..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#48BB78]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#48BB78] text-white rounded-xl font-bold hover:bg-[#3da368]"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
