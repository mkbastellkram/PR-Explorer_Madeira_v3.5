(function(){
  'use strict';
  const W = window;
  const rawRoutes = W.PRX_PR_ROUTES_MADEIRA || [];
  const rawHighlights = W.PRX_HIGHLIGHT_POIS_MADEIRA || [];
  const rawStandard = W.PRX_STANDARD_POIS_MADEIRA || [];
  const rawLegacy = W.PRX_LEGACY_PR_CONTEXT_POIS || [];
  const placeholder = 'assets/poi/placeholders/poi_placeholder.svg';
  const norm = v => String(v||'').toUpperCase().replace(/^ROUTE[_\s-]*/,'').replace(/\s+/g,'').replace(/[^A-Z0-9.]/g,'');
  const prNorm = v => {
    let s = String(v||'').trim();
    if(!s) return '';
    s = s.replace(/^route[_\s-]*/i,'');
    const ps = s.match(/^PS\s*-?\s*PR\s*([0-9]+(?:\.[0-9]+)?)/i) || s.match(/^PSPR\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(ps) return 'PSPR'+ps[1];
    const m = s.match(/^PR\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(m) return 'PR'+m[1];
    return norm(s);
  };
  const parsePRs = v => {
    if(Array.isArray(v)) return [...new Set(v.map(prNorm).filter(Boolean))];
    return [...new Set(String(v||'').split(/[;,|]/).map(prNorm).filter(Boolean))];
  };
  const conf = v => {
    const s = String(v||'').toLowerCase();
    if(s.includes('hoch') || s === 'high') return 'high';
    if(s.includes('mittel') || s === 'medium') return 'medium';
    if(s.includes('niedrig') || s === 'low') return 'low';
    return s || 'medium';
  };
  const iconCat = (cat,type) => {
    const s = (String(cat||'')+' '+String(type||'')).toLowerCase();
    if(s.includes('webcam')) return 'webcam';
    if(s.includes('toilet') || s.includes('wc')) return 'toilet';
    if(s.includes('supermarkt') || s.includes('supermarket')) return 'supermarket';
    if(s.includes('tank') || s.includes('fuel')) return 'fuel';
    if(s.includes('park') && !s.includes('park/')) return 'parking';
    if(s.includes('trailhead') || s.includes('startpunkt')) return 'trailhead';
    if(s.includes('bus') || s.includes('shuttle') || s.includes('taxi') || s.includes('airport') || s.includes('ferry') || s.includes('mobil')) return 'mobility';
    if(s.includes('wasserfall')) return 'waterfall';
    if(s.includes('aussicht') || s.includes('gipfel') || s.includes('miradouro')) return 'viewpoint';
    if(s.includes('strand') || s.includes('küste') || s.includes('kueste') || s.includes('naturpool')) return 'beach';
    if(s.includes('kirche') || s.includes('kapelle')) return 'sight';
    if(s.includes('museum') || s.includes('markt') || s.includes('histor') || s.includes('landmarke') || s.includes('garten') || s.includes('wald') || s.includes('natur')) return 'sight';
    return 'sight';
  };
  const common = (p, sourceKind) => ({
    id: p.poiId || p.id || (sourceKind+'_'+Math.random().toString(36).slice(2)),
    poiId: p.poiId || p.id || '',
    name: p.name || 'POI',
    categoryOriginal: p.category || p.categoryOriginal || '',
    category: iconCat(p.category || p.categoryPrx, p.type || p.classification),
    type: sourceKind,
    region: p.region || 'Madeira',
    lat: Number(p.lat),
    lng: Number(p.lng),
    shortDescriptionDe: p.shortText150 || p.shortText120 || p.short_150 || p.shortDescriptionDe || '',
    detailDescriptionDe: p.detailText280 || p.detail_280 || p.notes || '',
    notes: p.detailText280 || p.auditNote || p.notes || '',
    tags: p.tags || p.featureTags || '',
    sourceLabel: p.sourceLabel || p.sourceBasis || 'PRX POI V2',
    sourceUrl: p.sourceUrl || p.googleMapsSearchUrl || p.googleMapsUrl || '',
    googleMapsUrl: p.googleMapsSearchUrl || p.googleMapsUrl || p.google_maps || '',
    googleMapsPlaceUrl: p.googleMapsSearchUrl || p.googleMapsUrl || '',
    infoUrl: p.sourceUrl || '',
    thumbnailUrl: p.hasLocalThumbnail ? (p.thumbnailPath || '') : (p.offlinePlaceholder || placeholder),
    thumbnailSource: p.thumbnailRemoteUrl || p.infoImageSearchUrl || '',
    iconCategory: iconCat(p.category || p.categoryPrx, p.type || p.classification),
    baseIconId: iconCat(p.category || p.categoryPrx, p.type || p.classification),
    confidence: conf(p.confidence),
    auditStatus: p.auditStatus || '',
    importReady: p.importReady !== false,
    hidden: false,
    archived: false,
    addedBy: 'admin',
    addedAt: '2026-06-08',
    lastChecked: '2026-06-08',
    coordinateSource: p.coordinateSource || '',
    imagePlaceholder: placeholder
  });
  const highlights = rawHighlights.filter(p=>p && p.importReady!==false).map(p => Object.assign(common(p,'highlight'), {
    category: iconCat(p.category,'highlight'),
    relatedPR: parsePRs(p.nearRouteId),
    routeRelevance: 'highlight_context',
    isHighlightPoi: true,
    showInHighlightCarousel: true,
    popularityScore: p.popularityScore,
    crowdScore: p.crowdScore,
    decisionScore: p.decisionScore,
    hotspotCandidate: !!p.hotspotCandidate,
    bestTime: p.bestTime || '',
    avoidTime: p.avoidTime || ''
  }));
  const standard = rawStandard.filter(p=>p && p.importReady!==false).map(p => Object.assign(common(p,'standard'), {
    category: iconCat(p.category,p.type),
    relatedPR: parsePRs(p.relatedRouteId),
    routeRelevance: 'functional_context',
    isHighlightPoi: false,
    showInHighlightCarousel: false,
    showAsCountPlaceholder: true,
    distanceToRouteM: p.distanceToRouteM
  }));
  const legacy = rawLegacy.filter(p=>p && p.importReady!==false && String(p.auditStatus||'').toLowerCase()!=='merged').map(p => Object.assign(common(p,'legacy'), {
    category: iconCat(p.categoryPrx || p.categoryOriginal, 'legacy'),
    relatedPR: parsePRs(p.relatedRouteId),
    routeRelevance: 'legacy_context',
    isHighlightPoi: !/trailhead|parking|parkplatz|start/i.test(String(p.categoryPrx||p.categoryOriginal||'')),
    showInHighlightCarousel: !/trailhead|parking|parkplatz|start/i.test(String(p.categoryPrx||p.categoryOriginal||''))
  }));
  const byId = new Map();
  [...highlights, ...standard, ...legacy].forEach(p => {
    if(!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
    if(!p.id) return;
    if(byId.has(p.id)) p.id = p.id + '_' + Math.round(p.lat*100000) + '_' + Math.round(p.lng*100000);
    byId.set(p.id, p);
  });
  W.PRX_POIS = [...byId.values()];
  W.PRX_POI_V2_META = {
    source: 'PRX_POI_Datenpaket_V2_COMPLETED',
    generatedAt: '2026-06-08',
    highlightCount: highlights.length,
    standardCount: standard.length,
    legacyCount: legacy.length,
    total: W.PRX_POIS.length,
    images: 'placeholder_only'
  };
  W.PRX_TEXT_CONTENT = { routes: rawRoutes };
  if(W.PRX_DATA && Array.isArray(W.PRX_DATA.trails)){
    const routeMap = new Map(rawRoutes.map(r => [prNorm(r.originalId || r.routeNo || r.routeId), r]));
    W.PRX_DATA.trails.forEach(t => {
      const r = routeMap.get(prNorm(t.id)) || routeMap.get(prNorm('PR '+t.number));
      if(!r) return;
      t.shortText150 = r.shortText150 || t.shortText150 || '';
      t.detailText280 = r.detailText280 || t.detailText280 || '';
      t.featureTags = r.featureTags || t.featureTags || '';
      t.sourceUrl = r.sourceUrl || t.sourceUrl || '';
      t.googleMapsUrl = r.googleMapsUrl || t.googleMapsUrl || '';
      t.statusSnapshot = r.status_2026_06_07 || t.statusSnapshot || '';
      t.textImportReady = r.importReady !== false;
      if(!t.note && t.shortText150) t.note = t.shortText150;
    });
  }
})();
