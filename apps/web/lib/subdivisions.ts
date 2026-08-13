/**
 * Country → state/province options for the register form.
 *
 * Countries absent from this map fall back to a free-text field, so a user is
 * never blocked from registering just because we haven't listed their region.
 */
export const COUNTRY_SUBDIVISIONS: Record<string, string[]> = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
  ],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon",
  ],
  Australia: [
    "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
    "South Australia", "Tasmania", "Victoria", "Western Australia",
  ],
  Ireland: [
    "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare",
    "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath",
    "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath",
    "Wexford", "Wicklow",
  ],
  "New Zealand": [
    "Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatū-Whanganui",
    "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman",
    "Waikato", "Wellington", "West Coast",
  ],
  Germany: [
    "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
    "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate",
    "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
  ],
  France: [
    "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
    "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
    "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur", "Guadeloupe", "Martinique",
    "French Guiana", "Réunion", "Mayotte",
  ],
  Spain: [
    "Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands",
    "Cantabria", "Castile and León", "Castilla-La Mancha", "Catalonia", "Extremadura",
    "Galicia", "La Rioja", "Madrid", "Murcia", "Navarre", "Valencian Community", "Ceuta",
    "Melilla",
  ],
  Italy: [
    "Abruzzo", "Aosta Valley", "Apulia", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
    "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont",
    "Sardinia", "Sicily", "Trentino-Alto Adige", "Tuscany", "Umbria", "Veneto",
  ],
  Netherlands: [
    "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg",
    "North Brabant", "North Holland", "Overijssel", "South Holland", "Utrecht", "Zeeland",
  ],
  Portugal: [
    "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro",
    "Guarda", "Leiria", "Lisbon", "Portalegre", "Porto", "Santarém", "Setúbal",
    "Viana do Castelo", "Vila Real", "Viseu", "Azores", "Madeira",
  ],
  Poland: [
    "Greater Poland", "Kuyavian-Pomeranian", "Lesser Poland", "Łódź", "Lower Silesian",
    "Lublin", "Lubusz", "Masovian", "Opole", "Podlaskie", "Pomeranian", "Silesian",
    "Subcarpathian", "Holy Cross", "Warmian-Masurian", "West Pomeranian",
  ],
  Sweden: [
    "Blekinge", "Dalarna", "Gävleborg", "Gotland", "Halland", "Jämtland", "Jönköping",
    "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland", "Skåne", "Södermanland",
    "Stockholm", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland",
    "Västra Götaland",
  ],
  Japan: [
    "Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu",
    "Gunma", "Hiroshima", "Hokkaido", "Hyōgo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa",
    "Kagoshima", "Kanagawa", "Kōchi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki",
    "Nagano", "Nagasaki", "Nara", "Niigata", "Ōita", "Okayama", "Okinawa", "Osaka", "Saga",
    "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori",
    "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yamanashi",
  ],
  "South Korea": [
    "Busan", "Chungcheongbuk-do", "Chungcheongnam-do", "Daegu", "Daejeon", "Gangwon",
    "Gwangju", "Gyeonggi-do", "Gyeongsangbuk-do", "Gyeongsangnam-do", "Incheon", "Jeju",
    "Jeollabuk-do", "Jeollanam-do", "Sejong", "Seoul", "Ulsan",
  ],
  Singapore: ["Central", "East", "North", "North-East", "West"],
  India: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
  ],
  Philippines: [
    "Ilocos Region", "Cagayan Valley", "Central Luzon", "CALABARZON", "MIMAROPA",
    "Bicol Region", "Western Visayas", "Central Visayas", "Eastern Visayas",
    "Zamboanga Peninsula", "Northern Mindanao", "Davao Region", "SOCCSKSARGEN", "Caraga",
    "Bangsamoro", "Cordillera Administrative Region", "National Capital Region",
  ],
  "United Arab Emirates": [
    "Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain",
  ],
  "Saudi Arabia": [
    "Al Bahah", "Al Jawf", "Al Madinah", "Al-Qassim", "Asir", "Eastern Province", "Ha'il",
    "Jazan", "Makkah", "Najran", "Northern Borders", "Riyadh", "Tabuk",
  ],
  Egypt: [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta",
    "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matrouh", "Minya",
    "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea",
    "Sharqia", "Sohag", "South Sinai", "Suez",
  ],
  Nigeria: [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory",
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
  ],
  Kenya: [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
    "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
    "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
    "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
    "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta",
    "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga",
    "Wajir", "West Pokot",
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
    "North West", "Northern Cape", "Western Cape",
  ],
  Brazil: [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
    "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro",
    "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina",
    "São Paulo", "Sergipe", "Tocantins",
  ],
  Mexico: [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo",
    "Jalisco", "Mexico City", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León",
    "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
    "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
  ],
  Argentina: [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Ciudad Autónoma de Buenos Aires",
    "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
    "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
    "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán",
  ],
  Colombia: [
    "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá",
    "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
    "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
    "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
    "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
  ],
  Chile: [
    "Antofagasta", "Araucanía", "Arica y Parinacota", "Atacama", "Aysén", "Biobío",
    "Coquimbo", "Los Lagos", "Los Ríos", "Magallanes", "Maule", "Ñuble", "O'Higgins",
    "Santiago Metropolitan", "Tarapacá", "Valparaíso",
  ],
};

export function subdivisionsFor(country: string): string[] {
  return COUNTRY_SUBDIVISIONS[country] ?? [];
}
