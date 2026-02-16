import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isProfessionalUser } from '../AuthContext';

const ProfessionalLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Allow both clients and professionals to view this page
  // Clients can explore the pro offer, professionals can access their dashboard
  useEffect(() => {
    // Only redirect if user is a professional
    if (user && isProfessionalUser(user)) {
      navigate('/professional/dashboard');
    }
    // Don't redirect clients - let them see the professional landing page
  }, [user, navigate]);

  return (
    <div className="bg-white min-h-screen flex flex-col items-center pt-16 px-4">
      <div className="mb-12">
        <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-black">
          Planity <span className="text-[10px] align-top font-medium ml-1">PRO</span>
        </h1>
      </div>

      <div className="max-w-2xl w-full">
        <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4">
          Devenir partenaire Planity Pro
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">
          Soyez visibles auprès de <span className="font-bold text-gray-900">15 millions d'utilisateurs.</span>
        </p>

        <div className="space-y-3 mb-12">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-base">Sans engagement</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-base">Sans commission</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/pro-register')}
            className="group flex items-center w-full p-6 border border-blue-600/30 rounded-lg hover:bg-blue-50/40 transition-all duration-200"
          >
            <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mr-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-2 3 2-3 2-3-2zM17 12l-3-2-3 2 3 2 3-2zM7 8l-3-2M17 8l3-2M7 16l-3 2M17 16l3 2"></path>
              </svg>
            </div>
            <div className="grow text-left">
              <h3 className="text-lg font-semibold text-gray-900">Je suis gérant d'un établissement</h3>
              <p className="text-sm text-gray-500">Coiffure, esthétique, barber, bien-être...</p>
            </div>
            <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="group flex items-center w-full p-6 border border-blue-600/30 rounded-lg hover:bg-blue-50/40 transition-all duration-200"
          >
            <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mr-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div className="grow text-left">
              <h3 className="text-lg font-semibold text-gray-900">Je ne suis pas un professionnel</h3>
              <p className="text-sm text-gray-500">Je souhaite prendre un rendez-vous beauté</p>
            </div>
            <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLanding;
