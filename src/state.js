const STORAGE_KEY = 'prx.v5.prStates';

export const state = {
  data: null,
  pois: [],
  view: 'journal',
  activeId: null,
  prStates: {},
  filters: {
    q: '',
    regions: new Set(),
    statuses: new Set()
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
    schedule: null,
    ...state.prStates[id]
  };
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
    if (state.filters.statuses.size && !state.filters.statuses.has(pr.status)) return false;
    return true;
  });
}

function saveUserState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prStates));
}
