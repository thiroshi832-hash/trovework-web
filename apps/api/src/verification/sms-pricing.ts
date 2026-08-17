/**
 * seven.io outbound SMS price per message, in EUR, by ISO 3166-1 alpha-2.
 *
 * Transcribed from the seven.io price list. This is the *only* place a rate
 * lives: the blocklist below is derived from it, so re-pricing a country is a
 * one-number edit and cannot drift out of step with what we refuse to send.
 */
export const SMS_PRICE_EUR: Readonly<Record<string, number>> = {
  AD: 0.075,       // Andorra
  AE: 0.075,       // United Arab Emirates
  AF: 0.2808,      // Afghanistan
  AG: 0.13,        // Antigua and Barbuda
  AI: 0.13,        // Anguilla
  AL: 0.075,       // Albania
  AM: 0.18984,     // Armenia
  AO: 0.14568,     // Angola
  AR: 0.075,       // Argentine Republic
  AS: 0.109,       // American Samoa
  AT: 0.075,       // Austria
  AU: 0.075,       // Australia
  AW: 0.174,       // Aruba
  AZ: 0.294,       // Azerbaijan
  BA: 0.372,       // Bosnia and Herzegovina
  BB: 0.23484,     // Barbados
  BD: 0.315,       // Bangladesh
  BE: 0.075,       // Belgium
  BF: 0.14604,     // Burkina Faso
  BG: 0.1074,      // Bulgaria
  BH: 0.075,       // Bahrain
  BI: 0.28308,     // Burundi
  BJ: 0.168,       // Benin
  BM: 0.23508,     // Bermuda
  BN: 0.075,       // Brunei Darussalam
  BO: 0.1398,      // Bolivia
  BQ: 0.23196,     // Bonaire, Sint Eustatius and Saba
  BR: 0.028,       // Brazil
  BS: 0.075,       // Bahamas
  BT: 0.19,        // Bhutan
  BW: 0.075,       // Botswana
  BY: 0.148,       // Belarus
  BZ: 0.2148,      // Belize
  CA: 0.075,       // Canada
  CD: 0.2148,      // Democratic Republic of the Congo
  CF: 0.24,        // Central African Republic
  CG: 0.2202,      // Congo
  CH: 0.075,       // Switzerland
  CI: 0.288,       // Cote d'Ivoire
  CK: 0.075,       // Cook Islands
  CL: 0.113,       // Chile
  CM: 0.16296,     // Cameroon
  CN: 0.075,       // China
  CO: 0.075,       // Colombia
  CR: 0.075,       // Costa Rica
  CU: 0.075,       // Cuba
  CV: 0.14712,     // Cabo Verde
  CW: 0.23196,     // Curacao
  CY: 0.075,       // Cyprus
  CZ: 0.075,       // Czech Republic
  DE: 0.075,       // Germany
  DG: 0.075,       // Diego Garcia
  DJ: 0.10056,     // Djibouti
  DK: 0.075,       // Denmark
  DM: 0.13,        // Dominica
  DO: 0.1008,      // Dominican Republic
  DZ: 0.172,       // Algeria
  EC: 0.304,       // Ecuador
  EE: 0.075,       // Estonia
  EG: 0.2652,      // Egypt
  ER: 0.075,       // Eritrea
  ES: 0.075,       // Spain
  ET: 0.1908,      // Ethiopia
  FI: 0.075,       // Finland
  FJ: 0.125,       // Fiji
  FK: 0.075,       // Falkland Islands (Malvinas)
  FM: 0.075,       // Micronesia
  FO: 0.075,       // Faroe Islands
  FR: 0.075,       // France
  GA: 0.2202,      // Gabonese Republic
  GB: 0.075,       // United Kingdom
  GD: 0.23484,     // Grenada
  GE: 0.131,       // Georgia
  GF: 0.2388,      // French Guiana
  GH: 0.2514,      // Ghana
  GI: 0.075,       // Gibraltar
  GL: 0.075,       // Greenland
  GM: 0.125,       // Gambia
  GN: 0.22656,     // Guinea
  GP: 0.2388,      // Guadeloupe
  GQ: 0.1416,      // Equatorial Guinea
  GR: 0.075,       // Greece
  GT: 0.12,        // Guatemala
  GU: 0.075,       // Guam
  GW: 0.2268,      // Guinea-Bissau
  GY: 0.23532,     // Guyana
  HK: 0.075,       // Hong Kong, China
  HN: 0.075,       // Honduras
  HR: 0.075,       // Croatia
  HT: 0.2352,      // Haiti
  HU: 0.075,       // Hungary
  ID: 0.2952,      // Indonesia
  IE: 0.075,       // Ireland
  IL: 0.262,       // Israel
  IN: 0.075,       // India
  IQ: 0.2244,      // Iraq
  IR: 0.30636,     // Iran
  IS: 0.075,       // Iceland
  IT: 0.075,       // Italy
  JM: 0.2358,      // Jamaica
  JO: 0.30444,     // Jordan
  JP: 0.075,       // Japan
  KE: 0.167,       // Kenya
  KG: 0.172,       // Kyrgyz Republic
  KH: 0.2232,      // Cambodia
  KI: 0.109,       // Kiribati
  KM: 0.075,       // Comoros
  KN: 0.2352,      // Saint Kitts and Nevis
  KP: 0.075,       // Korea (Democratic People's Republic of)
  KR: 0.075,       // Korea (Republic of)
  KW: 0.24828,     // Kuwait
  KY: 0.13,        // Cayman Islands
  KZ: 0.177,       // Kazakhstan
  LA: 0.22056,     // Lao People's Democratic Republic
  LB: 0.2448,      // Lebanon
  LC: 0.23424,     // Saint Lucia
  LI: 0.075,       // Liechtenstein
  LK: 0.2448,      // Sri Lanka
  LR: 0.1716,      // Liberia
  LS: 0.125,       // Lesotho
  LT: 0.075,       // Lithuania
  LU: 0.075,       // Luxembourg
  LV: 0.075,       // Latvia
  LY: 0.2832,      // Libya
  MA: 0.115,       // Morocco
  MC: 0.075,       // Monaco
  MD: 0.1242,      // Moldova
  ME: 0.1056,      // Montenegro
  MG: 0.468,       // Madagascar
  MH: 0.075,       // Marshall Islands
  MK: 0.075,       // North Macedonia
  ML: 0.3012,      // Mali
  MM: 0.306,       // Myanmar
  MN: 0.1704,      // Mongolia
  MO: 0.075,       // Macao, China
  MP: 0.075,       // Northern Mariana Islands
  MQ: 0.2388,      // Martinique
  MR: 0.28788,     // Mauritania
  MS: 0.13,        // Montserrat
  MT: 0.075,       // Malta
  MU: 0.1248,      // Mauritius
  MV: 0.1932,      // Maldives
  MW: 0.21,        // Malawi
  MX: 0.075,       // Mexico
  MY: 0.2328,      // Malaysia
  MZ: 0.246,       // Mozambique
  NA: 0.075,       // Namibia
  NC: 0.115,       // New Caledonia
  NE: 0.2748,      // Niger
  NG: 0.306,       // Nigeria
  NI: 0.1212,      // Nicaragua
  NL: 0.075,       // Netherlands
  NO: 0.075,       // Norway
  NP: 0.162,       // Nepal
  NR: 0.125,       // Nauru
  NU: 0.075,       // Niue
  NZ: 0.075,       // New Zealand
  OM: 0.14124,     // Oman
  PA: 0.13,        // Panama
  PE: 0.23376,     // Peru
  PF: 0.1,         // French Polynesia
  PG: 0.1608,      // Papua New Guinea
  PH: 0.146,       // Philippines
  PK: 0.2952,      // Pakistan
  PL: 0.075,       // Poland
  PM: 0.075,       // Saint Pierre and Miquelon
  PR: 0.075,       // Puerto Rico
  PS: 0.075,       // Palestine
  PT: 0.075,       // Portugal
  PW: 0.075,       // Palau
  PY: 0.10404,     // Paraguay
  QA: 0.14832,     // Qatar
  RE: 0.146,       // Reunion
  RO: 0.075,       // Romania
  RS: 0.3474,      // Serbia
  RU: 0.39,        // Russian Federation
  RW: 0.2202,      // Rwanda
  SA: 0.2022,      // Saudi Arabia
  SB: 0.075,       // Solomon Islands
  SC: 0.2202,      // Seychelles
  SD: 0.2574,      // Sudan
  SE: 0.075,       // Sweden
  SG: 0.075,       // Singapore
  SH: 0.075,       // Saint Helena, Ascension and Tristan da Cunha
  SI: 0.13656,     // Slovenia
  SK: 0.075,       // Slovak Republic
  SL: 0.3312,      // Sierra Leone
  SM: 0.075,       // San Marino
  SN: 0.2352,      // Senegal
  SO: 0.18204,     // Somalia
  SR: 0.2328,      // Suriname
  SS: 0.1698,      // South Sudan
  ST: 0.075,       // Sao Tome and Principe
  SV: 0.23484,     // El Salvador
  SX: 0.23196,     // Sint Maarten
  SY: 0.3432,      // Syrian Arab Republic
  SZ: 0.168,       // Eswatini
  TC: 0.23424,     // Turks and Caicos Islands
  TD: 0.2202,      // Chad
  TG: 0.24,        // Togolese Republic
  TH: 0.075,       // Thailand
  TJ: 0.2814,      // Tajikistan
  TK: 0.075,       // Tokelau
  TL: 0.2508,      // Timor-Leste
  TM: 0.1908,      // Turkmenistan
  TN: 0.2676,      // Tunisia
  TO: 0.125,       // Tonga
  TR: 0.075,       // Turkey
  TT: 0.23568,     // Trinidad and Tobago
  TV: 0.075,       // Tuvalu
  TW: 0.075,       // Taiwan, China
  TZ: 0.294,       // Tanzania
  UA: 0.146,       // Ukraine
  UG: 0.207,       // Uganda
  US: 0.075,       // United States of America
  UY: 0.075,       // Uruguay
  UZ: 0.265,       // Uzbekistan
  VC: 0.2342,      // Saint Vincent and the Grenadines
  VE: 0.2364,      // Venezuela
  VG: 0.146,       // British Virgin Islands
  VI: 0.075,       // United States Virgin Islands
  VN: 0.125,       // Viet Nam
  VU: 0.125,       // Vanuatu
  WF: 0.075,       // Wallis and Futuna
  WS: 0.125,       // Samoa
  XK: 0.1656,      // Kosovo
  YE: 0.178,       // Yemen
  YT: 0.146,       // Mayotte
  ZA: 0.075,       // South Africa
  ZM: 0.2772,      // Zambia
  ZW: 0.147,       // Zimbabwe
};

/**
 * Countries at or above this price per SMS are refused outright.
 *
 * Verification SMS is a cost centre with no revenue attached to it, and the
 * expensive destinations are also where number-farm abuse concentrates: at
 * EUR 0.468 a message, Madagascar costs 6x Germany, so a script that pumps
 * codes at it burns real money for nothing.
 */
export const BLOCK_AT_OR_ABOVE_EUR = 0.1;

/**
 * Countries refused regardless of price, so a block for a reason that is not
 * cost does not have to be faked by editing a rate.
 *
 * IN — India is quoted at EUR 0.075, comfortably under the threshold, and is
 * blocked as a deliberate policy call rather than a pricing one.
 */
export const ALWAYS_BLOCKED: ReadonlySet<string> = new Set<string>(["IN"]);

/** Countries allowed regardless of price. Overrides both rules above. */
export const ALWAYS_ALLOWED: ReadonlySet<string> = new Set<string>([]);

/** Every country we will not send to, derived from the price table. */
export const BLOCKED_COUNTRIES: ReadonlySet<string> = new Set(
  Object.entries(SMS_PRICE_EUR)
    .filter(([iso, price]) => !ALWAYS_ALLOWED.has(iso) && price >= BLOCK_AT_OR_ABOVE_EUR)
    .map(([iso]) => iso)
    .concat([...ALWAYS_BLOCKED]),
);

/**
 * Whether we refuse to send to this country.
 *
 * An unrecognised or unparseable country fails *closed*. A number we cannot
 * price is a number we cannot budget for, and the list above already covers
 * every destination seven.io quotes — so anything outside it is either a
 * parsing failure or a destination we have no rate for, and neither is
 * something to spend money discovering in production.
 */
export function isCountryBlocked(country: string | undefined | null): boolean {
  if (!country) return true;
  const iso = country.toUpperCase();
  if (ALWAYS_ALLOWED.has(iso)) return false;
  if (!(iso in SMS_PRICE_EUR)) return true;
  return BLOCKED_COUNTRIES.has(iso);
}

/** The rate we would pay, for logging and for the admin cost view. */
export function priceFor(country: string | undefined | null): number | null {
  if (!country) return null;
  return SMS_PRICE_EUR[country.toUpperCase()] ?? null;
}
