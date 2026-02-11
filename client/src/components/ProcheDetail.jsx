import React, { useState } from 'react';
import { Mail, Phone, ChevronDown, ChevronUp, Check } from 'lucide-react';

const ProcheDetail = ({ proche, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce proche ?')) {
      onDelete(proche.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
      <div className="flex flex-col gap-6">
        
        {/* En-tête cliquable pour déplier */}
        <div 
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">
              {proche.nom}
            </h4>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium">
              {proche.email && (
                <>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{proche.email}</span>
                  </div>
                  {proche.telephone && <span className="text-gray-200">•</span>}
                </>
              )}
              {proche.telephone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{proche.telephone}</span>
                </div>
              )}
            </div>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>

        {/* Panneau dépliant */}
        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Boîte grise des droits */}
            <div className="bg-[#F8F9FA] rounded-xl p-6 border border-gray-100">
              <p className="text-gray-700 font-semibold mb-4">Vous pouvez :</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-600 text-[15px]">
                  <Check size={18} className="text-teal-500" />
                  <span>Prendre RDV pour ce proche</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-[15px]">
                  <Check size={18} className="text-teal-500" />
                  <span>Modifier et supprimer tous ses RDVs</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-[15px]">
                  <Check size={18} className="text-teal-500" />
                  <span>Modifier ses informations personnelles</span>
                </li>
              </ul>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onEdit(proche)}
                className="px-6 py-2.5 border-2 border-black rounded-xl font-bold text-black hover:bg-gray-50 transition-all"
              >
                Modifier le proche
              </button>
              <button 
                onClick={handleDelete}
                className="px-6 py-2.5 border-2 border-red-100 rounded-xl font-bold text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                Supprimer le proche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcheDetail;
