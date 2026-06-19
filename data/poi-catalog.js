export const poiCategories = [
  { id: 'water', label: 'Wasser', icon: 'W', color: '#45d6ff', tags: ['amenity=drinking_water'] },
  { id: 'toilet', label: 'WC', icon: 'WC', color: '#9caab7', tags: ['amenity=toilets'] },
  { id: 'supplies', label: 'Versorgung', icon: 'S', color: '#ffd166', tags: ['shop=supermarket', 'shop=convenience'] },
  { id: 'health', label: 'Hilfe', icon: '+', color: '#ff5b6c', tags: ['amenity=pharmacy', 'amenity=doctors'] },
  { id: 'parking', label: 'Parken', icon: 'P', color: '#2da8ff', tags: ['amenity=parking'] },
  { id: 'bus', label: 'Bus', icon: 'B', color: '#8fd8ff', tags: ['highway=bus_stop'] },
  { id: 'viewpoint', label: 'Aussicht', icon: 'V', color: '#35d49f', tags: ['tourism=viewpoint'] },
  { id: 'shelter', label: 'Schutz', icon: 'H', color: '#c7b7ff', tags: ['amenity=shelter', 'emergency=*'] },
  { id: 'waterfall', label: 'Wasserfall', icon: '~', color: '#45d6ff', tags: ['waterway=waterfall'] },
  { id: 'tunnel', label: 'Tunnel', icon: 'T', color: '#c7b7ff', tags: ['tunnel=yes', 'route_feature=tunnel'] },
  { id: 'trailhead', label: 'Start', icon: '>', color: '#ff9f0a', tags: ['trailhead', 'tourism=information'] },
  { id: 'landscape', label: 'Natur', icon: '*', color: '#35d49f', tags: ['natural=*'] }
];

export const osmTagMap = {
  'amenity=drinking_water': 'water',
  'amenity=toilets': 'toilet',
  'shop=supermarket': 'supplies',
  'shop=convenience': 'supplies',
  'amenity=pharmacy': 'health',
  'amenity=doctors': 'health',
  'amenity=parking': 'parking',
  'highway=bus_stop': 'bus',
  'tourism=viewpoint': 'viewpoint',
  'amenity=shelter': 'shelter',
  'waterway=waterfall': 'waterfall',
  'tunnel=yes': 'tunnel',
  'route_feature=tunnel': 'tunnel'
};

export const categoryAliases = [
  { match: ['wasserfall', 'lagune', 'wasserquellen'], category: 'waterfall' },
  { match: ['tunnel'], category: 'tunnel' },
  { match: ['aussicht', 'miradouro', 'gipfel'], category: 'viewpoint' },
  { match: ['startpunkt', 'parkplatz'], category: 'trailhead' },
  { match: ['park/'], category: 'trailhead' },
  { match: ['ort', 'naturpunkt'], category: 'landscape' },
  { match: ['kueste', 'kuste', 'strand'], category: 'landscape' },
  { match: ['felsformation', 'fanal', 'wald', 'plateau'], category: 'landscape' }
];

export const osmImportProfile = {
  id: 'madeira-curated-pois',
  source: 'OSM/Overpass import profile, not runtime',
  bbox: { south: 32.60, west: -17.35, north: 33.15, east: -16.20 },
  attribution: '(c) OpenStreetMap contributors',
  updateStrategy: 'weekly full import plus osm_type/osm_id upsert',
  uniqueKey: ['osm_type', 'osm_id'],
  runtimeRule: 'Client reads normalized POI data only. No Overpass calls in app runtime.'
};
