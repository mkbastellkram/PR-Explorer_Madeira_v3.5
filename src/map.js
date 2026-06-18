import { state, filteredPrs } from './state.js';

let map;
let renderer;
let pinLayer;
let gpxLayer;
let kmlLayer;
let endpointLayer;
let openPrCallback;

export function initMap(onOpenPr) {
  openPrCallback = onOpenPr;
  renderer = L.canvas({ padding: 0.5 });
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
  }).setView([32.75, -16.95], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 3,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  pinLayer = L.layerGroup().addTo(map);
  gpxLayer = L.layerGroup().addTo(map);
  kmlLayer = L.layerGroup().addTo(map);
  endpointLayer = L.layerGroup().addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  window.addEventListener('resize', () => map.invalidateSize({ animate: false }));
}

export function renderPins() {
  pinLayer.clearLayers();
  filteredPrs().forEach(pr => {
    if (!Number.isFinite(pr.lat) || !Number.isFinite(pr.lon)) return;
    const marker = L.circleMarker([pr.lat, pr.lon], {
      renderer,
      radius: state.activeId === pr.id ? 10 : 7,
      color: '#ffffff',
      weight: 2,
      fillColor: statusColor(pr.status),
      fillOpacity: 0.94
    });
    marker.bindTooltip(`${pr.displayId} · ${pr.name}`);
    marker.on('click', () => openPrCallback(pr.id));
    marker.addTo(pinLayer);
  });
}

export function fitAll() {
  const points = filteredPrs()
    .filter(pr => Number.isFinite(pr.lat) && Number.isFinite(pr.lon))
    .map(pr => [pr.lat, pr.lon]);
  if (points.length) map.fitBounds(points, { padding: [38, 38], animate: false });
}

export async function showPrOnMap(id) {
  clearActiveLayers();
  state.activeId = id;
  renderPins();
  const pr = state.data.prs.find(item => item.id === id);
  if (!pr) return;
  const bounds = [];
  if (pr.route?.file) bounds.push(...await drawFile(pr.route.file, kmlLayer, '#0a84ff', 'KML'));
  if (pr.track?.file) bounds.push(...await drawFile(pr.track.file, gpxLayer, '#ff453a', 'GPX'));
  if (!bounds.length && Number.isFinite(pr.lat) && Number.isFinite(pr.lon)) bounds.push([pr.lat, pr.lon]);
  if (bounds.length) map.fitBounds(bounds, { paddingTopLeft: [28, 76], paddingBottomRight: [28, 300], maxZoom: 14, animate: false });
}

async function drawFile(file, layer, color, label) {
  try {
    const data = await fetch(file, { cache: 'force-cache' }).then(res => res.json());
    const raw = (data.points || []).map(point => [Number(point[0]), Number(point[1])]).filter(point => Number.isFinite(point[0]) && Number.isFinite(point[1]));
    const segments = splitSegments(raw);
    const drawn = [];
    segments.forEach(segment => {
      if (segment.length < 2) return;
      L.polyline(segment, { renderer, color: '#ffffff', weight: 7, opacity: 0.42, interactive: false }).addTo(layer);
      L.polyline(segment, { renderer, color, weight: 4, opacity: 0.92, interactive: false }).addTo(layer);
      drawn.push(...segment);
    });
    addEndpoints(drawn, color, label);
    return drawn;
  } catch (error) {
    console.warn('Could not draw route file', file, error);
    return [];
  }
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
  const marker = L.circleMarker(point, { renderer, radius, color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 });
  marker.bindTooltip(label);
  marker.addTo(endpointLayer);
}

function clearActiveLayers() {
  gpxLayer.clearLayers();
  kmlLayer.clearLayers();
  endpointLayer.clearLayers();
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

function statusColor(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('closed')) return '#ff453a';
  if (s.includes('restricted')) return '#ffd166';
  if (s.includes('open')) return '#35d49f';
  return '#38d5bd';
}
