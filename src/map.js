import { state, filteredPrs, prStatus, prUserState } from './state.js';

let map;
let pinLayer;
let gpxLayer;
let kmlLayer;
let endpointLayer;
let heatmapLayer;
let openPrCallback;
let activeBaseLayer = 'osm';
let redrawTimer = 0;

const mapStyle = {
  pinScale: 1.08,
  activePinScale: 1.36,
  inactiveLineWeight: 2
};

const baseLayers = new Map();
const BASE_LAYER_CONFIG = {
  osm: { label: 'OSM', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', options: { maxZoom: 19, attribution: '(c) OpenStreetMap' } },
  topo: { label: 'Topo', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', options: { maxZoom: 17, attribution: '(c) OpenTopoMap, (c) OpenStreetMap' } },
  sat: { label: 'Sat', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', options: { maxZoom: 18, attribution: 'Tiles (c) Esri' } }
};

export function initMap(onOpenPr) {
  if (!window.L) throw new Error('Leaflet is not available');
  openPrCallback = onOpenPr;

  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    tap: true
  }).setView([32.75, -16.95], 10);

  Object.entries(BASE_LAYER_CONFIG).forEach(([key, config]) => {
    baseLayers.set(key, L.tileLayer(config.url, {
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 4,
      crossOrigin: true,
      ...config.options
    }));
  });
  baseLayers.get(activeBaseLayer).addTo(map);

  pinLayer = L.layerGroup().addTo(map);
  heatmapLayer = L.layerGroup().addTo(map);
  gpxLayer = L.layerGroup().addTo(map);
  kmlLayer = L.layerGroup().addTo(map);
  endpointLayer = L.layerGroup().addTo(map);

  window.addEventListener('resize', invalidateMap);
  setTimeout(invalidateMap, 120);
}

export function renderPins() {
  if (!pinLayer) return;
  pinLayer.clearLayers();

  filteredPrs().forEach(pr => {
    if (!Number.isFinite(pr.lat) || !Number.isFinite(pr.lon)) return;
    const isActive = state.activeId === pr.id;
    const faded = Boolean((state.activeId || state.heatmapMode) && !isActive);
    const marker = L.marker([pr.lat, pr.lon], {
      icon: createPrFlag(pr, isActive, faded),
      zIndexOffset: isActive ? 10000 : faded ? -100 : 0,
      riseOnHover: true
    });
    marker.bindTooltip(`${pr.displayId} - ${pr.name}`);
    marker.on('click', () => openPrCallback(pr.id));
    marker.addTo(pinLayer);
  });
}

export function fitAll() {
  if (!map) return;
  invalidateMap();
  const points = filteredPrs()
    .filter(pr => Number.isFinite(pr.lat) && Number.isFinite(pr.lon))
    .map(pr => [pr.lat, pr.lon]);

  if (points.length) map.fitBounds(points, { paddingTopLeft: [28, 128], paddingBottomRight: [28, 118], animate: false });
}

export function setBaseLayer(key) {
  if (!map || !baseLayers.has(key)) return activeBaseLayer;
  if (key === activeBaseLayer) return activeBaseLayer;

  const current = baseLayers.get(activeBaseLayer);
  const next = baseLayers.get(key);
  if (current) map.removeLayer(current);
  next.addTo(map);
  activeBaseLayer = key;
  setTimeout(invalidateMap, 80);
  return activeBaseLayer;
}

export function getBaseLayers() {
  return Object.entries(BASE_LAYER_CONFIG).map(([key, config]) => ({ key, label: config.label, active: key === activeBaseLayer }));
}

export async function showPrOnMap(id) {
  if (!map) return;
  clearActiveLayers();
  state.activeId = id;
  renderPins();

  const pr = state.data.prs.find(item => item.id === id);
  if (!pr) return;

  const bounds = [];
  const style = currentRouteStyle();
  if (pr.route?.file) bounds.push(...await drawFile(pr.route.file, kmlLayer, style.kmlColor, 'KML', true));
  if (pr.track?.file) bounds.push(...await drawFile(pr.track.file, gpxLayer, style.gpxColor, 'GPX', true));
  if (!bounds.length && Number.isFinite(pr.lat) && Number.isFinite(pr.lon)) bounds.push([pr.lat, pr.lon]);

  if (bounds.length) {
    map.fitBounds(bounds, {
      paddingTopLeft: [28, getTopPadding()],
      paddingBottomRight: [28, getBottomPadding()],
      maxZoom: 14,
      animate: false
    });
  }
}

export async function toggleHeatmapMode() {
  state.heatmapMode = !state.heatmapMode;
  await renderHeatmap();
  renderPins();
  return state.heatmapMode;
}

export async function renderHeatmap() {
  if (!heatmapLayer) return;
  heatmapLayer.clearLayers();
  if (!state.heatmapMode) return;

  const prs = filteredPrs().filter(pr => pr.route?.file);
  const bounds = [];
  for (const pr of prs) {
    bounds.push(...await drawHeatmapFile(pr.route.file));
  }

  if (bounds.length && !state.activeId) {
    map.fitBounds(bounds, {
      paddingTopLeft: [28, getTopPadding()],
      paddingBottomRight: [28, 128],
      maxZoom: 12,
      animate: false
    });
  }
}

async function drawFile(file, layer, color, label, active) {
  try {
    const data = await fetch(file, { cache: 'force-cache' }).then(res => res.json());
    const raw = (data.points || [])
      .map(point => [Number(point[0]), Number(point[1])])
      .filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]));
    const segments = splitSegments(raw);
    const drawn = [];
    const style = currentRouteStyle();
    const weight = active ? style.activeLineWeight : mapStyle.inactiveLineWeight;

    segments.forEach(segment => {
      if (segment.length < 2) return;
      L.polyline(segment, {
        color: style.lineHaloColor,
        weight: weight + style.lineHaloWeight * 2,
        opacity: active ? 0.85 : 0.24,
        interactive: false
      }).addTo(layer);
      L.polyline(segment, { color, weight, opacity: active ? 0.94 : 0.24, interactive: false }).addTo(layer);
      drawn.push(...segment);
    });
    addEndpoints(drawn, color, label);
    return drawn;
  } catch (error) {
    console.warn('Could not draw route file', file, error);
    return [];
  }
}

async function drawHeatmapFile(file) {
  try {
    const data = await fetch(file, { cache: 'force-cache' }).then(res => res.json());
    const raw = (data.points || [])
      .map(point => [Number(point[0]), Number(point[1])])
      .filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]));
    const segments = splitSegments(raw);
    const drawn = [];

    segments.forEach(segment => {
      if (segment.length < 2) return;
      L.polyline(segment, {
        color: '#36aaff',
        weight: 12,
        opacity: 0.18,
        interactive: false,
        className: 'heat-route-glow'
      }).addTo(heatmapLayer);
      L.polyline(segment, {
        color: '#73d7ff',
        weight: 5,
        opacity: 0.34,
        interactive: false,
        className: 'heat-route-core'
      }).addTo(heatmapLayer);
      drawn.push(...segment);
    });

    return drawn;
  } catch (error) {
    console.warn('Could not draw heatmap route file', file, error);
    return [];
  }
}

function createPrFlag(pr, active, faded) {
  if (faded) return createPrDot(pr);

  const scale = active ? mapStyle.activePinScale : mapStyle.pinScale;
  const difficulty = difficultyStyle(pr.difficulty);
  const status = statusEmoji(prStatus(pr));
  const user = prUserState(pr.id);
  const activity = activityBadge(user.activity);
  const html = `
    <span class="pr-pin-wrap ${active ? 'active' : ''} ${faded ? 'faded' : ''}" style="--pin-scale:${scale}">
      <span class="pr-needle"></span>
      <span class="pr-flag ${active ? 'active' : ''}" style="--pin-bg:${difficulty.bg};--pin-fg:${difficulty.fg}">
        <span class="status-emoji">${status}</span>
        <span class="activity ${activity ? '' : 'empty'}">${activity?.label || ''}</span>
        ${escapeHtml(compactPrNumber(pr.displayId))}
      </span>
    </span>`;

  return L.divIcon({
    className: 'pr-flag-icon',
    html,
    iconSize: [Math.ceil(86 * scale), Math.ceil(54 * scale)],
    iconAnchor: [Math.ceil(16 * scale), Math.ceil(48 * scale)]
  });
}

function createPrDot(pr) {
  const html = `<span class="pr-dot" style="--dot-bg:${statusColor(prStatus(pr))}"></span>`;
  return L.divIcon({
    className: 'pr-dot-icon',
    html,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function compactPrNumber(displayId) {
  return String(displayId || '').replace(/^PR\s*/i, '');
}

function splitSegments(points, maxJumpKm = 1.5) {
  if (!points.length) return [];
  const segments = [];
  let current = [points[0]];

  for (let i = 1; i < points.length; i += 1) {
    const last = current[current.length - 1];
    const next = points[i];
    if (distanceKm(last, next) > maxJumpKm) {
      if (current.length > 1) segments.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }

  if (current.length > 1) segments.push(current);
  return segments;
}

function addEndpoints(points, color, label) {
  if (!points.length) return;
  addEndpoint(points[0], color, `${label} Start`, 6);
  const last = points[points.length - 1];
  if (last[0] !== points[0][0] || last[1] !== points[0][1]) addEndpoint(last, color, `${label} Ziel`, 9);
}

function addEndpoint(point, color, label, radius) {
  const marker = L.circleMarker(point, { radius, color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 });
  marker.bindTooltip(label);
  marker.addTo(endpointLayer);
}

function clearActiveLayers() {
  if (!gpxLayer || !kmlLayer || !endpointLayer) return;
  gpxLayer.clearLayers();
  kmlLayer.clearLayers();
  endpointLayer.clearLayers();
}

export function redrawActiveRoute() {
  if (!state.activeId) return;
  window.clearTimeout(redrawTimer);
  redrawTimer = window.setTimeout(() => showPrOnMap(state.activeId), 80);
}

function currentRouteStyle() {
  return {
    activeLineWeight: Number(state.mapStyle.activeLineWeight) || 5,
    lineHaloWeight: Number(state.mapStyle.lineHaloWeight) || 0.5,
    lineHaloColor: state.mapStyle.lineHaloColor || '#ffffff',
    gpxColor: state.mapStyle.gpxColor || '#ff453a',
    kmlColor: state.mapStyle.kmlColor || '#0a84ff'
  };
}

function invalidateMap() {
  if (map) map.invalidateSize({ animate: false });
}

function getTopPadding() {
  const controls = document.querySelector('#mapControls')?.getBoundingClientRect();
  return controls ? Math.ceil(controls.bottom + 20) : 128;
}

function getBottomPadding() {
  const sheet = document.querySelector('#sheet')?.getBoundingClientRect();
  if (!sheet) return 118;
  return Math.ceil(window.innerHeight - sheet.top + 22);
}

function difficultyStyle(value = '') {
  const s = normalize(value);
  if (s.includes('schwer')) return { bg: '#ff453a', fg: '#ffffff' };
  if (s.includes('mittel')) return { bg: '#ffd166', fg: '#142426' };
  if (s.includes('leicht')) return { bg: '#35d49f', fg: '#082224' };
  return { bg: '#7dd8ff', fg: '#061b1d' };
}

function statusEmoji(value = '') {
  const s = normalize(value);
  if (s.includes('closed') || s.includes('geschlossen')) return '\u{1F534}';
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return '\u{1F7E1}';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return '\u{1F7E2}';
  return '\u{1F7E1}';
}

function statusColor(value = '') {
  const s = normalize(value);
  if (s.includes('closed') || s.includes('geschlossen')) return '#ff453a';
  if (s.includes('restricted') || s.includes('eingeschraenkt') || s.includes('eingeschrankt')) return '#ffd166';
  if (s.includes('open') || s.includes('geoeffnet') || s.includes('geoffnet')) return '#35d49f';
  return '#ffd166';
}

function activityBadge(value = '') {
  if (value === 'favorite') return { label: '\u{1F499}' };
  if (value === 'planned') return { label: '\u2665\uFE0F' };
  if (value === 'booked') return { label: '\u2B50\uFE0F' };
  return null;
}

function normalize(value) {
  return String(value || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00DF/g, 'ss');
}

function distanceKm(a, b) {
  const radius = 6371.0088;
  const p1 = a[0] * Math.PI / 180;
  const p2 = b[0] * Math.PI / 180;
  const dp = (b[0] - a[0]) * Math.PI / 180;
  const dl = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
