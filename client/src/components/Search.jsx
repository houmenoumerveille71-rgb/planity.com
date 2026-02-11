import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchSalons } from "../services/api";

export default function Search() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const ville = params.get("ville");
  const service = params.get("service");
  const [salons, setSalons] = useState([]);

  useEffect(() => {
    searchSalons(ville, service).then(setSalons);
  }, [ville, service]);

  const allServices = salons.flatMap(salon => salon.services.map(s => ({ ...s, salon })));

  return (
    <div>
      <h1>Résultats pour {service} à {ville}</h1>
      {allServices.length === 0 ? (
        <p>Aucun service trouvé.</p>
      ) : (
        allServices.map((s) => (
          <div key={s.id}>
            <h2>{s.name}</h2>
            <p>Prix: {s.price} FCFA</p>
            <p>Durée: {s.duration} min</p>
            <p>Salon: {s.salon.name}</p>
            <p>Adresse: {s.salon.address}</p>
          </div>
        ))
      )}
    </div>
  );
}
