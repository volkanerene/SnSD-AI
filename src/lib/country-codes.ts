// Country calling codes with flags
export interface CountryCode {
  code: string; // e.g., "+90"
  country: string; // e.g., "Turkey"
  flag: string; // e.g., "🇹🇷"
  shortCode: string; // e.g., "TR"
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+90', country: 'Turkey', flag: '🇹🇷', shortCode: 'TR' },
  { code: '+1', country: 'United States', flag: '🇺🇸', shortCode: 'US' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', shortCode: 'GB' },
  { code: '+33', country: 'France', flag: '🇫🇷', shortCode: 'FR' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', shortCode: 'DE' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', shortCode: 'IT' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', shortCode: 'ES' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', shortCode: 'NL' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', shortCode: 'CH' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', shortCode: 'AT' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', shortCode: 'BE' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', shortCode: 'DK' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', shortCode: 'SE' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', shortCode: 'NO' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', shortCode: 'FI' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', shortCode: 'PL' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', shortCode: 'GR' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', shortCode: 'IS' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', shortCode: 'IE' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', shortCode: 'PL' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', shortCode: 'RO' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', shortCode: 'BG' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', shortCode: 'HR' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', shortCode: 'HU' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', shortCode: 'AM' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', shortCode: 'BY' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', shortCode: 'BE' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', shortCode: 'CY' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', shortCode: 'CZ' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', shortCode: 'EE' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', shortCode: 'LV' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', shortCode: 'LT' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪', shortCode: 'ME' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰', shortCode: 'MK' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', shortCode: 'SI' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', shortCode: 'SK' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', shortCode: 'RS' },
  {
    code: '+387',
    country: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    shortCode: 'BA'
  },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', shortCode: 'TN' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', shortCode: 'DZ' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', shortCode: 'MA' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', shortCode: 'EG' },
  {
    code: '+971',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    shortCode: 'AE'
  },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', shortCode: 'SA' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', shortCode: 'QA' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', shortCode: 'KW' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', shortCode: 'OM' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', shortCode: 'BH' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', shortCode: 'PK' },
  { code: '+91', country: 'India', flag: '🇮🇳', shortCode: 'IN' },
  { code: '+86', country: 'China', flag: '🇨🇳', shortCode: 'CN' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', shortCode: 'JP' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', shortCode: 'KR' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', shortCode: 'TH' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', shortCode: 'MY' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', shortCode: 'SG' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', shortCode: 'ID' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', shortCode: 'PH' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', shortCode: 'NZ' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', shortCode: 'AU' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', shortCode: 'BR' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', shortCode: 'CL' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', shortCode: 'CO' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', shortCode: 'AR' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', shortCode: 'PE' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', shortCode: 'MX' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', shortCode: 'CA' }
];

export const getCountryByCode = (code: string): CountryCode | undefined => {
  return COUNTRY_CODES.find((c) => c.code === code);
};

export const getCountryByShortCode = (
  shortCode: string
): CountryCode | undefined => {
  return COUNTRY_CODES.find((c) => c.shortCode === shortCode);
};

export const getDefaultCountry = (): CountryCode => {
  return COUNTRY_CODES.find((c) => c.shortCode === 'TR') || COUNTRY_CODES[0];
};
