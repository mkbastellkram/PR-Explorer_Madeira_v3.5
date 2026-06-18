import { VERSION } from './version.js';
import { loadUserState, state, filteredPrs, prUserState } from './state.js';
import { getBaseLayers, initMap, renderPins, setBaseLayer, showPrOnMap, fitAll } from './map.js';
import { renderJournal } from './journal.js';
import { openDetail, closeDetail } from './detailSheet.js';
import { openFilterSheet } from './filterSheet.js';

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

  $('#topbar').addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'fit') fitAll();
    if (action === 'journal') renderView('journal');
    if (action === 'share') toast('Teilen ist vorbereitet.');
    if (action === 'map-options') openFilterSheet(handleFiltersChanged);
    if (action === 'settings') renderView('dashboard');
  });
}

function renderNav() {
  $('#nav').innerHTML = `
    <button data-view="journal">Journal</button>
    <button data-view="map">Karte</button>
    <button data-view="trip">Reise</button>
    <button data-view="dashboard">Dashboard</button>`;

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
  if (state.view === 'map') {
    setTimeout(fitAll, 30);
  } else if (state.view === 'journal') {
    renderJournal($('#view'), openPr);
  }
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
