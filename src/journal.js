import { VERSION } from './version.js';
import { addCustomPlace, setCustomPlaceActivity, setCustomPlaceNote, setTripSettingValue, state, filteredPrs, prImage, prStatus, prUserState } from './state.js';
import { renderPins, renderPois } from './map.js';
import { parseCoordinateInput } from './routingLive.js';

export function renderJournal(host, openPr, openCustomPlace = null) {
  host.innerHTML = `
    <section class="panel-list">
      <div class="journal-head">
        <div>
          <h1>Journal</h1>
          <p>${state.data.meta.counts.prs} PR-Wege - ${VERSION.label}</p>
        </div>
        <input id="search" class="search" type="search" placeholder="Suchen" value="${escapeHtml(state.filters.q)}" />
      </div>
      <div class="filter-row sort-row" id="sortModes">
        <button class="chip active" data-sort="plan">Plan</button>
        <button class="chip" data-sort="region">Region</button>
        <button class="chip" data-sort="number">Nummer</button>
      </div>
      <div class="filter-row" id="regions"></div>
      <div class="list" id="list"></div>
    </section>`;

  renderRegionFilters();
  drawList(openPr, openCustomPlace);
  document.querySelector('#search').addEventListener('input', event => {
    state.filters.q = event.target.value;
    drawList(openPr, openCustomPlace);
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
    drawList(window.PRX_OPEN_PR, window.PRX_OPEN_CUSTOM_PLACE);
    renderPins();
  }, { once: true });
}

function drawList(openPr, openCustomPlace = null) {
  window.PRX_OPEN_PR = openPr;
  window.PRX_OPEN_CUSTOM_PLACE = openCustomPlace;
  const list = document.querySelector('#list');
  const groups = groupPrs(filteredPrs());
  const customPlaces = filteredCustomPlaces();
  list.innerHTML = (groups.map(group => `
    <section class="journal-group">
      <h2>${group.title}</h2>
      ${group.items.map(renderRow).join('')}
    </section>`).join('') || '<div class="empty">Keine PRs im aktuellen Filter.</div>') +
    renderCustomPlaces(customPlaces);
  list.querySelectorAll('.pr-row[data-id]').forEach(row => row.addEventListener('click', () => openPr(row.dataset.id)));
  list.querySelectorAll('[data-custom-route]').forEach(button => {
    button.addEventListener('click', () => openCustomPlace?.(button.dataset.customRoute));
  });
  list.querySelectorAll('[data-custom-activity]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      setCustomPlaceActivity(button.dataset.customId, button.dataset.customActivity);
      drawList(openPr, openCustomPlace);
    });
  });
  list.querySelectorAll('[data-custom-note]').forEach(input => {
    input.addEventListener('change', () => setCustomPlaceNote(input.dataset.customNote, input.value));
    input.addEventListener('click', event => event.stopPropagation());
  });
  list.querySelector('[data-custom-title]')?.addEventListener('change', event => {
    setTripSettingValue('customPlacesTitle', event.target.value || 'Eigene Ziele');
    drawList(openPr, openCustomPlace);
  });
  list.querySelector('[data-custom-add]')?.addEventListener('click', () => {
    addCustomPlaceFromJournal(list, openPr, openCustomPlace);
  });
}

function groupPrs(prs) {
  const groups = [
    { key: 'booked', title: 'IFCN gebucht', items: [] },
    { key: 'planned', title: 'Geplant', items: [] },
    { key: 'favorite', title: 'Favoriten', items: [] },
    { key: 'normal', title: 'Alle PRs', items: [] },
    { key: 'ignored', title: 'Ignorieren', items: [] }
  ];
  const byKey = Object.fromEntries(groups.map(group => [group.key, group]));

  prs.forEach(pr => {
    const user = prUserState(pr.id);
    if (user.ignored) byKey.ignored.items.push(pr);
    else if (user.activity === 'booked') byKey.booked.items.push(pr);
    else if (user.activity === 'planned') byKey.planned.items.push(pr);
    else if (user.activity === 'favorite') byKey.favorite.items.push(pr);
    else byKey.normal.items.push(pr);
  });

  groups.forEach(group => group.items.sort(sortByNumber));
  return groups.filter(group => group.items.length);
}

function renderRow(pr) {
  const user = prUserState(pr.id);
  const statusValue = prStatus(pr);
  const status = statusEmoji(statusValue);
  const activity = activityEmoji(user);
  const image = prImage(pr);
  return `
    <button class="pr-row ${user.ignored ? 'ignored' : ''}" data-id="${pr.id}">
      ${journalThumbnail(pr, image)}
      <span class="pr-code journal-flag" style="--pin-bg:${difficultyStyle(pr.difficulty).bg};--pin-fg:${difficultyStyle(pr.difficulty).fg}">
        <span class="status-emoji">${status}</span>
        <span class="activity ${activity ? '' : 'empty'}">${activity}</span>
        ${escapeHtml(pr.displayId)}
      </span>
      <span class="pr-main">
        <strong>${escapeHtml(pr.name)}</strong>
        <em>${escapeHtml(pr.region)} - ${fmt(pr.distanceKm, ' km')} - ${escapeHtml(pr.duration || '-')} - ${fmt(pr.driveMin, ' min')}</em>
      </span>
      <span class="pr-status">${activity} ${escapeHtml(activityLabel(user) || statusLabel(statusValue))}</span>
    </button>`;
}

function filteredCustomPlaces() {
  const q = state.filters.q.trim().toLowerCase();
  return (state.customPlaces || [])
    .filter(place => !q || `${place.name} ${place.category} ${place.note}`.toLowerCase().includes(q))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'de'));
}

function renderCustomPlaces(customPlaces) {
  return `
    <section class="journal-group custom-journal-group">
      <label class="custom-title-field">
        <span>Liste</span>
        <input data-custom-title type="text" value="${escapeHtml(state.tripSettings.customPlacesTitle || 'Eigene Ziele')}" />
      </label>
      ${renderCustomAddForm()}
      ${customPlaces.map(renderCustomPlaceCard).join('')}
    </section>`;
}

function renderCustomAddForm() {
  return `
    <article class="custom-add-card">
      <div class="custom-add-grid">
        <label>
          <span>Google-Maps-Link oder Koordinaten</span>
          <input data-custom-new="sourceText" type="text" placeholder="https://www.google.com/maps/... oder 32.6484,-16.9072" />
        </label>
        <label>
          <span>Name</span>
          <input data-custom-new="name" type="text" placeholder="z.B. Restaurant, Hotel, Aussichtspunkt" />
        </label>
        <label>
          <span>Kategorie</span>
          <input data-custom-new="category" type="text" list="journalCustomCategories" placeholder="restaurant, strand, parkplatz..." />
        </label>
        <label>
          <span>Notiz</span>
          <input data-custom-new="note" type="text" placeholder="optional" />
        </label>
      </div>
      <datalist id="journalCustomCategories">
        ${customPlaceCategoryOptions()}
      </datalist>
      <button data-custom-add>Ziel hinzufuegen</button>
    </article>`;
}

function addCustomPlaceFromJournal(root, openPr, openCustomPlace) {
  const sourceInput = root.querySelector('[data-custom-new="sourceText"]');
  const sourceText = sourceInput?.value || '';
  const parsed = parseCoordinateInput(sourceText);
  if (!parsed) {
    sourceInput?.setCustomValidity('Keine Koordinaten im Link gefunden.');
    sourceInput?.reportValidity();
    sourceInput?.setCustomValidity('');
    return;
  }
  const name = root.querySelector('[data-custom-new="name"]')?.value || parsed.label;
  const category = root.querySelector('[data-custom-new="category"]')?.value || 'sonstiges';
  const note = root.querySelector('[data-custom-new="note"]')?.value || '';
  addCustomPlace({ ...parsed, name, category, note, sourceText });
  renderPois();
  drawList(openPr, openCustomPlace);
}

function customPlaceCategoryOptions() {
  const defaults = [
    'hotel',
    'restaurant',
    'cafe',
    'bar',
    'supermarkt',
    'parkplatz',
    'strand',
    'aussichtspunkt',
    'sehenswuerdigkeit',
    'tankstelle',
    'apotheke',
    'arzt',
    'bushaltestelle',
    'shopping',
    'sonstiges'
  ];
  const used = (state.customPlaces || [])
    .map(place => String(place.category || '').trim())
    .filter(Boolean);
  return [...new Set([...defaults, ...used])]
    .sort((a, b) => a.localeCompare(b, 'de'))
    .map(category => `<option value="${escapeHtml(category)}"></option>`)
    .join('');
}

function renderCustomPlaceCard(place) {
  return `
    <article class="custom-journal-card">
      <button class="pr-row custom-journal-row" data-custom-route="${escapeHtml(place.id)}">
        <span class="pr-thumb placeholder custom-thumb">
          <b>*</b>
        </span>
        <span class="pr-code journal-flag custom-flag">
          Ziel
        </span>
        <span class="pr-main">
          <strong>${escapeHtml(place.name)}</strong>
          <em>${escapeHtml(place.category || 'custom')} - ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}${customPlaceLabel(place) ? ' - ' + customPlaceLabel(place) : ''}</em>
        </span>
        <span class="pr-status">Route</span>
      </button>
      <div class="custom-place-actions">
        <button class="${place.activity === 'favorite' ? 'active' : ''}" data-custom-activity="favorite" data-custom-id="${escapeHtml(place.id)}">\u{1F499} Favorit</button>
        <button class="${place.activity === 'planned' ? 'active planned' : ''}" data-custom-activity="planned" data-custom-id="${escapeHtml(place.id)}">\u2665\uFE0F Geplant</button>
      </div>
      <label class="custom-note-field">
        <span>Notiz / Kommentar</span>
        <textarea data-custom-note="${escapeHtml(place.id)}" rows="2" placeholder="z.B. Tisch reservieren, Treffpunkt, Parkhinweis...">${escapeHtml(place.note || '')}</textarea>
      </label>
    </article>`;
}

function customPlaceLabel(place) {
  if (place.activity === 'planned') return 'geplant';
  if (place.activity === 'favorite') return 'Favorit';
  if (place.inTrip) return 'geplant';
  return '';
}

function renderCustomPlaceRow(place) {
  return `
    <button class="pr-row custom-journal-row" data-custom-place="${escapeHtml(place.id)}">
      <span class="pr-thumb placeholder custom-thumb">
        <b>✦</b>
      </span>
      <span class="pr-code journal-flag custom-flag">
        Ziel
      </span>
      <span class="pr-main">
        <strong>${escapeHtml(place.name)}</strong>
        <em>${escapeHtml(place.category || 'custom')} - ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}${place.inTrip ? ' - Reise' : ''}</em>
      </span>
      <span class="pr-status">${place.inTrip ? 'Reise' : 'Ziel'}</span>
    </button>`;
}

function journalThumbnail(pr, image) {
  if (image) {
    return `
      <span class="pr-thumb">
        <img src="${escapeHtml(image.thumbnail)}" alt="${escapeHtml(image.alt)}" loading="lazy" />
      </span>`;
  }
  return `
    <span class="pr-thumb placeholder" style="--thumb-hue:${thumbHue(pr)}">
      <b>${escapeHtml(pr.displayId.replace('PR ', ''))}</b>
    </span>`;
}

function sortByNumber(a, b) {
  return Number(a.number) - Number(b.number) || a.displayId.localeCompare(b.displayId, 'de');
}

function activityLabel(user) {
  if (user.activity === 'booked') return 'gebucht';
  if (user.activity === 'planned') return 'geplant';
  if (user.activity === 'favorite') return 'Favorit';
  if (user.ignored) return 'ignoriert';
  return '';
}

function activityEmoji(user) {
  if (user.activity === 'booked') return '\u2B50\uFE0F';
  if (user.activity === 'planned') return '\u2665\uFE0F';
  if (user.activity === 'favorite') return '\u{1F499}';
  return '';
}

function statusLabel(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('closed')) return 'geschlossen';
  if (s.includes('restricted')) return 'eingeschraenkt';
  if (s.includes('open')) return 'offen';
  return 'pruefen';
}

function statusEmoji(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('closed') || s.includes('geschlossen')) return '\u{1F534}';
  if (s.includes('restricted') || s.includes('eingeschraenkt')) return '\u{1F7E1}';
  if (s.includes('open')) return '\u{1F7E2}';
  return '\u{1F7E1}';
}

function difficultyStyle(value = '') {
  const s = String(value || '').toLowerCase();
  if (s.includes('schwer')) return { bg: '#ff453a', fg: '#ffffff' };
  if (s.includes('mittel')) return { bg: '#ffd166', fg: '#142426' };
  if (s.includes('leicht')) return { bg: '#35d49f', fg: '#082224' };
  return { bg: '#7dd8ff', fg: '#061b1d' };
}

function thumbHue(pr) {
  return (String(pr.displayId || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) * 17) % 360;
}

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(value).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
