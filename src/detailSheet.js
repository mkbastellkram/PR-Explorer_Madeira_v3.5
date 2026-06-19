import { cyclePrStatus, prStatus, prUserState, setPrActivity, state, toggleIgnored } from './state.js';
import { renderPins } from './map.js';
import { infoDigestsForPr, openInfoCenter } from './infoCenter.js';

let host;

export function closeDetail(clearActive = true) {
  host ||= document.querySelector('#detailHost');
  host.hidden = true;
  host.innerHTML = '';
  document.querySelector('#app').classList.remove('detail-active');
  if (clearActive) state.activeId = null;
}

export function openDetail(id, openAdjacent, openPrCallback = null, initialMode = 'peek') {
  host ||= document.querySelector('#detailHost');
  const pr = state.data.prs.find(item => item.id === id);
  if (!pr) return;
  const user = prUserState(id);
  const status = prStatus(pr);

  host.hidden = false;
  document.querySelector('#app').classList.add('detail-active');
  host.innerHTML = `
    <section class="sheet ${initialMode === 'expanded' ? 'expanded' : 'peek'} ${user.ignored ? 'ignored' : ''}" id="sheet">
      <header class="sheet-head">
        <div>
          <strong>${escapeHtml(pr.displayId)} - ${escapeHtml(pr.name)}</strong>
          <span>${escapeHtml(pr.region || '')}</span>
        </div>
        <button class="close" aria-label="Schliessen">x</button>
      </header>
      <section class="summary">
        <div><span>Anfahrt</span><strong>${fmt(pr.driveMin, ' min')}</strong></div>
        <div><span>Laenge</span><strong>${fmt(pr.distanceKm, ' km')}</strong></div>
        <div><span>Dauer</span><strong>${escapeHtml(pr.duration || '-')}</strong></div>
        <div><span>Region</span><strong>${escapeHtml(pr.region || '-')}</strong></div>
      </section>
      <section class="peek-meta" aria-label="Planungsstatus">
        <button class="status-cycle ${statusClass(status)}" data-action="cycle-status">${statusEmoji(status)} ${escapeHtml(statusLabel(status))}</button>
        <button class="${user.activity === 'favorite' ? 'active' : ''}" data-activity="favorite" ${user.activity === 'booked' ? 'disabled' : ''}>${'\u{1F499}'} Favorit</button>
        <button class="${user.activity === 'planned' ? 'active' : ''}" data-activity="planned" ${user.activity === 'booked' ? 'disabled' : ''}>${'\u2764\uFE0F'} Geplant</button>
        <button class="${user.activity === 'booked' ? 'active' : ''}" data-activity="booked">${'\u2B50\uFE0F'} IFCN</button>
      </section>
      <section class="state-actions" aria-label="PR Status">
        <button class="${user.ignored ? 'active' : ''}" data-action="ignore" ${user.activity === 'booked' ? 'disabled' : ''}>Ignorieren</button>
      </section>
      <div class="sheet-body">
        <p class="lead">${escapeHtml(pr.shortText || pr.detailText || 'Noch kein Kurztext vorhanden.')}</p>
        <div class="facts">
          <div><span>Status</span><strong>${statusEmoji(status)} ${escapeHtml(statusLabel(status))}</strong></div>
          <div><span>Level</span><strong>${escapeHtml(pr.difficulty || '-')}</strong></div>
          <div><span>Hoehe</span><strong>${fmt(pr.elevationLow, '')}-${fmt(pr.elevationHigh, ' m')}</strong></div>
          <div><span>Aufstieg</span><strong>${fmt(pr.elevationGain, ' hm')}</strong></div>
        </div>
        <div class="elevation-profile" data-elevation-profile>
          ${renderElevationFallback(pr)}
        </div>
        ${infoExtract(pr)}
        ${contextCards(pr)}
        <p>${escapeHtml(pr.detailText || '')}</p>
        <div class="link-grid">
          ${link(pr.links.visitMadeira, 'Visit Madeira')}
          ${link(pr.links.startGoogleMaps, 'Start')}
          ${link(pr.links.driveGoogleMaps, 'Anfahrt')}
          ${link(pr.links.schmalePfade, 'Schmale Pfade')}
        </div>
        <div class="external-searches" aria-label="Externe Suche">
          ${externalSearchLinks(pr)}
        </div>
        <div class="data-state">
          GPX: ${pr.track ? 'vorhanden' : 'fehlt'} - KML: ${pr.route ? 'vorhanden' : 'fehlt'}
        </div>
      </div>
    </section>`;

  host.querySelector('.close').addEventListener('click', () => closeDetail());
  host.querySelector('[data-action="cycle-status"]').addEventListener('click', () => {
    cyclePrStatus(id);
    renderPins();
    openDetail(id, openAdjacent, openPrCallback, sheetMode());
  });
  host.querySelectorAll('[data-activity]').forEach(button => {
    button.addEventListener('click', async event => {
      const activity = event.currentTarget.dataset.activity;
      if (activity === 'favorite') {
        setPrActivity(id, activity);
      } else if (user.activity === activity) {
        setPrActivity(id, activity);
      } else {
        const schedule = await openScheduleDialog(pr, activity, user.schedule);
        if (!schedule) return;
        setPrActivity(id, activity, schedule);
      }
      renderPins();
      openDetail(id, openAdjacent, openPrCallback, sheetMode());
    });
  });
  host.querySelector('[data-action="ignore"]').addEventListener('click', () => {
    toggleIgnored(id);
    renderPins();
    openDetail(id, openAdjacent, openPrCallback, sheetMode());
  });
  host.querySelectorAll('[data-info-digest]').forEach(button => {
    button.addEventListener('click', event => {
      const topicId = event.currentTarget.dataset.infoDigest;
      openInfoCenter(openPrCallback || (() => {}), topicId);
    });
  });
  const sheet = host.querySelector('#sheet');
  bindGestures(sheet, openAdjacent);
  runSheetEntry(sheet);
  renderElevationProfile(host.querySelector('[data-elevation-profile]'), pr);
}

function infoExtract(pr) {
  const digests = infoDigestsForPr(pr.displayId).slice(0, 5);
  if (!digests.length) return '';
  return `
    <section class="detail-info-extract" aria-label="Info Center Auszug">
      <div class="detail-info-head">
        <strong>Info</strong>
        <span>Warum dieser PR auffaellt</span>
      </div>
      <div class="detail-info-list">
        ${digests.map(item => `
          <button data-info-digest="${escapeHtml(item.topicId)}">
            <em>${escapeHtml(item.value)}</em>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </button>`).join('')}
      </div>
    </section>`;
}

async function renderElevationProfile(node, pr) {
  if (!node || !pr.track?.file) return;
  try {
    const data = await fetch(pr.track.file, { cache: 'force-cache' }).then(res => res.json());
    const points = (data.points || [])
      .map(point => ({ lat: Number(point[0]), lon: Number(point[1]), ele: Number(point[2]) }))
      .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon) && Number.isFinite(point.ele));
    if (points.length < 2) return;
    node.innerHTML = renderElevationChart(points, pr, Number(data.distanceKm) || Number(pr.distanceKm) || 0, 'GPX');
  } catch {
    // Keep table-value fallback.
  }
}

function renderElevationFallback(pr) {
  const low = Number(pr.elevationLow);
  const high = Number(pr.elevationHigh);
  if (!Number.isFinite(low) || !Number.isFinite(high)) {
    return `<div class="elevation-empty">Hoehenprofil noch ohne verwertbare Hoehendaten.</div>`;
  }
  const start = low + (high - low) * 0.18;
  const end = low + (high - low) * 0.55;
  return renderElevationChart([
    { lat: 0, lon: 0, ele: start },
    { lat: 0, lon: 0, ele: high },
    { lat: 0, lon: 0, ele: low },
    { lat: 0, lon: 0, ele: end }
  ], pr, Number(pr.distanceKm) || 0, 'Tabelle');
}

function renderElevationChart(points, pr, distanceKm, sourceLabel) {
  const width = 640;
  const height = 178;
  const pad = { left: 22, right: 18, top: 18, bottom: 32 };
  const distances = cumulativeDistances(points, distanceKm);
  const elevations = points.map(point => point.ele);
  const low = Math.min(...elevations);
  const high = Math.max(...elevations);
  const span = Math.max(1, high - low);
  const total = Math.max(0.1, distances[distances.length - 1] || distanceKm || points.length - 1);
  const x = value => pad.left + (value / total) * (width - pad.left - pad.right);
  const y = value => pad.top + (1 - ((value - low) / span)) * (height - pad.top - pad.bottom);
  const sampled = sampleProfile(points, distances, 96);
  const path = sampled.map((item, index) => `${index ? 'L' : 'M'}${x(item.distance).toFixed(1)} ${y(item.ele).toFixed(1)}`).join(' ');
  const area = `${path} L${x(total).toFixed(1)} ${height - pad.bottom} L${pad.left} ${height - pad.bottom} Z`;
  const start = elevations[0];
  const end = elevations[elevations.length - 1];

  return `
    <div class="elevation-head">
      <div><strong>Hoehenprofil</strong><span>${escapeHtml(sourceLabel)} - ${fmt(distanceKm, ' km')} - ${escapeHtml(pr.duration || '-')}</span></div>
      <em>${Math.round(low)}-${Math.round(high)} m</em>
    </div>
    <svg class="elevation-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hoehenprofil ${escapeHtml(pr.displayId)}">
      <defs>
        <linearGradient id="elevFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="rgba(53,212,159,.42)" />
          <stop offset="1" stop-color="rgba(53,212,159,0)" />
        </linearGradient>
        <filter id="elevGlow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <line class="elevation-grid" x1="${pad.left}" y1="${y(low)}" x2="${width - pad.right}" y2="${y(low)}" />
      <line class="elevation-grid" x1="${pad.left}" y1="${y(high)}" x2="${width - pad.right}" y2="${y(high)}" />
      <path class="elevation-area" d="${area}" />
      <path class="elevation-line" d="${path}" filter="url(#elevGlow)" />
      <text x="${pad.left}" y="${height - 10}">0 km / ${Math.round(start)} m</text>
      <text x="${width - pad.right}" y="${height - 10}" text-anchor="end">${fmt(total, ' km')} / ${Math.round(end)} m</text>
      <text x="${width - pad.right}" y="${y(high) - 5}" text-anchor="end">${Math.round(high)} m</text>
      <text x="${width - pad.right}" y="${y(low) + 14}" text-anchor="end">${Math.round(low)} m</text>
    </svg>`;
}

function cumulativeDistances(points, declaredDistanceKm) {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances.push(distances[index - 1] + haversineKm(points[index - 1], points[index]));
  }
  const actualTotal = distances[distances.length - 1];
  if (declaredDistanceKm > 0 && actualTotal > 0) {
    const factor = declaredDistanceKm / actualTotal;
    return distances.map(distance => distance * factor);
  }
  return distances;
}

function sampleProfile(points, distances, maxPoints) {
  if (points.length <= maxPoints) return points.map((point, index) => ({ ele: point.ele, distance: distances[index] }));
  return Array.from({ length: maxPoints }, (_, index) => {
    const pointIndex = Math.round((index / (maxPoints - 1)) * (points.length - 1));
    return { ele: points[pointIndex].ele, distance: distances[pointIndex] };
  });
}

function haversineKm(a, b) {
  if (a.lat === 0 && a.lon === 0 && b.lat === 0 && b.lon === 0) return 1;
  const radius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function contextCards(pr) {
  const related = (state.pois || []).filter(poi => poi.relatedPr?.some(id => samePr(id, pr.displayId)));
  if (!related.length) return '';
  const ordered = related
    .sort((a, b) => contextRank(a) - contextRank(b))
    .slice(0, 8);
  return `
    <section class="context-strip" aria-label="PR Kontext">
      <div class="context-strip-head"><strong>Kontext</strong><span>Webcams und POIs zum PR</span></div>
      <div class="context-cards">
        ${ordered.map(poi => contextCard(poi)).join('')}
      </div>
    </section>`;
}

function contextCard(poi) {
  const href = poi.sourceUrl || poi.googleMaps || `https://www.google.com/search?q=${encodeURIComponent(`${poi.name} Madeira`)}`;
  return `
    <a class="context-card ${poi.category}" href="${escapeHtml(href)}" target="_blank" rel="noopener">
      <i style="--poi-color:${escapeHtml(poi.color)}">${escapeHtml(poi.icon)}</i>
      <strong>${escapeHtml(poi.name)}</strong>
      <span>${escapeHtml(poi.label)} - ${escapeHtml(poi.shortText || poi.subcategory || '')}</span>
    </a>`;
}

function contextRank(poi) {
  if (poi.category === 'webcam') return 0;
  if (poi.category === 'trailhead') return 1;
  if (poi.category === 'waterfall') return 2;
  if (poi.category === 'viewpoint') return 3;
  return 9;
}

function samePr(a, b) {
  return String(a || '').replace(/\s+/g, ' ').trim().toLowerCase() === String(b || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function openScheduleDialog(pr, activity, currentSchedule = null) {
  return new Promise(resolve => {
    const existing = document.querySelector('.modal-backdrop');
    if (existing) existing.remove();

    const now = new Date();
    const fallbackDate = now.toISOString().slice(0, 10);
    const fallbackHour = String(Math.max(6, Math.min(22, now.getHours()))).padStart(2, '0');
    const fallbackMinute = now.getMinutes() >= 30 ? '30' : '00';
    const date = currentSchedule?.date || fallbackDate;
    const hour = currentSchedule?.hour || fallbackHour;
    const minute = currentSchedule?.minute || fallbackMinute;
    const title = activity === 'booked' ? 'IFCN gebucht' : 'Geplant';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <section class="schedule-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header>
          <div>
            <strong>${activityEmoji(activity)} ${escapeHtml(title)}</strong>
            <span>${escapeHtml(pr.displayId)} - ${escapeHtml(pr.name)}</span>
          </div>
          <button data-close aria-label="Abbrechen">x</button>
        </header>
        <label class="schedule-field">
          <span>Datum</span>
          <input type="date" value="${escapeHtml(date)}" />
        </label>
        <div class="schedule-time">
          <label>
            <span>Stunde</span>
            <select data-hour>${hourOptions(hour)}</select>
          </label>
          <label>
            <span>Minute</span>
            <div class="minute-tabs">
              <button class="${minute === '00' ? 'active' : ''}" data-minute="00">00</button>
              <button class="${minute === '30' ? 'active' : ''}" data-minute="30">30</button>
            </div>
          </label>
        </div>
        <div class="schedule-info">
          ${escapeHtml(fmt(pr.distanceKm, ' km'))} - ${escapeHtml(pr.duration || '-')} - ${escapeHtml(fmt(pr.driveMin, ' min Anfahrt'))}
        </div>
        <footer>
          <button data-close>Abbrechen</button>
          <button class="primary" data-save>Uebernehmen</button>
        </footer>
      </section>`;

    document.querySelector('#app').append(backdrop);

    let selectedMinute = minute;
    backdrop.querySelectorAll('[data-minute]').forEach(button => {
      button.addEventListener('click', () => {
        selectedMinute = button.dataset.minute;
        backdrop.querySelectorAll('[data-minute]').forEach(item => item.classList.toggle('active', item === button));
      });
    });
    backdrop.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => {
      backdrop.remove();
      resolve(null);
    }));
    backdrop.querySelector('[data-save]').addEventListener('click', () => {
      const pickedDate = backdrop.querySelector('input[type="date"]').value;
      const pickedHour = backdrop.querySelector('[data-hour]').value;
      if (!pickedDate || !pickedHour || !selectedMinute) return;
      backdrop.remove();
      resolve({
        date: pickedDate,
        hour: pickedHour,
        minute: selectedMinute,
        isoLocal: `${pickedDate}T${pickedHour}:${selectedMinute}`,
        title: `${activityEmoji(activity)} ${pr.displayId} ${pr.name}`,
        href: `#pr=${encodeURIComponent(pr.id)}`
      });
    });
  });
}

function hourOptions(selected) {
  return Array.from({ length: 18 }, (_, index) => String(index + 5).padStart(2, '0'))
    .map(hour => `<option value="${hour}" ${hour === selected ? 'selected' : ''}>${hour}</option>`)
    .join('');
}

function activityEmoji(activity) {
  if (activity === 'favorite') return '\u{1F499}';
  if (activity === 'planned') return '\u2764\uFE0F';
  if (activity === 'booked') return '\u2B50\uFE0F';
  return '';
}

function statusEmoji(status = '') {
  const s = normalize(status);
  if (s.includes('closed') || s.includes('geschlossen')) return '\u{1F534}';
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return '\u{1F7E1}';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return '\u{1F7E2}';
  return '\u{1F7E1}';
}

function statusLabel(status = '') {
  const s = normalize(status);
  if (s.includes('closed') || s.includes('geschlossen')) return 'Closed';
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return 'Restricted';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return 'Open';
  return 'Check';
}

function statusClass(status = '') {
  const s = normalize(status);
  if (s.includes('closed') || s.includes('geschlossen')) return 'status-closed';
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return 'status-restricted';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return 'status-open';
  return '';
}

function normalize(value) {
  return String(value || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss');
}

function bindGestures(sheet, openAdjacent) {
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let dy = 0;
  let axis = '';
  let active = false;
  let bodyGesture = false;
  let startHeight = 0;
  let startTime = 0;

  sheet.addEventListener('pointerdown', event => {
    if (event.target.closest('.close, a')) return;
    active = true;
    bodyGesture = Boolean(sheet.classList.contains('expanded') && event.target.closest('.sheet-body'));
    axis = '';
    sx = event.clientX;
    sy = event.clientY;
    startTime = performance.now();
    startHeight = sheet.getBoundingClientRect().height;
    sheet.setPointerCapture(event.pointerId);
  });

  sheet.addEventListener('pointermove', event => {
    if (!active) return;
    dx = event.clientX - sx;
    dy = event.clientY - sy;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (!axis) {
      if (!bodyGesture && ay > 16 && ay > ax * 1.24) axis = 'y';
      else if (ax > 24 && ax > ay * 1.2) axis = 'x';
      else return;
      sheet.classList.add('dragging');
    }

    event.preventDefault();
    if (axis === 'y') {
      const min = Math.max(260, window.innerHeight * 0.32);
      const max = window.innerHeight - currentExpandedTop() - currentSheetBottom();
      sheet.style.height = `${Math.max(min, Math.min(max, startHeight - dy))}px`;
    }
    if (axis === 'x') sheet.style.setProperty('--drag-x', `${Math.max(-220, Math.min(220, dx))}px`);
  }, { passive: false });

  sheet.addEventListener('pointerup', () => {
    if (!active) return;
    active = false;
    sheet.classList.remove('dragging');

    if (axis === 'x' && Math.abs(dx) > 96) {
      const dir = dx < 0 ? -1 : 1;
      const elapsed = Math.max(1, performance.now() - startTime);
      const velocity = Math.max(0.18, Math.abs(dx) / elapsed);
      const distance = window.innerWidth + 120 - Math.abs(dx);
      const duration = Math.max(320, Math.min(720, distance / velocity));
      sheet.classList.add('carousel-exit');
      sheet.style.setProperty('--carousel-duration', `${Math.round(duration)}ms`);
      sheet.style.setProperty('--drag-x', `${dir * (window.innerWidth + 120)}px`);
      window.PRX_SHEET_ENTRY_DIR = -dir;
      window.PRX_SHEET_ENTRY_MODE = sheet.classList.contains('expanded') ? 'expanded' : 'peek';
      window.setTimeout(() => openAdjacent(dx < 0 ? 1 : -1, window.PRX_SHEET_ENTRY_MODE), duration);
      return;
    }
    if (axis === 'y') {
      const height = sheet.getBoundingClientRect().height;
      const midpoint = window.innerHeight * 0.56;
      setState(sheet, dy < -52 || height > midpoint ? 'expanded' : 'peek');
    }
    sheet.style.removeProperty('--drag-x');
  });
}

function setState(sheet, mode) {
  sheet.classList.toggle('expanded', mode === 'expanded');
  sheet.classList.toggle('peek', mode !== 'expanded');
  if (mode === 'expanded') sheet.style.height = `${window.innerHeight - currentExpandedTop() - currentSheetBottom()}px`;
  else sheet.style.removeProperty('height');
}

function runSheetEntry(sheet) {
  const dir = Number(window.PRX_SHEET_ENTRY_DIR || 0);
  const mode = window.PRX_SHEET_ENTRY_MODE || '';
  if (!dir) return;
  window.PRX_SHEET_ENTRY_DIR = 0;
  window.PRX_SHEET_ENTRY_MODE = '';
  if (mode === 'expanded') setState(sheet, 'expanded');
  sheet.classList.add('carousel-enter');
  sheet.style.setProperty('--carousel-duration', '420ms');
  sheet.style.setProperty('--drag-x', `${dir * (window.innerWidth + 120)}px`);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sheet.style.setProperty('--drag-x', '0px');
      window.setTimeout(() => {
        sheet.classList.remove('carousel-enter');
        sheet.style.removeProperty('--carousel-duration');
      }, 440);
    });
  });
}

function sheetMode() {
  return host?.querySelector('#sheet')?.classList.contains('expanded') ? 'expanded' : 'peek';
}

function currentExpandedTop() {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sheet-expanded-top')) || 0;
}

function currentSheetBottom() {
  const nav = document.querySelector('#nav')?.getBoundingClientRect();
  if (nav) return Math.max(66, window.innerHeight - nav.top + 8);
  return 66;
}

function link(href, label) {
  return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>` : '';
}

function externalSearchLinks(pr) {
  const query = `${pr.displayId} ${pr.name} Madeira Wanderung`;
  const encoded = encodeURIComponent(query);
  const mapsHref = pr.links.driveGoogleMaps || pr.links.startGoogleMaps ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pr.displayId} ${pr.name} Madeira`)}`;
  const items = [
    { label: 'Google', icon: 'google.svg', href: `https://www.google.com/search?q=${encoded}` },
    { label: 'Maps', icon: 'googlemaps.svg', href: mapsHref },
    { label: 'YouTube', icon: 'youtube.svg', href: `https://www.youtube.com/results?search_query=${encoded}` },
    { label: 'Instagram', icon: 'instagram.svg', href: `https://www.instagram.com/explore/search/keyword/?q=${encoded}` },
    { label: 'Komoot', icon: 'komoot.svg', href: `https://www.komoot.com/search?q=${encoded}` },
    { label: 'Strava', icon: 'strava.svg', href: `https://www.google.com/search?q=${encodeURIComponent(`site:strava.com/routes ${query}`)}` }
  ];

  return items.map(item => `
    <a class="external-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener" aria-label="${escapeHtml(item.label)} Suche">
      <img src="assets/platforms/${escapeHtml(item.icon)}" alt="" />
      <span>${escapeHtml(item.label)}</span>
    </a>`).join('');
}

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(value).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
