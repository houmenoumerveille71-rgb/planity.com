const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const searchSalons = async (ville, service) => {
  const params = new URLSearchParams();
  if (ville) params.set('location', ville);
  if (service) params.set('service', service);
  const response = await fetch(`${API_BASE}/salons/search?${params.toString()}`);
  return response.json();
};

export const getSalonById = async (id) => {
  const response = await fetch(`${API_BASE}/salons/${id}`);
  return response.json();
};

export const searchServices = async (query) => {
  const response = await fetch(`${API_BASE}/services/search?query=${encodeURIComponent(query)}`);
  return response.json();
};

export const searchSalonsByName = async (query) => {
  const response = await fetch(`${API_BASE}/salons/search?name=${encodeURIComponent(query)}`);
  return response.json();
};