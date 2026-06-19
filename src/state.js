const STORAGE_KEY = 'prx.v5.prStates';

export const state = {
  data: null,
  pois: [],
  view: 'journal',
  activeId: null,
  heatmapMode: false,
  prStates: {},
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
  }
};

export function loadUserState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.prStates = raw ? JSON.parse(raw) : {};
  } catch {
    state.prStates = {};
  }
}

export function prUserState(id) {
  return {
    activity: '',
    ignored: false,
    statusOverride: '',
    schedule: null,
    ...state.prStates[id]
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
