import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isProfessionalUser } from '../AuthContext';
import AddProcheModal from './AddProcheModal';
import EditProcheModal from './EditProcheModal';
import ProcheDetail from './ProcheDetail';
import Nav from './Navbar';
import Footer from './Footer';

const MesProches = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProche, setEditingProche] = useState(null);
  const [proches, setProches] = useState([]);

  // Redirect professionals to their dashboard
  useEffect(() => {
    if (user && isProfessionalUser(user)) {
      navigate('/professional/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddProche = (data) => {
    const newProche = {
      id: Date.now(),
      nom: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email || '',
      telephone: data.phone || ''
    };
    setProches([...proches, newProche]);
    setIsAddModalOpen(false);
  };

  const handleEditProche = (data) => {
    const updatedProche = {
      id: data.id,
      nom: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email || '',
      telephone: data.phone || ''
    };
    setProches(proches.map(p => p.id === data.id ? updatedProche : p));
    setIsEditModalOpen(false);
    setEditingProche(null);
  };

  const handleDeleteProche = (id) => {
    setProches(proches.filter(p => p.id !== id));
  };

  const openEditModal = (proche) => {
    setEditingProche(proche);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Nav />
      <div className="bg-[#F8F9FA] min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white rounded-2xl p-6 shadow-sm self-start">
          <h3 className="text-xl font-bold mb-8">Mon compte</h3>
          <ul className="space-y-6">
            <li 
              onClick={() => navigate('/account')}
              className="text-gray-500 font-semibold cursor-pointer hover:text-black transition-colors"
            >
              Mes rendez-vous
            </li>
            <li 
              onClick={() => navigate('/account/settings')}
              className="text-gray-500 font-semibold cursor-pointer hover:text-black transition-colors"
            >
              Mes informations
            </li>
            <li 
              className="text-black font-black border-l-4 border-black pl-3 -ml-6"
            >
              Mes proches
            </li>
          </ul>
          <div className="mt-12 pt-6 border-t">
            <button 
              onClick={handleLogout}
              className="text-red-500 font-bold hover:opacity-70 transition-opacity cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          
          {/* Section Mes proches */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8">Mes proches</h3>

            {/* Liste des proches avec détail */}
            {proches.length > 0 ? (
              <div className="space-y-4">
                {proches.map(proche => (
                  <ProcheDetail 
                    key={proche.id} 
                    proche={proche} 
                    onEdit={openEditModal}
                    onDelete={handleDeleteProche}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-8">Vous n'avez pas encore ajouté de proche.</p>
            )}

            {/* Bouton pour ouvrir le modal d'ajout */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-black transition-all mt-6"
            >
              <UserPlus size={20} />
              <span>Ajouter un proche</span>
            </button>
          </div>

          {/* Section Cartes enregistrées (placeholder) */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Cartes enregistrées</h3>
          </div>
        </main>
      </div>

      {/* Modal d'ajout */}
      <AddProcheModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProche}
      />

      {/* Modal d'édition */}
      <EditProcheModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProche(null);
        }}
        onSubmit={handleEditProche}
        proche={editingProche}
      />
    </div>
    <Footer />
    </>
  );
};

export default MesProches;
