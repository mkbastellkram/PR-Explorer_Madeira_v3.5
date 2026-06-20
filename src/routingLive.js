const ORS_KEY = 'prx.v5.orsKey';
const DEMO_START = { lat: 32.6484, lon: -16.9072, label: 'Funchal Zentrum' };
const COLORS = ['#2da8ff', '#35d49f', '#ffd166', '#ff5b6c', '#c7b7ff', '#ff9f0a', '#45d6ff', '#a7f06f', '#ff7ab6', '#8fd8ff'];

const routingState = {
  map: null,
  layerGroup: null,
  start: null,
  getTargets: () => [],
  fallbackKmlResolver: target => target.routeFile,
  maxAlternatives: 5,
  orsApiKey: '',
  routes: [],
  cache: new Map(),
  panel: null,
  toast: () => {}
};

export const PRXRoutingLive = {
  init(options = {}) {
    routingState.map = options.map;
    routingState.getTargets = options.getTargets || routingState.getTargets;
    routingState.fallbackKmlResolver = options.fallbackKmlResolver || routingState.fallbackKmlResolver;
    routingState.maxAlternatives = options.maxAlternatives || 5;
    routingState.orsApiKey = options.orsApiKey || localStorage.getItem(ORS_KEY) || '';
    routingState.toast = options.toast || routingState.toast;
    if (routingState.map && !routingState.layerGroup) {
      routingState.layerGroup = L.layerGroup().addTo(routingState.map);
    }
  },

  locateUser() {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        routingState.toast('GPS ist hier nicht verfuegbar.');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => {
          const start = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            label: 'Aktueller Standort'
          };
          this.setStartLocation(start);
          resolve(start);
        },
        () => {
          routingState.toast('GPS-Freigabe nicht erhalten.');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 120000 }
      );
    });
  },

  setStartLocation(start) {
    routingState.start = {
      lat: Number(start.lat),
      lon: Number(start.lon),
      label: start.label || 'Start'
    };
    renderPanel();
  },

  setDemoStart() {
    this.setStartLocation(DEMO_START);
  },

  saveApiKey(key) {
    routingState.orsApiKey = String(key || '').trim();
    if (routingState.orsApiKey) localStorage.setItem(ORS_KEY, routingState.orsApiKey);
    else localStorage.removeItem(ORS_KEY);
    renderPanel();
  },

  async showNearestRoutes({ count = routingState.maxAlternatives } = {}) {
    ensureStart();
    const targets = nearestTargets(count);
    this.clearRoutes();
    for (let index = 0; index < targets.length; index += 1) {
      await this.routeTo(targets[index], index);
      renderPanel();
    }
    fitRouteBounds();
  },

  async routeTo(target, colorIndex = routingState.routes.length) {
    ensureStart();
    const color = COLORS[colorIndex % COLORS.length];
    const route = routingState.orsApiKey
      ? await fetchOrsRoute(target, color).catch(() => fallbackRoute(target, color, 'ORS Fehler'))
      : await fallbackRoute(target, color, 'kein ORS-Key');
    routingState.routes.push(route);
    renderPanel();
    return route;
  },

  clearRoutes() {
    routingState.routes = [];
    routingState.layerGroup?.clearLayers();
    renderPanel();
  },

  toggleRoute(id) {
    const route = routingState.routes.find(item => item.id === id);
    if (!route) return;
    route.visible = !route.visible;
    if (route.visible) route.layer.addTo(routingState.layerGroup);
    else routingState.layerGroup.removeLayer(route.layer);
    renderPanel();
  },

  openGoogleMaps(target) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${target.lat},${target.lon}`)}`;
    window.open(url, '_blank', 'noopener');
  }
};

export function openRoutingPanel() {
  const existing = document.querySelector('#routingPanel');
  if (existing) {
    existing.remove();
    routingState.panel = null;
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'routingPanel';
  backdrop.className = 'routing-backdrop';
  backdrop.addEventListener('click', handlePanelClick);
  document.querySelector('#app').append(backdrop);
  routingState.panel = backdrop;
  renderPanel();
}

function handlePanelClick(event) {
  if (event.target.id === 'routingPanel' || event.target.closest('[data-routing-close]')) {
    routingState.panel?.remove();
    routingState.panel = null;
    return;
  }

  const action = event.target.closest('[data-routing-action]')?.dataset.routingAction;
  const routeId = event.target.closest('[data-route-toggle]')?.dataset.routeToggle;
  const mapsId = event.target.closest('[data-route-maps]')?.dataset.routeMaps;
  const targetRouteId = event.target.closest('[data-target-route]')?.dataset.targetRoute;
  const targetMapsId = event.target.closest('[data-target-maps]')?.dataset.targetMaps;

  if (action === 'gps') PRXRoutingLive.locateUser();
  if (action === 'demo') PRXRoutingLive.setDemoStart();
  if (action === 'nearest5') PRXRoutingLive.showNearestRoutes({ count: 5 });
  if (action === 'nearest10') PRXRoutingLive.showNearestRoutes({ count: 10 });
  if (action === 'active') {
    const target = activeTarget();
    if (target) PRXRoutingLive.routeTo(target);
  }
  if (action === 'clear') PRXRoutingLive.clearRoutes();
  if (action === 'saveKey') PRXRoutingLive.saveApiKey(routingState.panel.querySelector('[data-ors-key]')?.value);
  if (routeId) PRXRoutingLive.toggleRoute(routeId);
  if (targetRouteId) {
    const target = nearestTargets(10).find(item => item.id === targetRouteId);
    if (target) PRXRoutingLive.routeTo(target);
  }
  if (mapsId) {
    const route = routingState.routes.find(item => item.id === mapsId);
    if (route) PRXRoutingLive.openGoogleMaps(route.target);
  }
  if (targetMapsId) {
    const target = nearestTargets(10).find(item => item.id === targetMapsId);
    if (target) PRXRoutingLive.openGoogleMaps(target);
  }
}

function renderPanel() {
  if (!routingState.panel) return;
  const targets = nearestTargets(10);
  const selectedTarget = activeTarget();
  routingState.panel.innerHTML = `
    <section class="routing-panel" role="dialog" aria-modal="true" aria-label="Live Routing">
      <header>
        <div>
          <strong>Live Routing</strong>
          <span>${escapeHtml(routingState.start?.label || 'Startpunkt noch nicht gesetzt')}</span>
        </div>
        <button data-routing-close aria-label="Schliessen">x</button>
      </header>
      <div class="routing-body">
        <div class="routing-actions">
          <button data-routing-action="gps">Standort</button>
          <button data-routing-action="demo">Funchal</button>
          ${selectedTarget ? '<button data-routing-action="active">Aktiver PR</button>' : ''}
          <button data-routing-action="nearest5">5 Routen</button>
          <button data-routing-action="nearest10">10 Routen</button>
          <button data-routing-action="clear">Loeschen</button>
        </div>
        <label class="routing-key">
          <span>ORS API-Key</span>
          <input data-ors-key type="password" value="${escapeHtml(routingState.orsApiKey)}" placeholder="optional, lokal gespeichert" />
          <button data-routing-action="saveKey">Speichern</button>
        </label>
        <div class="routing-hint">
          Ablauf: Standort oder Funchal setzen, dann bei einem Ziel Route tippen. Ohne ORS-Key nutzt PRX KML/Luftlinie als Fallback. Wandertracks bleiben unveraendert.
        </div>
        <section class="routing-list">
          <strong>Routen</strong>
          ${routingState.routes.map(routeRow).join('') || routePreview(targets)}
        </section>
      </div>
    </section>`;
}

function activeTarget() {
  const activeId = window.PRX_ACTIVE_ID || '';
  return routingState.getTargets().find(target => target.id === activeId) || null;
}

function routeRow(route) {
  return `
    <article class="routing-row">
      <i style="--route-color:${route.color}"></i>
      <div>
        <strong>${escapeHtml(route.target.name)}</strong>
        <span>${route.source} - ${formatDistance(route.distanceMeters)} - ${formatDuration(route.durationSeconds)}</span>
      </div>
      <button data-route-toggle="${escapeHtml(route.id)}">${route.visible ? 'Aus' : 'Ein'}</button>
      <button data-route-maps="${escapeHtml(route.id)}">Maps</button>
    </article>`;
}

function routePreview(targets) {
  return targets.map(target => `
    <article class="routing-row preview">
      <i style="--route-color:${target.color}"></i>
      <div>
        <strong>${escapeHtml(target.name)}</strong>
        <span>${formatDistance(target.airDistance * 1000)} Luftlinie</span>
      </div>
      <button data-target-route="${escapeHtml(target.id)}">Route</button>
      <button data-target-maps="${escapeHtml(target.id)}">Maps</button>
    </article>`).join('') || '<div class="empty">Keine Ziele gefunden.</div>';
}

async function fetchOrsRoute(target, color) {
  const cacheKey = routeCacheKey(target);
  if (routingState.cache.has(cacheKey)) return drawGeoJsonRoute(target, color, routingState.cache.get(cacheKey), 'ORS');

  const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    method: 'POST',
    headers: {
      Authorization: routingState.orsApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coordinates: [
        [routingState.start.lon, routingState.start.lat],
        [target.lon, target.lat]
      ]
    })
  });
  if (!response.ok) throw new Error(`ORS ${response.status}`);
  const geojson = await response.json();
  routingState.cache.set(cacheKey, geojson);
  return drawGeoJsonRoute(target, color, geojson, 'ORS');
}

function drawGeoJsonRoute(target, color, geojson, source) {
  const layer = L.geoJSON(geojson, {
    style: { color, weight: 5, opacity: 0.86 }
  }).addTo(routingState.layerGroup);
  const summary = geojson.features?.[0]?.properties?.summary || {};
  return {
    id: routeId(target),
    target,
    color,
    layer,
    visible: true,
    source,
    distanceMeters: summary.distance || null,
    durationSeconds: summary.duration || null
  };
}

async function fallbackRoute(target, color, reason) {
  const file = routingState.fallbackKmlResolver(target);
  if (file) {
    try {
      const data = await fetch(file, { cache: 'force-cache' }).then(res => res.json());
      const points = (data.points || [])
        .map(point => [Number(point[0]), Number(point[1])])
        .filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]));
      if (points.length > 1) {
        const layer = L.polyline(points, { color, weight: 4, opacity: 0.58, dashArray: '8 8' }).addTo(routingState.layerGroup);
        return {
          id: routeId(target),
          target,
          color,
          layer,
          visible: true,
          source: `KML-Fallback (${reason})`,
          distanceMeters: Number(target.routeDistanceKm) ? target.routeDistanceKm * 1000 : null,
          durationSeconds: null
        };
      }
    } catch {
      // Continue to straight fallback.
    }
  }

  const layer = L.polyline([[routingState.start.lat, routingState.start.lon], [target.lat, target.lon]], {
    color,
    weight: 3,
    opacity: 0.45,
    dashArray: '4 8'
  }).addTo(routingState.layerGroup);
  return {
    id: routeId(target),
    target,
    color,
    layer,
    visible: true,
    source: `Luftlinie (${reason})`,
    distanceMeters: distanceKm(routingState.start, target) * 1000,
    durationSeconds: null
  };
}

function nearestTargets(count) {
  if (!routingState.start) return [];
  return routingState.getTargets()
    .filter(target => Number.isFinite(target.lat) && Number.isFinite(target.lon))
    .map((target, index) => ({
      ...target,
      airDistance: distanceKm(routingState.start, target),
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => a.airDistance - b.airDistance)
    .slice(0, count);
}

function ensureStart() {
  if (!routingState.start) PRXRoutingLive.setDemoStart();
}

function fitRouteBounds() {
  if (!routingState.routes.length || !routingState.map) return;
  const group = L.featureGroup(routingState.routes.filter(route => route.visible).map(route => route.layer));
  if (group.getLayers().length) routingState.map.fitBounds(group.getBounds(), { paddingTopLeft: [28, 128], paddingBottomRight: [28, 160], animate: false });
}

function routeCacheKey(target) {
  return `${round(routingState.start.lat)},${round(routingState.start.lon)}>${round(target.lat)},${round(target.lon)}`;
}

function routeId(target) {
  return `${target.type}-${target.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function round(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function distanceKm(a, b) {
  const radius = 6371.0088;
  const p1 = a.lat * Math.PI / 180;
  const p2 = b.lat * Math.PI / 180;
  const dp = (b.lat - a.lat) * Math.PI / 180;
  const dl = (b.lon - a.lon) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(meters) {
  return Number.isFinite(Number(meters)) ? `${String(Math.round(Number(meters) / 100) / 10).replace('.', ',')} km` : '-';
}

function formatDuration(seconds) {
  return Number.isFinite(Number(seconds)) ? `${Math.round(Number(seconds) / 60)} min` : 'Zeit offen';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
