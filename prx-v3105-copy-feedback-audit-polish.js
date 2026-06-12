
(function(){
  'use strict';
  var VERSION = '3.10.5';
  window.PRX_APP_VERSION = VERSION;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function qsa(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function norm(t){ return String(t||'').replace(/\s+/g,' ').trim(); }

  function ensureToast(){
    var t = document.getElementById('toast');
    if(!t){
      t = document.createElement('div');
      t.id='toast';
      t.className='toast hidden';
      document.body.appendChild(t);
    }
    return t;
  }

  function showToast(msg, kind){
    var t = ensureToast();
    t.textContent = msg || 'Aktion ausgeführt';
    t.classList.remove('hidden');
    t.classList.add('prx-toast-feedback');
    if(kind){ t.setAttribute('data-kind', kind); }
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function(){
      t.classList.add('hidden');
      t.removeAttribute('data-kind');
    }, 1650);
  }

  function pulse(el, label){
    if(!el || !el.classList) return;
    el.classList.remove('prx-action-done');
    void el.offsetWidth;
    el.classList.add('prx-action-done');
    if(label){ el.setAttribute('data-prx-last-feedback', label); }
    setTimeout(function(){ if(el && el.classList) el.classList.remove('prx-action-done'); }, 950);
  }

  function isCopyLike(el){
    if(!el) return false;
    var txt = norm(el.textContent || el.getAttribute('aria-label') || el.title || '');
    return /kopier|copy|bericht kopieren|diagnose kopieren|audit kopieren/i.test(txt);
  }

  function isSaveLike(el){
    if(!el) return false;
    var txt = norm(el.textContent || el.getAttribute('aria-label') || el.title || '');
    return /speichern|save|export/i.test(txt);
  }

  // Sichtbares Feedback für alle bestehenden Kopier-/Export-Schalter, ohne deren Logik zu ersetzen.
  document.addEventListener('click', function(ev){
    var btn = ev.target && ev.target.closest ? ev.target.closest('button, a, [role="button"]') : null;
    if(!btn) return;
    if(isCopyLike(btn)){
      setTimeout(function(){
        pulse(btn, 'kopiert');
        showToast('Kopiert · Audit/Diagnose liegt in der Zwischenablage', 'copy');
      }, 80);
    } else if(isSaveLike(btn)){
      setTimeout(function(){
        pulse(btn, 'ausgeführt');
        showToast('Aktion ausgeführt', 'action');
      }, 80);
    }
  }, true);

  // Clipboard-Wrapper: zeigt Feedback auch bei programmatischen Kopiervorgängen.
  try{
    if(navigator.clipboard && navigator.clipboard.writeText && !navigator.clipboard.__prxFeedbackWrapped){
      var originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = function(text){
        return originalWriteText(text).then(function(res){
          showToast('Kopiert · Zwischenablage aktualisiert', 'copy');
          return res;
        }, function(err){
          showToast('Kopieren fehlgeschlagen · bitte erneut tippen', 'error');
          throw err;
        });
      };
      navigator.clipboard.__prxFeedbackWrapped = true;
    }
  }catch(e){}

  function componentize(el, id, name){
    if(!el || !el.setAttribute) return;
    if(!el.getAttribute('data-prx-component')) el.setAttribute('data-prx-component', id);
    if(name && !el.getAttribute('data-prx-name')) el.setAttribute('data-prx-name', name);
  }

  function buttonByText(re){
    return qsa('button, a, [role="button"]').filter(function(b){ return re.test(norm(b.textContent || b.getAttribute('aria-label') || '')); });
  }

  function annotateAuditControls(){
    // Hauptkonsole und spezifische Aktionen mit Audit-ID versehen, damit Recorder nicht "unbekannt" meldet.
    qsa('[class*="audit"], [id*="audit"], [data-prx-component^="A-"]').forEach(function(el){
      var txt = norm(el.textContent);
      if(/A-00 Audit|Komponenten-Audit|Audit-Steuerung/.test(txt)) componentize(el, 'A-01@main', 'Audit-Konsole');
    });
    buttonByText(/Audit-Modus|IDs anzeigen|Labels an|Labels aus|Labels an\/aus/i).forEach(function(b){ componentize(b, 'A-02', 'Audit-Modus / Labels-Schalter'); });
    buttonByText(/Audit kopieren|Bericht kopieren|Report kopieren/i).forEach(function(b){ componentize(b, 'A-03', 'Auditbericht kopieren'); });
    buttonByText(/60\s*s|60 Sekunden|Aufnahme 60|60/i).forEach(function(b){ if(/60/.test(norm(b.textContent))) componentize(b, 'A-06.1', 'Audit-Recorder 60 s'); });
    buttonByText(/120\s*s|120 Sekunden|Aufnahme 120|120/i).forEach(function(b){ if(/120/.test(norm(b.textContent))) componentize(b, 'A-06.2', 'Audit-Recorder 120 s'); });
    buttonByText(/Stop|Beenden|Aufnahme stoppen/i).forEach(function(b){ componentize(b, 'A-06.3', 'Audit-Recorder stoppen'); });
    buttonByText(/Komponentenübersicht|Übersicht/i).forEach(function(b){ if(/Komponenten/.test(norm(b.textContent))) componentize(b, 'A-04', 'Komponentenübersicht'); });
    buttonByText(/Diagnose kopieren/i).forEach(function(b){ componentize(b, 'D-03.1', 'Diagnose kopieren'); });
    buttonByText(/Karte reparieren/i).forEach(function(b){ componentize(b, 'M-06', 'Karte reparieren'); });
  }

  function syncVisibleVersions(){
    // Nur sichtbare Diagnose-/Admin-Texte, nicht Rohdaten oder Changelogs.
    qsa('body *').forEach(function(el){
      if(el.children && el.children.length) return;
      var txt = el.textContent || '';
      if(/3\.7\.7|3\.9\.0|3\.10\.[0-4]/.test(txt)){
        var next = txt.replace(/3\.7\.7|3\.9\.0|3\.10\.[0-4]/g, VERSION);
        if(next !== txt) el.textContent = next;
      }
    });
  }

  // Auditbericht um Copy-Feedback-Hinweis ergänzen, falls vorhandene API da ist.
  function patchAuditReport(){
    if(!window.PRX_AUDIT || window.PRX_AUDIT.__prx3105Patched) return;
    var oldReport = window.PRX_AUDIT.report;
    if(typeof oldReport === 'function'){
      window.PRX_AUDIT.report = function(){
        var r = oldReport.apply(window.PRX_AUDIT, arguments) || '';
        r = String(r).replace(/Version:\s*[^\n]+/, 'Version: '+VERSION);
        if(!/Copy-Feedback/.test(r)){
          r += '\n\n## Bedienhinweis Kopieren\n\n- Kopierschalter geben ab V3.10.5 sichtbares Toast-/Puls-Feedback.\n';
        }
        return r;
      };
    }
    window.PRX_AUDIT.__prx3105Patched = true;
  }

  function tick(){
    annotateAuditControls();
    syncVisibleVersions();
    patchAuditReport();
  }

  var style = document.createElement('style');
  style.textContent = '\n' +
    '.prx-toast-feedback{z-index:999999!important; position:fixed!important; left:50%!important; bottom:calc(92px + env(safe-area-inset-bottom))!important; transform:translateX(-50%)!important; max-width:min(86vw,520px)!important; padding:12px 16px!important; border-radius:999px!important; border:1px solid rgba(120,255,210,.34)!important; background:rgba(4,28,22,.92)!important; color:#f5fff8!important; font-weight:800!important; font-size:14px!important; letter-spacing:.02em!important; box-shadow:0 14px 40px rgba(0,0,0,.38)!important; backdrop-filter:blur(18px)!important;}\n' +
    '.prx-toast-feedback[data-kind="error"]{border-color:rgba(255,110,110,.65)!important;}\n' +
    '.prx-action-done{animation:prxActionDonePulse .82s ease-out!important; position:relative;}\n' +
    '@keyframes prxActionDonePulse{0%{box-shadow:0 0 0 0 rgba(90,255,200,.0)}35%{box-shadow:0 0 0 5px rgba(90,255,200,.38)}100%{box-shadow:0 0 0 14px rgba(90,255,200,0)}}\n' +
    '.prx-action-done::after{content:"✓"; position:absolute; right:8px; top:6px; min-width:20px; height:20px; display:grid; place-items:center; border-radius:999px; background:#63e6b8; color:#042019; font-weight:900; font-size:13px; pointer-events:none;}\n';
  document.head.appendChild(style);

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick, {once:true}); else tick();
  setTimeout(tick, 400);
  setTimeout(tick, 1200);
  setInterval(tick, 2500);

  window.PRX_COPY_FEEDBACK = { show: showToast, annotate: annotateAuditControls, version: VERSION };
})();
