import { useEffect, useState } from 'react';

function SalonList() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appel à ton serveur Express
    fetch('http://localhost:5000/api/salons')
      .then((res) => res.json())
      .then((data) => {
        setSalons(data);
        setLoading(false);
      })
      .catch((err) => console.error("Erreur de récupération:", err));
  }, []);

  if (loading) return <p>Chargement des salons...</p>;

  return (
    <div className="salon-grid">
      {salons.map((salon) => (
        <div key={salon.id} className="salon-card">
          <img src={salon.imageUrl || 'https://via.placeholder.com/300x200'} alt={salon.name} />
          <h3>{salon.name}</h3>
          <p>{salon.category}</p>
          <p>{salon.address}</p>
          <button>Voir les prestations</button>
        </div>
      ))}
    </div>
  );
}