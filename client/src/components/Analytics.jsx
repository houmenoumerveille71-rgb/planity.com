import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement des statistiques...</div>;

  if (!stats) return <div className="p-8">Erreur de chargement</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Analyses et Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Chiffre d'Affaires Total</h3>
          <p className="text-2xl font-bold text-green-600">{stats.totalRevenue} FCFA</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Nombre de Rendez-vous</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Taux de Remplissage</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.occupancyRate.toFixed(1)} %</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Services les Plus Populaires</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Nombre de Rendez-vous</th>
            </tr>
          </thead>
          <tbody>
            {stats.topServices.map((service, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{service.name}</td>
                <td className="py-2">{service.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;