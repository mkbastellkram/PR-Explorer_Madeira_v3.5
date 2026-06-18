import { state } from './state.js';

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
  host.hidden = false;
  document.querySelector('#app').classList.add('detail-active');
  host.innerHTML = `
    <section class="sheet peek" id="sheet">
      <header class="sheet-head">
        <div>
          <strong>${escapeHtml(pr.displayId)} · ${escapeHtml(pr.name)}</strong>
          <span>${escapeHtml(pr.region || '')}</span>
        </div>
        <button class="close" aria-label="Schließen">×</button>
      </header>
      <section class="summary">
        <div><span>Anfahrt</span><strong>${fmt(pr.driveMin, ' min')}</strong></div>
        <div><span>Länge</span><strong>${fmt(pr.distanceKm, ' km')}</strong></div>
        <div><span>Dauer</span><strong>${escapeHtml(pr.duration || '-')}</strong></div>
        <div><span>Region</span><strong>${escapeHtml(pr.region || '-')}</strong></div>
      </section>
      <div class="sheet-body">
        <p class="lead">${escapeHtml(pr.shortText || pr.detailText || 'Noch kein Kurztext vorhanden.')}</p>
        <div class="facts">
          <div><span>Status</span><strong>${escapeHtml(pr.status || 'Check')}</strong></div>
          <div><span>Level</span><strong>${escapeHtml(pr.difficulty || '-')}</strong></div>
          <div><span>Höhe</span><strong>${fmt(pr.elevationLow, '')}–${fmt(pr.elevationHigh, ' m')}</strong></div>
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
          GPX: ${pr.track ? 'vorhanden' : 'fehlt'} · KML: ${pr.route ? 'vorhanden' : 'fehlt'}
        </div>
      </div>
    </section>`;
  host.querySelector('.close').addEventListener('click', () => closeDetail());
  bindGestures(host.querySelector('#sheet'), openAdjacent);
}

function bindGestures(sheet, openAdjacent) {
  let sx = 0, sy = 0, dx = 0, dy = 0, axis = '', active = false, startHeight = 0;
  sheet.addEventListener('pointerdown', event => {
    if (event.target.closest('button, a')) return;
    active = true;
    axis = '';
    sx = event.clientX;
    sy = event.clientY;
    startHeight = sheet.getBoundingClientRect().height;
    sheet.setPointerCapture(event.pointerId);
  });
  sheet.addEventListener('pointermove', event => {
    if (!active) return;
    dx = event.clientX - sx;
    dy = event.clientY - sy;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (!axis) {
      if (ay > 12 && ay > ax * 1.15) axis = 'y';
      else if (ax > 18 && ax > ay * 1.15 && sheet.classList.contains('peek')) axis = 'x';
      else return;
      sheet.classList.add('dragging');
    }
    event.preventDefault();
    if (axis === 'y') {
      const min = Math.max(230, window.innerHeight * 0.29);
      const max = Math.min(window.innerHeight * 0.78, window.innerHeight - 72);
      sheet.style.height = `${Math.max(min, Math.min(max, startHeight - dy))}px`;
    }
    if (axis === 'x') sheet.style.setProperty('--drag-x', `${Math.max(-260, Math.min(260, dx))}px`);
  }, { passive: false });
  sheet.addEventListener('pointerup', () => {
    if (!active) return;
    active = false;
    sheet.classList.remove('dragging');
    if (axis === 'x' && Math.abs(dx) > 82) {
      openAdjacent(dx < 0 ? 1 : -1);
      return;
    }
    if (axis === 'y') setState(sheet, dy < -36 ? 'expanded' : 'peek');
    sheet.style.removeProperty('--drag-x');
  });
}

function setState(sheet, mode) {
  sheet.classList.toggle('expanded', mode === 'expanded');
  sheet.classList.toggle('peek', mode !== 'expanded');
  if (mode === 'expanded') sheet.style.height = `min(78dvh, calc(100dvh - env(safe-area-inset-top) - 72px))`;
  else sheet.style.removeProperty('height');
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
