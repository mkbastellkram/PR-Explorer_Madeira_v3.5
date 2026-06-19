import { VERSION } from './version.js';
import { loadUserState, state, filteredPrs, prUserState, durationToMinutes } from './state.js';
import { getBaseLayers, initMap, renderPins, setBaseLayer, showPrOnMap, fitAll, redrawActiveRoute, toggleHeatmapMode, renderHeatmap } from './map.js';
import { renderJournal } from './journal.js';
import { openDetail, closeDetail } from './detailSheet.js';
import { openFilterSheet } from './filterSheet.js';
import { openInfoCenter } from './infoCenter.js';

const $ = selector => document.querySelector(selector);

export function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 2200);
}

export async function loadData() {
  const [prs, pois] = await Promise.all([
    fetch('data/prs.json', { cache: 'no-store' }).then(res => res.json()),
    fetch('data/pois.json', { cache: 'no-store' }).then(res => res.json()).catch(() => ({ pois: [] }))
  ]);
  state.data = prs;
  state.pois = pois.pois || [];
}

function renderTopbar() {
  $('#topbar').innerHTML = `
    <div class="brand"><span></span><strong>PR-Explorer</strong></div>
    <div class="top-actions">
      <button class="icon-btn" data-action="share" aria-label="Teilen">↑</button>
      <button class="icon-btn" data-action="map-options" aria-label="Filter">☷</button>
      <button class="icon-btn" data-action="settings" aria-label="Einstellungen">⚙</button>
    </div>`;

  $('#topbar').innerHTML = `
    <div class="tool-cluster">
      <button class="icon-btn" data-action="fit" aria-label="Karte einpassen">${icon('zoom')}</button>
      <button class="icon-btn" data-action="journal" aria-label="Journal">${icon('grid')}</button>
      <button class="icon-btn" data-action="heatmap" aria-label="Heatmap">${icon('flame')}</button>
      <button class="icon-btn" data-action="info" aria-label="Info">${icon('info')}</button>
    </div>
    <div class="tool-cluster">
      <button class="icon-btn" data-action="settings" aria-label="Einstellungen">${icon('gear')}</button>
      <button class="icon-btn" data-action="share" aria-label="Teilen">${icon('share')}</button>
    </div>`;

  $('#topbar').addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'fit') fitAll();
    if (action === 'journal') renderView('journal');
    if (action === 'share') toast('Teilen ist vorbereitet.');
    if (action === 'heatmap') {
      toggleHeatmapMode().then(active => {
        $('#topbar [data-action="heatmap"]')?.classList.toggle('active', active);
        toast(active ? 'Heatmap: KML-Ueberlagerung aktiv.' : 'Heatmap aus.');
      });
    }
    if (action === 'settings') renderView('dashboard');
    if (action === 'info') openInfoCenter(openPr);
  });
}

function renderNav() {
  $('#nav').innerHTML = `
    ${navButton('overview', 'Uebersicht', icon('home'))}
    ${navButton('journal', 'Journal', icon('journal'))}
    ${navButton('map', 'Karte', icon('map'))}
    ${navButton('trip', 'Reisen', icon('travel'))}
    ${navButton('options', 'Optionen', icon('sliders'))}`;

  $('#nav').addEventListener('click', event => {
    const view = event.target.closest('[data-view]')?.dataset.view;
    if (view) renderView(view);
  });
}

function renderMapControls() {
  const controls = document.createElement('div');
  controls.id = 'mapControls';
  controls.className = 'map-controls';
  controls.innerHTML = getBaseLayers()
    .map(layer => `<button class="${layer.active ? 'active' : ''}" data-layer="${layer.key}">${layer.label}</button>`)
    .join('');

  controls.addEventListener('click', event => {
    const key = event.target.closest('[data-layer]')?.dataset.layer;
    if (!key) return;
    setBaseLayer(key);
    controls.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.layer === key));
  });

  $('#app').append(controls);
}

export function renderView(view) {
  if (view === 'options') {
    openFilterSheet(handleFiltersChanged);
    return;
  }
  state.view = view;
  closeDetail(false);
  $('#app').classList.remove('journal-leaving');
  $('#app').classList.toggle('list-mode', view !== 'map');
  $('#app').classList.toggle('map-mode', view === 'map');
  document.querySelectorAll('#nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));

  if (view === 'journal') renderJournal($('#view'), openPr);
  if (view === 'map') {
    $('#view').innerHTML = '';
    setTimeout(fitAll, 60);
  }
  if (view === 'dashboard') renderDashboard();
  if (view === 'overview') renderDashboard();
  if (view === 'options') openFilterSheet(handleFiltersChanged);
  if (view === 'trip') renderTrip();
}

export function openPr(id) {
  const wasList = $('#app').classList.contains('list-mode');
  state.activeId = id;
  state.view = 'map';

  $('#app').classList.remove('list-mode');
  $('#app').classList.add('map-mode');
  document.querySelectorAll('#nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === 'map'));

  if (wasList) {
    $('#app').classList.add('journal-leaving');
    setTimeout(() => {
      $('#view').innerHTML = '';
      $('#app').classList.remove('journal-leaving');
    }, 210);
  } else {
    $('#view').innerHTML = '';
  }

  openDetail(id, openAdjacentPr);
  setTimeout(() => showPrOnMap(id), 40);
}

function openAdjacentPr(delta) {
  const prs = filteredPrs();
  const idx = Math.max(0, prs.findIndex(pr => pr.id === state.activeId));
  const next = prs[(idx + delta + prs.length) % prs.length];
  if (next) openPr(next.id);
}

function renderDashboard() {
  const counts = state.data.meta.counts;
  $('#view').innerHTML = `
    <section class="panel-list">
      <h1>Dashboard</h1>
      <p>${VERSION.label}</p>
      <div class="metrics">
        <div><strong>${counts.prs}</strong><span>PRs</span></div>
        <div><strong>${counts.tracks}</strong><span>GPX</span></div>
        <div><strong>${counts.routes}</strong><span>KML</span></div>
        <div><strong>${counts.pois}</strong><span>POIs</span></div>
      </div>
    </section>`;
}

function navButton(view, label, iconSvg) {
  return `<button data-view="${view}">${iconSvg}<span>${label}</span></button>`;
}

function icon(name) {
  const icons = {
    home: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4.5 13.5 14 5l9.5 8.5"/><path d="M7.5 12.5v10h13v-10"/><path d="M11.5 22.5v-6h5v6"/></svg>',
    journal: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M8 4.5h10.5a3 3 0 0 1 3 3v16H9a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3Z"/><path d="M10.5 10h7"/><path d="M10.5 14h7"/><path d="M10.5 18h5"/></svg>',
    map: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="m4.5 7.5 6-2.5 7 3 6-2.5v15l-6 2.5-7-3-6 2.5Z"/><path d="M10.5 5v15"/><path d="M17.5 8v15"/></svg>',
    travel: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M17.5 20.5a8 8 0 1 1 1.7-13.8"/><path d="M19.5 7.5h4v4"/><path d="m23.5 7.5-6.2 6.2"/><circle cx="17.5" cy="17.5" r="4.5"/><path d="m21 21 3 3"/></svg>',
    sliders: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 8h18"/><path d="M5 14h18"/><path d="M5 20h18"/><circle cx="11" cy="8" r="2"/><circle cx="17" cy="14" r="2"/><circle cx="13" cy="20" r="2"/></svg>',
    zoom: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><path d="m17 17 6 6"/><path d="M9.5 12h5"/><path d="M12 9.5v5"/><path d="m5.5 5.5 4 4"/><path d="M5.5 9.5v-4h4"/></svg>',
    grid: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="6" y="6" width="16" height="16" rx="2"/><path d="M10 10h.1"/><path d="M14 10h.1"/><path d="M18 10h.1"/><path d="M10 14h.1"/><path d="M14 14h.1"/><path d="M18 14h.1"/><path d="M10 18h.1"/><path d="M14 18h.1"/><path d="M18 18h.1"/></svg>',
    flame: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 24c4.2 0 7-2.8 7-6.8 0-3-1.7-5.3-4.4-7.8.3 2.3-.7 3.7-2.1 4.6.1-3.7-1.8-6.3-4.7-8.5.4 4.5-3.8 6.4-3.8 11.4C6 21 9.4 24 14 24Z"/><path d="M14 24c1.9 0 3.2-1.3 3.2-3.1 0-1.5-.9-2.6-2.3-3.8.1 1.3-.5 2.1-1.4 2.6 0-1.9-.9-3.1-2.1-4.1.2 2.2-1.7 3.4-1.7 5.4 0 1.7 1.5 3 4.3 3Z"/></svg>',
    info: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10"/><path d="M14 12.5v6"/><path d="M14 8.5h.1"/></svg>',
    gear: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="3.5"/><path d="M14 3.5v3"/><path d="M14 21.5v3"/><path d="m6.6 6.6 2.1 2.1"/><path d="m19.3 19.3 2.1 2.1"/><path d="M3.5 14h3"/><path d="M21.5 14h3"/><path d="m6.6 21.4 2.1-2.1"/><path d="m19.3 8.7 2.1-2.1"/></svg>',
    share: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 18V4"/><path d="m9 9 5-5 5 5"/><path d="M7 13v9h14v-9"/></svg>'
  };
  return icons[name] || '';
}

function renderTrip() {
  const planned = (state.data?.prs || [])
    .map(pr => ({ pr, user: prUserState(pr.id) }))
    .filter(item => ['booked', 'planned', 'favorite'].includes(item.user.activity))
    .sort((a, b) => tripRank(a.user) - tripRank(b.user) || scheduleTime(a.user).localeCompare(scheduleTime(b.user)) || Number(a.pr.number) - Number(b.pr.number));
  const driveKm = planned.reduce((sum, item) => sum + (Number(item.pr.driveKm) || 0) * 2, 0);

  $('#view').innerHTML = `
    <section class="panel-list">
      <div class="journal-head">
        <div>
          <h1>Reise</h1>
          <p>${planned.length} gemerkte PRs - ${fmt(driveKm, ' km')} Hin/Rueck geschaetzt</p>
        </div>
      </div>
      <div class="list">
        ${planned.map(({ pr, user }) => `
          <button class="pr-row" data-trip-pr="${escapeHtml(pr.id)}">
            <span class="trip-mark">${activityEmoji(user.activity)}</span>
            <span class="pr-main">
              <strong>${escapeHtml(pr.displayId)} - ${escapeHtml(pr.name)}</strong>
              <em>${escapeHtml(scheduleLabel(user))} - ${fmt((Number(pr.driveKm) || 0) * 2, ' km')} Fahrt - ${fmt(pr.driveMin, ' min Google')}</em>
            </span>
            <span class="pr-status">${escapeHtml(user.activity)}</span>
          </button>`).join('') || '<div class="empty">Noch keine Favoriten, geplanten oder gebuchten PRs.</div>'}
      </div>
      <div class="metrics">
        <div><strong>${fmt(driveKm, '')}</strong><span>km Fahrt gesamt</span></div>
        <div><strong>${planned.filter(item => item.user.activity === 'booked').length}</strong><span>gebucht</span></div>
      </div>
    </section>`;

  $('#view').querySelectorAll('[data-trip-pr]').forEach(row => row.addEventListener('click', () => openPr(row.dataset.tripPr)));
}

function handleFiltersChanged() {
  renderPins();
  renderHeatmap();
  redrawActiveRoute();
  if (state.view === 'map') {
    setTimeout(fitAll, 30);
  } else if (state.view === 'journal') {
    renderJournal($('#view'), openPr);
  }
}

function openInfoPanel() {
  document.querySelector('#infoPanel')?.remove();
  const prs = filteredPrs();
  const stats = selectionStats(prs);
  const backdrop = document.createElement('div');
  backdrop.id = 'infoPanel';
  backdrop.className = 'info-backdrop';
  backdrop.innerHTML = `
    <section class="info-panel" role="dialog" aria-modal="true" aria-label="Karten-Statistik">
      <header>
        <div>
          <strong>Karten-Info</strong>
          <span>${escapeHtml(VERSION.label)} - aktuelle Filterauswahl</span>
        </div>
        <button type="button" data-close>&times;</button>
      </header>
      <div class="info-body">
        <div class="info-kpis">
          ${infoKpi('PRs', stats.count, 'sichtbar')}
          ${infoKpi('Wander-km', fmt(stats.walkKm, ' km'), 'Summe')}
          ${infoKpi('Hoehenmeter', fmt(stats.elevationGain, ' hm'), 'Summe')}
          ${infoKpi('Wanderzeit', fmt(stats.walkHours, ' h'), 'Summe')}
          ${infoKpi('Fahr-km', fmt(stats.driveKmRound, ' km'), 'hin+rueck')}
          ${infoKpi('Fahrzeit', fmt(stats.driveHoursRound, ' h'), 'hin+rueck')}
          ${infoKpi('Kraftstoff', fmt(stats.fuelLiters, ' l'), '7,0 l/100')}
          ${infoKpi('Kosten', fmt(stats.fuelCost, ' EUR'), '1,80 EUR/l')}
        </div>
        <div class="bubble-card">
          <strong>PR-Profil</strong>
          ${bubbleChart(prs)}
          <p>X = Dauer, Y = Hoehenmeter, Kreisgroesse = Distanz, Farbe = Schwierigkeit</p>
        </div>
      </div>
    </section>`;
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop || event.target.closest('[data-close]')) backdrop.remove();
  });
  document.body.append(backdrop);
}

function infoKpi(label, value, note) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(note)}</em></div>`;
}

function selectionStats(prs) {
  const walkKm = prs.reduce((sum, pr) => sum + numberOr(pr.track?.distanceKm, pr.distanceKm), 0);
  const walkMinutes = prs.reduce((sum, pr) => sum + (durationToMinutes(pr.duration) || 0), 0);
  const elevationGain = prs.reduce((sum, pr) => sum + (Number(pr.elevationGain) || 0), 0);
  const driveKmRound = prs.reduce((sum, pr) => sum + (Number(pr.driveKm) || 0) * 2, 0);
  const driveHoursRound = prs.reduce((sum, pr) => sum + (Number(pr.driveMin) || 0) * 2 / 60, 0);
  const fuelLiters = driveKmRound * 0.07;
  return {
    count: prs.length,
    walkKm,
    walkHours: walkMinutes / 60,
    elevationGain,
    driveKmRound,
    driveHoursRound,
    fuelLiters,
    fuelCost: fuelLiters * 1.8
  };
}

function bubbleChart(prs) {
  const rows = prs.map(pr => ({
    id: pr.displayId,
    hours: (durationToMinutes(pr.duration) || 0) / 60,
    elevation: Number(pr.elevationGain) || 0,
    distance: numberOr(pr.track?.distanceKm, pr.distanceKm),
    difficulty: pr.difficulty
  })).filter(row => row.hours > 0 || row.elevation > 0 || row.distance > 0);

  if (!rows.length) return '<div class="empty">Keine Diagrammdaten in der aktuellen Auswahl.</div>';

  const width = 640;
  const height = 420;
  const pad = { left: 54, top: 24, right: 22, bottom: 52 };
  const maxHours = Math.max(1, ...rows.map(row => row.hours));
  const maxElevation = Math.max(100, ...rows.map(row => row.elevation));
  const maxDistance = Math.max(1, ...rows.map(row => row.distance));
  const x = value => pad.left + (value / maxHours) * (width - pad.left - pad.right);
  const y = value => height - pad.bottom - (value / maxElevation) * (height - pad.top - pad.bottom);
  const r = value => 5 + Math.sqrt(value / maxDistance) * 16;
  const gridY = [0, .25, .5, .75, 1].map(t => Math.round(maxElevation * t));
  const gridX = [0, .25, .5, .75, 1].map(t => Math.round(maxHours * t * 10) / 10);

  return `
    <svg class="bubble-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="PR Bubble Chart">
      <g class="chart-grid">
        ${gridY.map(value => `<line x1="${pad.left}" y1="${y(value)}" x2="${width - pad.right}" y2="${y(value)}"></line><text x="${pad.left - 10}" y="${y(value) + 4}" text-anchor="end">${value}</text>`).join('')}
        ${gridX.map(value => `<line x1="${x(value)}" y1="${pad.top}" x2="${x(value)}" y2="${height - pad.bottom}"></line><text x="${x(value)}" y="${height - 20}" text-anchor="middle">${String(value).replace('.', ',')}</text>`).join('')}
      </g>
      <line class="chart-axis" x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}"></line>
      <line class="chart-axis" x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}"></line>
      ${rows.map(row => `<g class="bubble-point"><circle cx="${x(row.hours)}" cy="${y(row.elevation)}" r="${r(row.distance)}" fill="${difficultyColor(row.difficulty)}"></circle><text x="${x(row.hours) + r(row.distance) + 3}" y="${y(row.elevation) - 3}">${escapeHtml(row.id)}</text></g>`).join('')}
      <text class="axis-label" x="${width / 2}" y="${height - 4}" text-anchor="middle">Dauer der Wanderung (h)</text>
      <text class="axis-label" transform="translate(16 ${height / 2}) rotate(-90)" text-anchor="middle">Hoehenmeter laut Tabelle</text>
    </svg>`;
}

function numberOr(primary, fallback) {
  const first = Number(primary);
  if (Number.isFinite(first)) return first;
  const second = Number(fallback);
  return Number.isFinite(second) ? second : 0;
}

function difficultyColor(value = '') {
  const s = String(value || '').toLowerCase();
  if (s.includes('schwer')) return '#ff5b6c';
  if (s.includes('mittel')) return '#ffd24d';
  if (s.includes('leicht')) return '#35d49f';
  return '#9caab7';
}

function tripRank(user) {
  if (user.activity === 'booked') return 1;
  if (user.activity === 'planned') return 2;
  if (user.activity === 'favorite') return 3;
  return 9;
}

function scheduleTime(user) {
  return user.schedule?.isoLocal || '9999-99-99T99:99';
}

function scheduleLabel(user) {
  if (!user.schedule) return user.activity === 'favorite' ? 'ohne Termin' : 'Termin offen';
  return `${user.schedule.date} ${user.schedule.hour}:${user.schedule.minute}`;
}

function activityEmoji(activity) {
  if (activity === 'favorite') return '\u{1F499}';
  if (activity === 'planned') return '\u2764\uFE0F';
  if (activity === 'booked') return '\u2B50\uFE0F';
  return '';
}

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(Math.round(Number(value) * 10) / 10).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

async function boot() {
  loadUserState();
  renderTopbar();
  renderNav();
  await loadData();
  initMap(openPr);
  renderMapControls();
  renderPins();
  renderView('map');
}

boot().catch(error => {
  console.error(error);
  toast('V5 konnte nicht starten.');
});
