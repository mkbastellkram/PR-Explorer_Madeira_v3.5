const STORAGE_KEY = 'prx.v5.prStates';
const SETTINGS_KEY = 'prx.v5.settings';
const POI_CATALOG_VERSION = 4;

export const state = {
  data: null,
  pois: [],
  images: {},
  osmPoiMeta: null,
  view: 'journal',
  activeId: null,
  heatmapMode: false,
  prStates: {},
  poiFilters: {
    categories: new Set(['viewpoint', 'trailhead', 'waterfall', 'tunnel', 'webcam'])
  },
  filters: {
    q: '',
    regions: new Set(),
    statuses: new Set(),
    ranges: {
      driveKm: null,
      driveMin: null,
      distanceKm: null,
      durationMin: null
    }
  },
  mapStyle: {
    activeLineWeight: 5,
    lineHaloWeight: 0.5,
    lineHaloColor: '#ffffff',
    gpxColor: '#ff453a',
    kmlColor: '#0a84ff'
  },
  tripSettings: {
    fuelLitersPer100Km: 7,
    fuelPricePerLiter: 1.8,
    driveTimeFactor: 1.2,
    startupMinutes: 10,
    parkingMinutes: 10,
    walkToStartMinutes: 5,
    fuelReserveFactor: 1.15,
    vacationStart: '',
    vacationEnd: '',
    accommodationName: '',
    accommodationLat: '',
    accommodationLon: ''
  }
};

export function loadUserState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.prStates = raw ? JSON.parse(raw) : {};
  } catch {
    state.prStates = {};
  }
  try {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    const settings = rawSettings ? JSON.parse(rawSettings) : {};
    state.tripSettings = { ...state.tripSettings, ...settings.tripSettings };
    state.mapStyle = { ...state.mapStyle, ...settings.mapStyle };
    state.poiFilters.categories = new Set(settings.poiCategories || [...state.poiFilters.categories]);
    if ((settings.poiCatalogVersion || 0) < POI_CATALOG_VERSION) {
      state.poiFilters.categories.add('waterfall');
      state.poiFilters.categories.add('tunnel');
      state.poiFilters.categories.add('webcam');
      state.poiFilters.categories.add('parking');
      state.poiFilters.categories.add('viewpoint');
      saveSettings();
    }
  } catch {
    // Keep defaults.
  }
}

export function setTripSetting(key, value) {
  state.tripSettings[key] = Number(value);
  saveSettings();
}

export function setTripSettingValue(key, value) {
  state.tripSettings[key] = String(value ?? '').slice(0, 240);
  saveSettings();
}

export function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    tripSettings: state.tripSettings,
    mapStyle: state.mapStyle,
    poiCategories: [...state.poiFilters.categories],
    poiCatalogVersion: POI_CATALOG_VERSION
  }));
}

export function togglePoiCategory(category) {
  if (state.poiFilters.categories.has(category)) state.poiFilters.categories.delete(category);
  else state.poiFilters.categories.add(category);
  saveSettings();
}

export function prUserState(id) {
  return {
    activity: '',
    ignored: false,
    statusOverride: '',
    schedule: null,
    note: '',
    selectedPoiIds: [],
    ...state.prStates[id]
  };
}

export function prImage(pr) {
  const direct = pr?.image || null;
  const catalog = state.images?.[pr?.id] || state.images?.[pr?.displayId] || null;
  const image = direct || catalog;
  if (!image?.thumbnail && !image?.src) return null;
  return {
    thumbnail: image.thumbnail || image.src,
    src: image.src || image.thumbnail,
    alt: image.alt || `${pr.displayId} ${pr.name}`,
    credit: image.credit || '',
    license: image.license || '',
    source: image.source || '',
    sourceUrl: image.sourceUrl || '',
    originalUrl: image.originalUrl || '',
    status: image.status || '',
    notes: image.notes || ''
  };
}

export function prStatus(pr) {
  return prUserState(pr.id).statusOverride || pr.status || '';
}

export function cyclePrStatus(id) {
  const pr = state.data?.prs.find(item => item.id === id);
  if (!pr) return '';
  const current = normalizeStatus(prStatus(pr));
  const next = current === 'Open' ? 'Restricted' : current === 'Restricted' ? 'Closed' : 'Open';
  state.prStates[id] = { ...prUserState(id), statusOverride: next };
  saveUserState();
  return next;
}

export function setPrActivity(id, activity, schedule = null) {
  const current = prUserState(id);
  if (current.activity === 'booked' && activity !== 'booked') return false;

  const nextActivity = current.activity === activity ? '' : activity;
  if ((nextActivity === 'planned' || nextActivity === 'booked') && !schedule) return false;

  state.prStates[id] = {
    ...current,
    activity: nextActivity,
    ignored: nextActivity === 'booked' ? false : current.ignored,
    schedule: nextActivity === 'planned' || nextActivity === 'booked' ? schedule : null
  };
  saveUserState();
  return true;
}

export function toggleIgnored(id) {
  const current = prUserState(id);
  if (current.activity === 'booked') return false;
  state.prStates[id] = { ...current, ignored: !current.ignored };
  saveUserState();
  return true;
}

export function setPrNote(id, note) {
  state.prStates[id] = { ...prUserState(id), note: String(note || '').slice(0, 1200) };
  saveUserState();
}

export function togglePrPoi(id, poiId) {
  const current = prUserState(id);
  const selected = new Set(current.selectedPoiIds || []);
  if (selected.has(poiId)) selected.delete(poiId);
  else selected.add(poiId);
  state.prStates[id] = { ...current, selectedPoiIds: [...selected] };
  saveUserState();
  return selected.has(poiId);
}

export function exportUserData() {
  return {
    kind: 'prx-trip-share',
    schema: 1,
    exportedAt: new Date().toISOString(),
    note: 'Enthaelt Reiseplanung, Termine, Notizen, POI-Auswahl und Einstellungen. Enthaelt keinen ORS-Key.',
    prStates: state.prStates,
    settings: {
      tripSettings: state.tripSettings,
      mapStyle: state.mapStyle,
      poiCategories: [...state.poiFilters.categories],
      poiCatalogVersion: POI_CATALOG_VERSION
    }
  };
}

export function importUserData(payload, { merge = true } = {}) {
  if (!payload || payload.kind !== 'prx-trip-share') throw new Error('Ungueltiges PRX-Datenpaket');
  const incomingStates = payload.prStates && typeof payload.prStates === 'object' ? payload.prStates : {};
  const result = merge ? mergePrStates(state.prStates, incomingStates) : {
    states: incomingStates,
    imported: Object.keys(incomingStates).length,
    conflicts: 0,
    skipped: 0
  };
  state.prStates = result.states;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prStates));

  const settings = payload.settings || {};
  state.tripSettings = mergeSettings(state.tripSettings, settings.tripSettings || {});
  state.mapStyle = { ...state.mapStyle, ...settings.mapStyle };
  if (Array.isArray(settings.poiCategories) && !state.poiFilters.categories.size) state.poiFilters.categories = new Set(settings.poiCategories);
  saveSettings();
  return result;
}

function mergePrStates(localStates, incomingStates) {
  const next = { ...localStates };
  const result = { states: next, imported: 0, conflicts: 0, skipped: 0 };
  Object.entries(incomingStates).forEach(([id, incoming]) => {
    const local = next[id];
    if (!local) {
      next[id] = incoming;
      result.imported += 1;
      return;
    }
    const merged = { ...local };
    Object.entries(incoming || {}).forEach(([key, value]) => {
      const localValue = local[key];
      if (isEmptyValue(localValue)) {
        merged[key] = value;
        result.imported += 1;
      } else if (isEmptyValue(value) || sameValue(localValue, value)) {
        result.skipped += 1;
      } else if (key === 'selectedPoiIds') {
        merged[key] = [...new Set([...(Array.isArray(localValue) ? localValue : []), ...(Array.isArray(value) ? value : [])])];
        result.imported += 1;
      } else {
        result.conflicts += 1;
      }
    });
    next[id] = merged;
  });
  return result;
}

function mergeSettings(local, incoming) {
  const next = { ...local };
  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (isEmptyValue(next[key]) && !isEmptyValue(value)) next[key] = value;
  });
  return next;
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}

function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export function normalizePr(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function selectedPr() {
  return state.data?.prs.find(pr => pr.id === state.activeId) || null;
}

export function filteredPrs() {
  const q = state.filters.q.trim().toLowerCase();
  return (state.data?.prs || []).filter(pr => {
    if (q && !`${pr.displayId} ${pr.name} ${pr.region}`.toLowerCase().includes(q)) return false;
    if (state.filters.regions.size && !state.filters.regions.has(pr.region)) return false;
    if (state.filters.statuses.size && !state.filters.statuses.has(prStatus(pr))) return false;
    if (!rangeAllows('driveKm', pr.driveKm)) return false;
    if (!rangeAllows('driveMin', pr.driveMin)) return false;
    if (!rangeAllows('distanceKm', pr.distanceKm)) return false;
    if (!rangeAllows('durationMin', durationToMinutes(pr.duration))) return false;
    return true;
  });
}

export function prsForRange(metricKey) {
  const q = state.filters.q.trim().toLowerCase();
  return (state.data?.prs || []).filter(pr => {
    if (q && !`${pr.displayId} ${pr.name} ${pr.region}`.toLowerCase().includes(q)) return false;
    if (state.filters.regions.size && !state.filters.regions.has(pr.region)) return false;
    if (state.filters.statuses.size && !state.filters.statuses.has(prStatus(pr))) return false;
    return Object.keys(state.filters.ranges).every(key => key === metricKey || rangeAllows(key, metricValue(pr, key)));
  });
}

export function metricValue(pr, key) {
  if (key === 'durationMin') return durationToMinutes(pr.duration);
  return Number(pr[key]);
}

export function durationToMinutes(value = '') {
  const raw = String(value || '').trim().replace(',', '.');
  const hourMinute = raw.match(/(\d+(?:\.\d+)?)\s*[:h]\s*(\d+)?/i);
  if (hourMinute) return Math.round(Number(hourMinute[1]) * 60 + Number(hourMinute[2] || 0));
  const decimal = raw.match(/(\d+(?:\.\d+)?)/);
  return decimal ? Math.round(Number(decimal[1]) * 60) : NaN;
}

export function setRangeFilter(key, min, max) {
  state.filters.ranges[key] = Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
}

export function resetRangeFilters() {
  Object.keys(state.filters.ranges).forEach(key => { state.filters.ranges[key] = null; });
}

function rangeAllows(key, value) {
  const range = state.filters.ranges[key];
  const number = Number(value);
  if (!range || !Number.isFinite(number)) return true;
  return number >= range.min && number <= range.max;
}

function saveUserState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prStates));
}

function normalizeStatus(value = '') {
  const s = String(value || '').toLowerCase();
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return 'Restricted';
  if (s.includes('closed') || s.includes('geschlossen')) return 'Closed';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return 'Open';
  return 'Closed';
}
