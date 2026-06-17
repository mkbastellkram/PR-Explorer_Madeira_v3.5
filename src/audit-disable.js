(() => {
'use strict';

const AUDIT_KEY = 'PRX_AUDIT_V2';

function disableAuditState() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIT_KEY) || '{}');
    saved.enabled = false;
    saved.labels = false;
    saved.noteMode = false;
    saved.locked = false;
    localStorage.setItem(AUDIT_KEY, JSON.stringify(saved));
  } catch (err) {
    localStorage.removeItem(AUDIT_KEY);
  }

  document.documentElement.classList.remove('audit-on', 'audit-labels', 'audit-note-mode');
  document.body && document.body.classList.remove('audit-on', 'audit-labels', 'audit-note-mode');
}

disableAuditState();
window.addEventListener('pageshow', disableAuditState);
document.addEventListener('DOMContentLoaded', disableAuditState, { once: true });
})();
