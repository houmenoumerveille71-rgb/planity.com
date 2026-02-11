import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const questions = [
    {
      q: "Qu'est-ce que Planity ?",
      a: "Planity est la plateforme de référence pour la prise de rendez-vous beauté en ligne. Elle permet aux clients de trouver et réserver facilement des créneaux chez les meilleurs professionnels de leur région."
    },
    {
      q: "Comment prendre rendez-vous sur Planity ?",
      a: "Il vous suffit de rechercher un établissement près de chez vous, choisir une prestation, sélectionner un créneau horaire et valider votre réservation. Vous recevrez une confirmation par email."
    },
    {
      q: "Est-ce que je dois payer en ligne sur Planity ?",
      a: "Tout dépend de l'établissement. Certains professionnels demandent un acompte en ligne, d'autres préfèrent le paiement sur place. Cette information est précisée lors de votre réservation."
    },
    {
      q: "Comment gérer mes rendez-vous sur Planity ?",
      a: "Vous pouvez modifier ou annuler vos RDV depuis votre espace 'Mon compte'. Cliquez sur le rendez-vous concerné et suivez les instructions pour le modifier ou l'annuler."
    },
    {
      q: "Comment faire apparaître mon salon ou institut sur Planity ?",
      a: "Cliquez sur 'Je suis un professionnel' en haut à droite pour nous rejoindre. Vous pourrez créer votre page, gérer vos disponibilités et accueillir de nouveaux clients."
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Titre identique à l'image */}
        <h2 className="text-4xl md:text-5xl text-center text-gray-800 mb-12 font-light tracking-tight">
          Les questions fréquentes
        </h2>

        <div className="space-y-0">
          {questions.map((item, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center py-8 text-left hover:text-black transition-colors"
              >
                <span className="text-xl md:text-2xl font-light text-gray-700 pr-4">
                  {item.q}
                </span>
                <ChevronDown 
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {/* Contenu qui s'affiche au clic */}
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 pb-8' : 'max-h-0'}`}>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
