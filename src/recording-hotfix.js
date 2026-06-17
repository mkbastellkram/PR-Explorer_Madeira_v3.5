(() => {
'use strict';

const AUDIT_KEY = 'PRX_AUDIT_V2';

function patchAuditStore() {
  try {
    const state = JSON.parse(localStorage.getItem(AUDIT_KEY) || '{}');
    state.noteMode = false;
    state.locked = false;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Recording hotfix could not patch audit store', err);
  }
  document.documentElement.classList.remove('audit-note-mode');
}

function isPopupCloseControl(target) {
  const button = target.closest('button');
  if (!button || !button.closest('.audit-modal')) return false;
  const label = `${button.textContent || ''} ${button.getAttribute('aria-label') || ''}`.toLowerCase();
  return label.includes('abbrechen') || label.includes('schliessen') || label.includes('schließen');
}

document.addEventListener('click', event => {
  if (!isPopupCloseControl(event.target)) return;
  patchAuditStore();
  setTimeout(() => {
    if (!document.querySelector('.audit-modal')) location.reload();
  }, 80);
}, true);

window.addEventListener('pageshow', () => {
  const modal = document.querySelector('.audit-modal');
  if (!modal && document.documentElement.classList.contains('audit-note-mode')) patchAuditStore();
});
})();
