import { categoryAliases, poiCategories } from '../data/poi-catalog.js';

const categoryById = new Map(poiCategories.map(category => [category.id, category]));

export function normalizePois(rawPois = []) {
  return rawPois
    .map((poi, index) => {
      const lat = Number(poi.lat ?? poi.latitude);
      const lon = Number(poi.lon ?? poi.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      const category = normalizeCategory(poi.category || poi.subcategory || poi.feature_tags || '');
      const definition = categoryById.get(category) || categoryById.get('landscape');
      return {
        id: poi.id || `poi-${index}`,
        osmType: poi.osm_type || poi.osmType || '',
        osmId: poi.osm_id || poi.osmId || '',
        category,
        subcategory: poi.subcategory || poi.category || '',
        name: poi.name || 'POI',
        lat,
        lon,
        relatedPr: parseRelatedPrs(poi.related_pr || poi.relatedPr || ''),
        shortText: poi.short_150 || poi.shortText || poi.detail_280 || '',
        detailText: poi.detail_280 || poi.detailText || '',
        googleMaps: poi.google_maps || poi.googleMaps || '',
        source: poi.source || poi.source_basis || 'PRX curated',
        sourceUpdatedAt: poi.source_updated_at || '',
        tags: poi.tags || {},
        icon: definition?.icon || '•',
        color: definition?.color || '#35d49f',
        label: definition?.label || category
      };
    })
    .filter(Boolean);
}

export function visiblePoiCategories(state) {
  return state.poiFilters.categories;
}

export function poiCategoryDefinitions() {
  return poiCategories;
}

function normalizeCategory(value = '') {
  const normalized = String(value).toLowerCase();
  const alias = categoryAliases.find(item => item.match.some(part => normalized.includes(part)));
  return alias?.category || 'landscape';
}

function parseRelatedPrs(value = '') {
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}
