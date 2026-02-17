import React, { useState } from 'react';

// Liste complète des pays avec indicatif et code de drapeau ISO
const countries = [
  { code: 'AF', name: 'Afghanistan', dialCode: '+93' },
  { code: 'AL', name: 'Albanie', dialCode: '+355' },
  { code: 'DZ', name: 'Algérie', dialCode: '+213' },
  { code: 'DE', name: 'Allemagne', dialCode: '+49' },
  { code: 'AD', name: 'Andorre', dialCode: '+376' },
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'AI', name: 'Anguilla', dialCode: '+1' },
  { code: 'AG', name: 'Antigua-et-Barbuda', dialCode: '+1' },
  { code: 'SA', name: 'Arabie Saoudite', dialCode: '+966' },
  { code: 'AR', name: 'Argentine', dialCode: '+54' },
  { code: 'AM', name: 'Arménie', dialCode: '+374' },
  { code: 'AW', name: 'Aruba', dialCode: '+297' },
  { code: 'AU', name: 'Australie', dialCode: '+61' },
  { code: 'AT', name: 'Autriche', dialCode: '+43' },
  { code: 'AZ', name: 'Azerbaïdjan', dialCode: '+994' },
  { code: 'BS', name: 'Bahamas', dialCode: '+1' },
  { code: 'BH', name: 'Bahreïn', dialCode: '+973' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { code: 'BB', name: 'Barbade', dialCode: '+1' },
  { code: 'BY', name: 'Biélorussie', dialCode: '+375' },
  { code: 'BE', name: 'Belgique', dialCode: '+32' },
  { code: 'BZ', name: 'Belize', dialCode: '+501' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229' },
  { code: 'BT', name: 'Bhoutan', dialCode: '+975' },
  { code: 'BO', name: 'Bolivie', dialCode: '+591' },
  { code: 'BA', name: 'Bosnie-Herzégovine', dialCode: '+387' },
  { code: 'BW', name: 'Botswana', dialCode: '+267' },
  { code: 'BR', name: 'Brésil', dialCode: '+55' },
  { code: 'BN', name: 'Brunéi Darussalam', dialCode: '+673' },
  { code: 'BG', name: 'Bulgarie', dialCode: '+359' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226' },
  { code: 'BI', name: 'Burundi', dialCode: '+257' },
  { code: 'KH', name: 'Cambodge', dialCode: '+855' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'CV', name: 'Cap-Vert', dialCode: '+238' },
  { code: 'CF', name: 'République Centrafricaine', dialCode: '+236' },
  { code: 'TD', name: 'Tchad', dialCode: '+235' },
  { code: 'CL', name: 'Chili', dialCode: '+56' },
  { code: 'CN', name: 'Chine', dialCode: '+86' },
  { code: 'CY', name: 'Chypre', dialCode: '+357' },
  { code: 'CO', name: 'Colombie', dialCode: '+57' },
  { code: 'KM', name: 'Comores', dialCode: '+269' },
  { code: 'CG', name: 'République du Congo', dialCode: '+242' },
  { code: 'CD', name: 'République Démocratique du Congo', dialCode: '+243' },
  { code: 'KR', name: 'Corée du Sud', dialCode: '+82' },
  { code: 'KP', name: 'Corée du Nord', dialCode: '+850' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225' },
  { code: 'HR', name: 'Croatie', dialCode: '+385' },
  { code: 'CU', name: 'Cuba', dialCode: '+53' },
  { code: 'CW', name: 'Curaçao', dialCode: '+599' },
  { code: 'DK', name: 'Danemark', dialCode: '+45' },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253' },
  { code: 'DO', name: 'République Dominicaine', dialCode: '+1' },
  { code: 'EG', name: 'Égypte', dialCode: '+20' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503' },
  { code: 'AE', name: 'Émirats Arabes Unis', dialCode: '+971' },
  { code: 'EC', name: 'Équateur', dialCode: '+593' },
  { code: 'ER', name: 'Érythrée', dialCode: '+291' },
  { code: 'ES', name: 'Espagne', dialCode: '+34' },
  { code: 'EE', name: 'Estonie', dialCode: '+372' },
  { code: 'SZ', name: 'Eswatini', dialCode: '+268' },
  { code: 'ET', name: 'Éthiopie', dialCode: '+251' },
  { code: 'FJ', name: 'Fidji', dialCode: '+679' },
  { code: 'FI', name: 'Finlande', dialCode: '+358' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'GA', name: 'Gabon', dialCode: '+241' },
  { code: 'GM', name: 'Gambie', dialCode: '+220' },
  { code: 'GE', name: 'Géorgie', dialCode: '+995' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'GR', name: 'Grèce', dialCode: '+30' },
  { code: 'GD', name: 'Grenade', dialCode: '+1' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502' },
  { code: 'GN', name: 'Guinée', dialCode: '+224' },
  { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245' },
  { code: 'GY', name: 'Guyana', dialCode: '+592' },
  { code: 'HT', name: 'Haïti', dialCode: '+509' },
  { code: 'HN', name: 'Honduras', dialCode: '+504' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { code: 'HU', name: 'Hongrie', dialCode: '+36' },
  { code: 'IN', name: 'Inde', dialCode: '+91' },
  { code: 'ID', name: 'Indonésie', dialCode: '+62' },
  { code: 'IR', name: 'Iran', dialCode: '+98' },
  { code: 'IQ', name: 'Irak', dialCode: '+964' },
  { code: 'IE', name: 'Irlande', dialCode: '+353' },
  { code: 'IS', name: 'Islande', dialCode: '+354' },
  { code: 'IL', name: 'Israël', dialCode: '+972' },
  { code: 'IT', name: 'Italie', dialCode: '+39' },
  { code: 'JM', name: 'Jamaïque', dialCode: '+1' },
  { code: 'JP', name: 'Japon', dialCode: '+81' },
  { code: 'JE', name: 'Jersey', dialCode: '+44' },
  { code: 'JO', name: 'Jordanie', dialCode: '+962' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'KG', name: 'Kirghizistan', dialCode: '+996' },
  { code: 'KI', name: 'Kiribati', dialCode: '+686' },
  { code: 'KW', name: 'Koweït', dialCode: '+965' },
  { code: 'LA', name: 'Laos', dialCode: '+856' },
  { code: 'LS', name: 'Lesotho', dialCode: '+266' },
  { code: 'LV', name: 'Lettonie', dialCode: '+371' },
  { code: 'LB', name: 'Liban', dialCode: '+961' },
  { code: 'LR', name: 'Libéria', dialCode: '+231' },
  { code: 'LY', name: 'Libye', dialCode: '+218' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { code: 'LT', name: 'Lituanie', dialCode: '+370' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { code: 'MO', name: 'Macao', dialCode: '+853' },
  { code: 'MK', name: 'Macédoine du Nord', dialCode: '+389' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261' },
  { code: 'MY', name: 'Malaisie', dialCode: '+60' },
  { code: 'MW', name: 'Malawi', dialCode: '+265' },
  { code: 'MV', name: 'Maldives', dialCode: '+960' },
  { code: 'ML', name: 'Mali', dialCode: '+223' },
  { code: 'MT', name: 'Malte', dialCode: '+356' },
  { code: 'MA', name: 'Maroc', dialCode: '+212' },
  { code: 'MQ', name: 'Martinique', dialCode: '+596' },
  { code: 'MU', name: 'Maurice', dialCode: '+230' },
  { code: 'MR', name: 'Mauritanie', dialCode: '+222' },
  { code: 'YT', name: 'Mayotte', dialCode: '+262' },
  { code: 'MX', name: 'Mexique', dialCode: '+52' },
  { code: 'MD', name: 'Moldavie', dialCode: '+373' },
  { code: 'MC', name: 'Monaco', dialCode: '+377' },
  { code: 'MN', name: 'Mongolie', dialCode: '+976' },
  { code: 'ME', name: 'Monténégro', dialCode: '+382' },
  { code: 'MS', name: 'Montserrat', dialCode: '+1' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95' },
  { code: 'NA', name: 'Namibie', dialCode: '+264' },
  { code: 'NR', name: 'Nauru', dialCode: '+674' },
  { code: 'NP', name: 'Népal', dialCode: '+977' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { code: 'NE', name: 'Niger', dialCode: '+227' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'NU', name: 'Niue', dialCode: '+683' },
  { code: 'NO', name: 'Norvège', dialCode: '+47' },
  { code: 'NZ', name: 'Nouvelle-Calédonie', dialCode: '+687' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dialCode: '+64' },
  { code: 'OM', name: 'Oman', dialCode: '+968' },
  { code: 'UG', name: 'Ouganda', dialCode: '+256' },
  { code: 'UZ', name: 'Ouzbékistan', dialCode: '+998' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92' },
  { code: 'PS', name: 'Palestine', dialCode: '+970' },
  { code: 'PA', name: 'Panama', dialCode: '+507' },
  { code: 'PG', name: 'Papouasie-Nouvelle-Guinée', dialCode: '+675' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595' },
  { code: 'NL', name: 'Pays-Bas', dialCode: '+31' },
  { code: 'PE', name: 'Pérou', dialCode: '+51' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
  { code: 'PL', name: 'Pologne', dialCode: '+48' },
  { code: 'PF', name: 'Polynésie Française', dialCode: '+689' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'QA', name: 'Qatar', dialCode: '+974' },
  { code: 'RE', name: 'Réunion', dialCode: '+262' },
  { code: 'RO', name: 'Roumanie', dialCode: '+40' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44' },
  { code: 'RU', name: 'Russie', dialCode: '+7' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'KN', name: 'Saint-Christophe-et-Niévès', dialCode: '+1' },
  { code: 'LC', name: 'Sainte-Lucie', dialCode: '+1' },
  { code: 'SM', name: 'Saint-Marin', dialCode: '+378' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines', dialCode: '+1' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232' },
  { code: 'SG', name: 'Singapour', dialCode: '+65' },
  { code: 'SK', name: 'Slovaquie', dialCode: '+421' },
  { code: 'SI', name: 'Slovénie', dialCode: '+386' },
  { code: 'SO', name: 'Somalie', dialCode: '+252' },
  { code: 'SD', name: 'Soudan', dialCode: '+249' },
  { code: 'SS', name: 'Soudan du Sud', dialCode: '+211' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { code: 'SE', name: 'Suède', dialCode: '+46' },
  { code: 'CH', name: 'Suisse', dialCode: '+41' },
  { code: 'SR', name: 'Suriname', dialCode: '+597' },
  { code: 'SY', name: 'Syrie', dialCode: '+963' },
  { code: 'TJ', name: 'Tadjikistan', dialCode: '+992' },
  { code: 'TW', name: 'Taïwan', dialCode: '+886' },
  { code: 'TZ', name: 'Tanzanie', dialCode: '+255' },
  { code: 'TD', name: 'Tchad', dialCode: '+235' },
  { code: 'CZ', name: 'Tchéquie', dialCode: '+420' },
  { code: 'TH', name: 'Thaïlande', dialCode: '+66' },
  { code: 'TL', name: 'Timor-Leste', dialCode: '+670' },
  { code: 'TG', name: 'Togo', dialCode: '+228' },
  { code: 'TO', name: 'Tonga', dialCode: '+676' },
  { code: 'TT', name: 'Trinité-et-Tobago', dialCode: '+1' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216' },
  { code: 'TM', name: 'Turkménistan', dialCode: '+993' },
  { code: 'TC', name: 'Îles Turques-et-Caïques', dialCode: '+1' },
  { code: 'TR', name: 'Turquie', dialCode: '+90' },
  { code: 'TV', name: 'Tuvalu', dialCode: '+688' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'VN', name: 'Viêt Nam', dialCode: '+84' },
  { code: 'WF', name: 'Wallis-et-Futuna', dialCode: '+681' },
  { code: 'YE', name: 'Yémen', dialCode: '+967' },
  { code: 'ZM', name: 'Zambie', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
  { code: 'GF', name: 'Guyane Française', dialCode: '+594' },
  { code: 'GP', name: 'Guadeloupe', dialCode: '+590' },
  { code: 'BL', name: 'Saint-Barthélemy', dialCode: '+590' },
  { code: 'MF', name: 'Saint-Martin', dialCode: '+590' },
  { code: 'PM', name: 'Saint-Pierre-et-Miquelon', dialCode: '+508' },
  { code: 'US', name: 'États-Unis', dialCode: '+1' },
];

// Composant pour afficher le drapeau via API
const Flag = ({ code }) => {
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  const flagEmoji = getFlagEmoji(code);
  
  return (
    <>
      <img 
        src={flagUrl} 
        alt={code}
        className="w-6 h-4 rounded-sm object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <span className="hidden text-lg">{flagEmoji}</span>
    </>
  );
};

// Fonction pour obtenir l'emoji du drapeau à partir du code pays
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const PhoneInput = ({ 
  value, 
  onChange, 
  label = 'Téléphone',
  required = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCountry = countries.find(c => 
    value?.startsWith(c.dialCode)
  ) || countries.find(c => c.code === 'FR');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country) => {
    // Garder le numéro existant et changer seulement l'indicatif
    const currentNumber = value?.replace(selectedCountry?.dialCode || '', '') || '';
    const fullPhone = country.dialCode + currentNumber;
    onChange(fullPhone);
    setIsOpen(false);
  };

  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;
    const cleaned = phoneValue.replace(/[^\d+]/g, '');
    
    // Si l'utilisateur tape déjà un indicatif (commence par +), l'utiliser directement
    if (cleaned.startsWith('+')) {
      onChange(cleaned);
    } else {
      // Sinon, ajouter l'indicatif du pays sélectionné
      const fullPhone = selectedCountry?.dialCode ? selectedCountry.dialCode + cleaned : cleaned;
      onChange(fullPhone);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex">
        {/* Sélecteur de pays */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-32 sm:w-40 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <Flag code={selectedCountry?.code} />
              <span className="text-sm font-medium">{selectedCountry?.dialCode}</span>
            </div>
            <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Recherche */}
              <div className="p-3 border-b bg-white sticky top-0 z-10">
                <input
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {/* Liste des pays */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code + country.dialCode}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-3 py-2.5 text-left hover:bg-gray-100 flex items-center gap-3 ${
                      selectedCountry?.code === country.code && selectedCountry?.dialCode === country.dialCode ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Flag code={country.code} />
                    <span className="text-sm font-medium flex-1 truncate">{country.name}</span>
                    <span className="text-sm text-gray-500">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Input du numéro */}
        <input
          type="tel"
          value={value?.replace(selectedCountry?.dialCode || '', '') || ''}
          onChange={handlePhoneChange}
          placeholder="6 12 34 56 78"
          className={`flex-1 px-4 py-2 border ${isOpen ? 'border-gray-300' : 'border-l-0'} border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
