const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-16 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Colonne 1 : Logo et Réseaux */}
        <div className="space-y-6">
          <h2 className="text-white text-2xl font-bold tracking-tighter">PLANITY</h2>
          <div className="flex gap-4">
            <div className="w-10 h-10 border border-gray-700 rounded-md flex items-center justify-center hover:text-white cursor-pointer">f</div>
            <div className="w-10 h-10 border border-gray-700 rounded-md flex items-center justify-center hover:text-white cursor-pointer">i</div>
          </div>
        </div>

        {/* Colonne 2 : À propos */}
        <div>
          <h3 className="text-white font-bold mb-6">À propos de Planity</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer">Je suis un professionnel de beauté</li>
            <li className="hover:text-white cursor-pointer">Rejoignez-nous</li>
            <li className="hover:text-white cursor-pointer">CGU</li>
            <li className="hover:text-white cursor-pointer">Planity Bénin</li>
            <li className="hover:text-white cursor-pointer">Politique de confidentialité</li>
            <li className="hover:text-white cursor-pointer">Gestion des cookies</li>
          </ul>
        </div>

        {/* Colonne 3 : Prestations */}
        <div>
          <h3 className="text-white font-bold mb-6">Trouvez votre prestation</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Coiffeur" className="hover:text-white">Coiffeur</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Institut" className="hover:text-white">Institut de beauté</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Barbier" className="hover:text-white">Barbier</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Manucure" className="hover:text-white">Manucure et beauté des pieds</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Massage" className="hover:text-white">Massage</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Bien-être" className="hover:text-white">Bien-être</a>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Recherches fréquentes */}
        <div>
          <h3 className="text-white font-bold mb-6">Recherches fréquentes</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Coiffeur&city=Cotonou" className="hover:text-white">Coiffeur Cotonou</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Coiffeur&city=Porto-Novo" className="hover:text-white">Coiffeur Porto-Novo</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Coiffeur&city=Parakou" className="hover:text-white">Coiffeur Parakou</a>
            </li>
            <li className="hover:text-white cursor-pointer">
              <a href="/search?category=Coiffeur&city=Calavi" className="hover:text-white">Coiffeur Calavi</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Ligne du bas */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-xs">
        <p>Copyright © 2026 Planity</p>
      </div>
    </footer>
  );
};

export default Footer;
