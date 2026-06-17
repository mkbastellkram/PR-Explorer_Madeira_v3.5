/* V4.0.2 map recovery: keep Leaflet tiles and overlays isolated from app-wide media styles. */
.map-layer.leaflet-container {
  z-index: 1;
  width: 100vw !important;
  height: 100dvh !important;
  min-height: 100dvh !important;
  overflow: hidden !important;
}

.leaflet-container .leaflet-tile {
  width: 256px !important;
  height: 256px !important;
  max-width: none !important;
  max-height: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  object-fit: initial !important;
  filter: none !important;
}

.leaflet-container .leaflet-marker-pane,
.leaflet-container .leaflet-overlay-pane {
  pointer-events: auto;
}

.leaflet-container .leaflet-control-container {
  position: relative;
  z-index: 700;
}
