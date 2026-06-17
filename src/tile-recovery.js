(() => {
'use strict';

const FALLBACK_OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const RETRY_LIMIT = 2;

function formatUrl(template, coords) {
  return template
    .replace('{z}', coords.z)
    .replace('{x}', coords.x)
    .replace('{y}', coords.y);
}

function patchLeafletTiles() {
  if (!window.L || !L.TileLayer || L.TileLayer.prototype.__prxTileRecovery) return;

  const originalCreateTile = L.TileLayer.prototype.createTile;
  L.TileLayer.prototype.createTile = function createRecoveredTile(coords, done) {
    const tile = originalCreateTile.call(this, coords, done);
    tile.dataset.prxRetry = '0';
    tile.addEventListener('error', () => {
      const retry = Number(tile.dataset.prxRetry || 0);
      if (retry < RETRY_LIMIT) {
        tile.dataset.prxRetry = String(retry + 1);
        const cleanSrc = tile.src.split('#')[0];
        setTimeout(() => {
          tile.src = `${cleanSrc}#retry-${retry + 1}-${Date.now()}`;
        }, 180 + (retry * 420));
        return;
      }

      if (!tile.src.includes('tile.openstreetmap.org')) {
        tile.src = formatUrl(FALLBACK_OSM, coords);
      }
    });
    return tile;
  };

  L.TileLayer.prototype.__prxTileRecovery = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', patchLeafletTiles, { once: true });
} else {
  patchLeafletTiles();
}
})();
