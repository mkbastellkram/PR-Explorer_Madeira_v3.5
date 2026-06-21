const CACHE_VERSION = 'prx-v5-2-0-recorded-gpx-heatmap';
const APP_CACHE = `${CACHE_VERSION}-app`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/brand/apple-touch-icon.png',
  './assets/brand/app-icon-192.png',
  './assets/brand/app-icon-512.png',
  './assets/brand/app-icon-1024.png',
  './assets/brand/intro-madeira-2026.png',
  './assets/platforms/google.svg',
  './assets/platforms/googlemaps.svg',
  './assets/platforms/instagram.svg',
  './assets/platforms/komoot.svg',
  './assets/platforms/strava.svg',
  './assets/platforms/youtube.svg',
  './src/app.js',
  './src/detailSheet.js',
  './src/filterSheet.js',
  './src/infoCenter.js',
  './src/journal.js',
  './src/map.js',
  './src/poiModel.js',
  './src/routingLive.js',
  './src/state.js',
  './src/styles.css',
  './src/version.js',
  './data/poi-catalog.js',
  './data/prs.json',
  './data/pois.json',
  './data/webcams.json',
  './data/prx-poi-candidates.json',
  './data/pr-images.json',
  './data/info/attractions.js',
  './data/info/insta360-guides.js',
  './data/info/madeira-knowledge.js',
  './data/info/photo-guides.js',
  './data/info/rankings.js',
  './data/info/statistics.js',
  './data/info/tourism.js',
  './data/routes/pr-1.json',
  './data/routes/pr-1-1.json',
  './data/routes/pr-1-2.json',
  './data/routes/pr-1-3.json',
  './data/routes/pr-2.json',
  './data/routes/pr-3.json',
  './data/routes/pr-3-1.json',
  './data/routes/pr-4.json',
  './data/routes/pr-5.json',
  './data/routes/pr-6.json',
  './data/routes/pr-6-1.json',
  './data/routes/pr-6-2.json',
  './data/routes/pr-6-3.json',
  './data/routes/pr-6-4.json',
  './data/routes/pr-6-5.json',
  './data/routes/pr-6-6.json',
  './data/routes/pr-6-8.json',
  './data/routes/pr-7.json',
  './data/routes/pr-8.json',
  './data/routes/pr-9-1.json',
  './data/routes/pr-10.json',
  './data/routes/pr-11.json',
  './data/routes/pr-12.json',
  './data/routes/pr-13.json',
  './data/routes/pr-13-1.json',
  './data/routes/pr-14.json',
  './data/routes/pr-15.json',
  './data/routes/pr-16.json',
  './data/routes/pr-17.json',
  './data/routes/pr-18.json',
  './data/routes/pr-19.json',
  './data/routes/pr-20.json',
  './data/routes/pr-21.json',
  './data/routes/pr-22.json',
  './data/routes/pr-27.json',
  './data/routes/pr-28.json',
  './data/tracks/pr-1.json',
  './data/tracks/pr-1-1.json',
  './data/tracks/pr-1-2.json',
  './data/tracks/pr-1-3.json',
  './data/tracks/pr-2.json',
  './data/tracks/pr-3.json',
  './data/tracks/pr-3-1.json',
  './data/tracks/pr-4.json',
  './data/tracks/pr-5.json',
  './data/tracks/pr-6.json',
  './data/tracks/pr-6-1.json',
  './data/tracks/pr-6-2.json',
  './data/tracks/pr-6-3.json',
  './data/tracks/pr-6-4.json',
  './data/tracks/pr-6-5.json',
  './data/tracks/pr-6-6.json',
  './data/tracks/pr-6-8.json',
  './data/tracks/pr-7.json',
  './data/tracks/pr-8.json',
  './data/tracks/pr-9.json',
  './data/tracks/pr-9-1.json',
  './data/tracks/pr-10.json',
  './data/tracks/pr-11.json',
  './data/tracks/pr-12.json',
  './data/tracks/pr-13.json',
  './data/tracks/pr-13-1.json',
  './data/tracks/pr-14.json',
  './data/tracks/pr-15.json',
  './data/tracks/pr-16.json',
  './data/tracks/pr-17.json',
  './data/tracks/pr-18.json',
  './data/tracks/pr-19.json',
  './data/tracks/pr-20.json',
  './data/tracks/pr-21.json',
  './data/tracks/pr-22.json',
  './data/tracks/pr-27.json',
  './data/tracks/pr-28.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('prx-v5-') && !key.startsWith(CACHE_VERSION))
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.endsWith('/')) {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstThenNetwork(request));
    return;
  }

  if (url.hostname.includes('tile') || url.hostname.includes('unpkg.com') || url.hostname.includes('arcgisonline.com')) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirstThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    await putIfUsable(request, response.clone(), APP_CACHE);
    return response;
  } catch {
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw new Error('Offline and no cached response');
  }
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    await putIfUsable(request, response.clone(), APP_CACHE);
    return response;
  } catch {
    return caches.match(request).then(cached => cached || caches.match(fallbackUrl));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then(response => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || fresh || Response.error();
}

async function putIfUsable(request, response, cacheName) {
  if (!response || (!response.ok && response.type !== 'opaque')) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}
