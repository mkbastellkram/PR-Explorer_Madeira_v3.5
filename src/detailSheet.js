import { prUserState, setPrActivity, state, toggleIgnored } from './state.js';
import { renderPins } from './map.js';

let host;

export function closeDetail(clearActive = true) {
  host ||= document.querySelector('#detailHost');
  host.hidden = true;
  host.innerHTML = '';
  document.querySelector('#app').classList.remove('detail-active');
  if (clearActive) state.activeId = null;
}

export function openDetail(id, openAdjacent) {
  host ||= document.querySelector('#detailHost');
  const pr = state.data.prs.find(item => item.id === id);
  if (!pr) return;
  const user = prUserState(id);

  host.hidden = false;
  document.querySelector('#app').classList.add('detail-active');
  host.innerHTML = `
    <section class="sheet peek ${user.ignored ? 'ignored' : ''}" id="sheet">
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
        <span>${escapeHtml(pr.status || 'Status offen')}</span>
        <button class="${user.activity === 'favorite' ? 'active' : ''}" data-activity="favorite">Favorit</button>
        <button class="${user.activity === 'planned' ? 'active' : ''}" data-activity="planned">Geplant</button>
        <button class="${user.activity === 'booked' ? 'active' : ''}" data-activity="booked">IFCN</button>
      </section>
      <section class="state-actions" aria-label="PR Status">
        <button class="${user.ignored ? 'active' : ''}" data-action="ignore" ${user.activity === 'booked' ? 'disabled' : ''}>Ignorieren</button>
      </section>
      <div class="sheet-body">
        <p class="lead">${escapeHtml(pr.shortText || pr.detailText || 'Noch kein Kurztext vorhanden.')}</p>
        <div class="facts">
          <div><span>Status</span><strong>${escapeHtml(pr.status || 'Check')}</strong></div>
          <div><span>Level</span><strong>${escapeHtml(pr.difficulty || '-')}</strong></div>
          <div><span>Hoehe</span><strong>${fmt(pr.elevationLow, '')}-${fmt(pr.elevationHigh, ' m')}</strong></div>
          <div><span>Aufstieg</span><strong>${fmt(pr.elevationGain, ' hm')}</strong></div>
        </div>
        <p>${escapeHtml(pr.detailText || '')}</p>
        <div class="link-grid">
          ${link(pr.links.visitMadeira, 'Visit Madeira')}
          ${link(pr.links.startGoogleMaps, 'Start')}
          ${link(pr.links.driveGoogleMaps, 'Anfahrt')}
          ${link(pr.links.schmalePfade, 'Schmale Pfade')}
        </div>
        <div class="data-state">
          GPX: ${pr.track ? 'vorhanden' : 'fehlt'} - KML: ${pr.route ? 'vorhanden' : 'fehlt'}
        </div>
      </div>
    </section>`;

  host.querySelector('.close').addEventListener('click', () => closeDetail());
  host.querySelectorAll('[data-activity]').forEach(button => {
    button.addEventListener('click', event => {
      setPrActivity(id, event.currentTarget.dataset.activity);
      renderPins();
      openDetail(id, openAdjacent);
    });
  });
  host.querySelector('[data-action="ignore"]').addEventListener('click', () => {
    toggleIgnored(id);
    renderPins();
    openDetail(id, openAdjacent);
  });
  const sheet = host.querySelector('#sheet');
  bindGestures(sheet, openAdjacent);
  runSheetEntry(sheet);
}

function bindGestures(sheet, openAdjacent) {
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let dy = 0;
  let axis = '';
  let active = false;
  let startHeight = 0;
  let startTime = 0;

  sheet.addEventListener('pointerdown', event => {
    if (event.target.closest('.close, a')) return;
    if (sheet.classList.contains('expanded') && event.target.closest('.sheet-body')) return;
    active = true;
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
      if (ay > 16 && ay > ax * 1.24) axis = 'y';
      else if (ax > 24 && ax > ay * 1.2 && sheet.classList.contains('peek')) axis = 'x';
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
      window.setTimeout(() => openAdjacent(dx < 0 ? 1 : -1), duration);
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
  if (!dir) return;
  window.PRX_SHEET_ENTRY_DIR = 0;
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

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(value).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
