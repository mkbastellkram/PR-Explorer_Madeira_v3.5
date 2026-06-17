(() => {
'use strict';

let prs = [];

fetch('data/prs.json', { cache: 'no-store' })
  .then(res => res.json())
  .then(data => { prs = Array.isArray(data.prs) ? data.prs : []; })
  .catch(err => console.warn('Detail gesture recovery data not loaded', err));

function setImportantHeight(sheet, value) {
  sheet.style.setProperty('height', value, 'important');
}

function setSheetState(sheet, state) {
  sheet.classList.toggle('detail-expanded', state === 'expanded');
  sheet.classList.toggle('detail-peek', state !== 'expanded');
  sheet.classList.remove('detail-dragging', 'detail-switching');
  sheet.style.removeProperty('--drag-x');
  if (state === 'expanded') {
    setImportantHeight(sheet, `min(76dvh, calc(100dvh - env(safe-area-inset-top) - 76px))`);
  } else {
    sheet.style.removeProperty('height');
  }
  window.dispatchEvent(new Event('resize'));
}

function currentPrIndex(sheet) {
  const title = sheet.querySelector('.detail-title')?.textContent || '';
  const normalized = title.toLowerCase();
  const idx = prs.findIndex(pr => {
    const code = String(pr.sourceNumber || pr.id || '').toLowerCase();
    const name = String(pr.name || '').toLowerCase();
    return normalized.includes(code) && (!name || normalized.includes(name));
  });
  return idx >= 0 ? idx : 0;
}

function openPrByIndex(index) {
  if (!prs.length) return;
  const pr = prs[(index + prs.length) % prs.length];
  const journal = document.querySelector('.nav-item[data-view="journal"]');
  if (journal) journal.click();

  setTimeout(() => {
    const code = String(pr.sourceNumber || pr.id || '').toLowerCase();
    const name = String(pr.name || '').toLowerCase();
    const row = [...document.querySelectorAll('.pr-row')].find(item => {
      const text = item.textContent.toLowerCase();
      return text.includes(code) && (!name || text.includes(name));
    });
    if (row) row.click();
  }, 80);
}

function bindSheet(sheet) {
  if (!sheet || sheet.dataset.prxGestureRecovery === '1') return;
  sheet.dataset.prxGestureRecovery = '1';
  sheet.style.touchAction = 'none';

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let axis = '';
  let active = false;
  let startHeight = 0;

  sheet.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    if (event.target.closest('button, a, input, textarea, select, .poi-inline-rail, .poi-card, .poi-row')) return;
    active = true;
    axis = '';
    dx = 0;
    dy = 0;
    startX = event.clientX;
    startY = event.clientY;
    startHeight = sheet.getBoundingClientRect().height;
    sheet.setPointerCapture(event.pointerId);
  });

  sheet.addEventListener('pointermove', event => {
    if (!active) return;
    dx = event.clientX - startX;
    dy = event.clientY - startY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (!axis) {
      if (ay > 12 && ay > ax * 1.15) axis = 'y';
      else if (ax > 18 && ax > ay * 1.15 && sheet.classList.contains('detail-peek')) axis = 'x';
      else return;
      sheet.classList.add('detail-dragging');
    }

    event.preventDefault();

    if (axis === 'y') {
      const minHeight = Math.max(220, window.innerHeight * .28);
      const maxHeight = Math.max(minHeight, Math.min(window.innerHeight * .76, window.innerHeight - 76));
      const nextHeight = Math.max(minHeight, Math.min(maxHeight, startHeight - dy));
      setImportantHeight(sheet, `${nextHeight}px`);
      return;
    }

    if (axis === 'x') {
      const max = Math.min(window.innerWidth * .62, 340);
      sheet.style.setProperty('--drag-x', `${Math.max(-max, Math.min(max, dx))}px`);
    }
  }, { passive: false });

  sheet.addEventListener('pointerup', () => {
    if (!active) return;
    active = false;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (axis === 'x' && ax > Math.max(72, sheet.getBoundingClientRect().width * .2) && ax > ay * 1.2) {
      sheet.classList.add('detail-switching');
      const dir = dx < 0 ? 1 : -1;
      openPrByIndex(currentPrIndex(sheet) + dir);
      return;
    }

    if (axis === 'y') {
      if (dy < -42) setSheetState(sheet, 'expanded');
      else if (dy > 42) setSheetState(sheet, 'peek');
      else setSheetState(sheet, sheet.classList.contains('detail-expanded') ? 'expanded' : 'peek');
      return;
    }

    sheet.classList.remove('detail-dragging', 'detail-switching');
    sheet.style.removeProperty('--drag-x');
  });

  sheet.addEventListener('pointercancel', () => {
    active = false;
    sheet.classList.remove('detail-dragging', 'detail-switching');
    sheet.style.removeProperty('--drag-x');
  });
}

function bindExistingSheets() {
  document.querySelectorAll('.detail-sheet').forEach(bindSheet);
}

new MutationObserver(bindExistingSheets).observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', bindExistingSheets);
bindExistingSheets();
})();
