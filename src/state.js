export const state = {
  data: null,
  pois: [],
  view: 'journal',
  activeId: null,
  filters: {
    q: '',
    regions: new Set(),
    statuses: new Set()
  }
};

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
