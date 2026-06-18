import { VERSION } from './version.js';
import { state, filteredPrs } from './state.js';
import { renderPins } from './map.js';

export function renderJournal(host, openPr) {
  host.innerHTML = `
    <section class="panel-list">
      <div class="journal-head">
        <div>
          <h1>Journal</h1>
          <p>${state.data.meta.counts.prs} PR-Wege · ${VERSION.label}</p>
        </div>
        <input id="search" class="search" type="search" placeholder="Suchen" value="${escapeHtml(state.filters.q)}" />
      </div>
      <div class="filter-row" id="regions"></div>
      <div class="list" id="list"></div>
    </section>`;

  renderRegionFilters();
  drawList(openPr);
  document.querySelector('#search').addEventListener('input', event => {
    state.filters.q = event.target.value;
    drawList(openPr);
    renderPins();
  });
}

function renderRegionFilters() {
  const regions = [...new Set(state.data.prs.map(pr => pr.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));
  const host = document.querySelector('#regions');
  host.innerHTML = `<button class="chip ${state.filters.regions.size ? '' : 'active'}" data-region="">Alle</button>` +
    regions.map(region => `<button class="chip ${state.filters.regions.has(region) ? 'active' : ''}" data-region="${escapeHtml(region)}">${escapeHtml(region)}</button>`).join('');
  host.addEventListener('click', event => {
    const button = event.target.closest('[data-region]');
    if (!button) return;
    const region = button.dataset.region;
    if (!region) state.filters.regions.clear();
    else if (state.filters.regions.has(region)) state.filters.regions.delete(region);
    else state.filters.regions.add(region);
    renderRegionFilters();
    drawList(window.PRX_OPEN_PR);
    renderPins();
  }, { once: true });
}

function drawList(openPr) {
  window.PRX_OPEN_PR = openPr;
  const list = document.querySelector('#list');
  const rows = filteredPrs();
  list.innerHTML = rows.map(pr => `
    <button class="pr-row" data-id="${pr.id}">
      <span class="pr-code">${escapeHtml(pr.displayId)}</span>
      <span class="pr-main">
        <strong>${escapeHtml(pr.name)}</strong>
        <em>${escapeHtml(pr.region)} · ${fmt(pr.distanceKm, ' km')} · ${escapeHtml(pr.duration || '-')} · ${fmt(pr.driveMin, ' min')}</em>
      </span>
      <span class="pr-status">${escapeHtml(statusLabel(pr.status))}</span>
    </button>`).join('') || '<div class="empty">Keine PRs im aktuellen Filter.</div>';
  list.querySelectorAll('.pr-row').forEach(row => row.addEventListener('click', () => openPr(row.dataset.id)));
}

function statusLabel(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('closed')) return 'geschlossen';
  if (s.includes('restricted')) return 'eingeschränkt';
  if (s.includes('open')) return 'offen';
  return 'prüfen';
}

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(value).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
