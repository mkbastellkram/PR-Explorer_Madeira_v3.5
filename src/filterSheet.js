import { saveSettings, setTripSetting, state, filteredPrs, metricValue, prsForRange, resetRangeFilters, setRangeFilter, togglePoiCategory } from './state.js';
import { poiCategoryDefinitions } from './poiModel.js';

const METRICS = [
  { key: 'driveKm', label: 'Anfahrt', unit: 'km', precision: 0 },
  { key: 'driveMin', label: 'Anfahrtszeit', unit: 'min', precision: 0 },
  { key: 'distanceKm', label: 'GPX-Laenge', unit: 'km', precision: 1 },
  { key: 'durationMin', label: 'GPX-Dauer', unit: 'h', precision: 1, format: value => `${formatNumber(value / 60, 1)} h` }
];

let onChangeCallback = () => {};

export function openFilterSheet(onChange) {
  onChangeCallback = onChange || (() => {});
  const existing = document.querySelector('.filter-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'filter-backdrop';
  backdrop.innerHTML = `
    <section class="filter-sheet" role="dialog" aria-modal="true" aria-label="Kartenfilter">
      <header>
        <div>
          <strong>Filter</strong>
          <span id="filterCount"></span>
        </div>
        <button data-filter-close aria-label="Schliessen">x</button>
      </header>
      <div class="filter-body">
        <section>
          <h2>Linien</h2>
          <div id="lineControls"></div>
        </section>
        <section>
          <h2>Regionen</h2>
          <div class="filter-region-grid" id="filterRegions"></div>
        </section>
        <section>
          <h2>POI-Ebenen</h2>
          <div class="filter-region-grid" id="poiCategories"></div>
        </section>
        <section>
          <h2>Werte</h2>
          <div id="filterRanges"></div>
        </section>
        <section>
          <h2>Reise & Fahrzeug</h2>
          <div id="tripControls"></div>
        </section>
      </div>
      <footer>
        <button data-filter-reset>Zuruecksetzen</button>
        <button class="primary" data-filter-close>Fertig</button>
      </footer>
    </section>`;

  document.querySelector('#app').append(backdrop);
  backdrop.querySelectorAll('[data-filter-close]').forEach(button => button.addEventListener('click', () => backdrop.remove()));
  backdrop.querySelector('[data-filter-reset]').addEventListener('click', () => {
    state.filters.regions.clear();
    state.filters.statuses.clear();
    resetRangeFilters();
    emitChange();
    renderFilterControls(backdrop);
  });

  renderFilterControls(backdrop);
}

function renderFilterControls(backdrop) {
  renderLineControls(backdrop);
  renderRegions(backdrop);
  renderPoiCategories(backdrop);
  renderRanges(backdrop);
  renderTripControls(backdrop);
  backdrop.querySelector('#filterCount').textContent = `${filteredPrs().length} PRs sichtbar`;
}

function renderPoiCategories(backdrop) {
  const host = backdrop.querySelector('#poiCategories');
  host.innerHTML = poiCategoryDefinitions()
    .map(category => `<button class="chip ${state.poiFilters.categories.has(category.id) ? 'active' : ''}" data-poi-category="${escapeHtml(category.id)}">${escapeHtml(category.icon)} ${escapeHtml(category.label)}</button>`)
    .join('');
  host.querySelectorAll('[data-poi-category]').forEach(button => {
    button.addEventListener('click', () => {
      togglePoiCategory(button.dataset.poiCategory);
      emitChange();
      renderFilterControls(backdrop);
    });
  });
}

function renderLineControls(backdrop) {
  const style = state.mapStyle;
  const host = backdrop.querySelector('#lineControls');
  host.innerHTML = `
    <div class="line-style-grid">
      ${colorControl('gpxColor', 'GPX', style.gpxColor)}
      ${colorControl('kmlColor', 'KML', style.kmlColor)}
    </div>
    ${styleSlider('activeLineWeight', 'Linienbreite', style.activeLineWeight, 2, 9, 0.5, 'px')}
    ${styleSlider('lineHaloWeight', 'Weisse Kontur je Seite', style.lineHaloWeight, 0, 2, 0.5, 'px')}
  `;
  host.querySelectorAll('[data-style-color]').forEach(input => {
    input.addEventListener('input', () => {
      state.mapStyle[input.dataset.styleColor] = input.value;
      saveSettings();
      emitChange();
    });
  });
  host.querySelectorAll('[data-style-slider]').forEach(input => {
    input.addEventListener('input', () => {
      state.mapStyle[input.dataset.styleSlider] = Number(input.value);
      const label = host.querySelector(`[data-style-value="${input.dataset.styleSlider}"]`);
      if (label) label.textContent = `${formatNumber(Number(input.value), 1)} ${input.dataset.unit}`;
      saveSettings();
      emitChange();
    });
  });
}

function renderTripControls(backdrop) {
  const host = backdrop.querySelector('#tripControls');
  const s = state.tripSettings;
  host.innerHTML = `
    ${tripSlider('fuelLitersPer100Km', 'Verbrauch', s.fuelLitersPer100Km, 4, 14, 0.1, 'l/100 km')}
    ${tripSlider('fuelPricePerLiter', 'Kraftstoffpreis', s.fuelPricePerLiter, 1.2, 2.8, 0.05, 'EUR/l')}
    ${tripSlider('driveTimeFactor', 'Madeira-Fahrzeitfaktor', s.driveTimeFactor, 1, 1.8, 0.05, 'x')}
    ${tripSlider('startupMinutes', 'Startaufschlag', s.startupMinutes, 0, 30, 5, 'min')}
    ${tripSlider('parkingMinutes', 'Parkplatzsuche', s.parkingMinutes, 0, 30, 5, 'min')}
    ${tripSlider('walkToStartMinutes', 'Weg zum Start', s.walkToStartMinutes, 0, 30, 5, 'min')}
    ${tripSlider('fuelReserveFactor', 'Reichweitenreserve', s.fuelReserveFactor, 1, 1.5, 0.05, 'x')}
  `;
  host.querySelectorAll('[data-trip-setting]').forEach(input => {
    input.addEventListener('input', () => {
      setTripSetting(input.dataset.tripSetting, input.value);
      const label = host.querySelector(`[data-trip-value="${input.dataset.tripSetting}"]`);
      if (label) label.textContent = `${formatNumber(Number(input.value), valuePrecision(input.step))} ${input.dataset.unit}`;
      emitChange();
    });
  });
}

function tripSlider(key, label, value, min, max, step, unit) {
  return `
    <label class="style-slider">
      <span>${label}<strong data-trip-value="${key}">${formatNumber(value, valuePrecision(step))} ${unit}</strong></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-trip-setting="${key}" data-unit="${unit}" />
    </label>`;
}

function colorControl(key, label, value) {
  return `
    <label class="color-control">
      <span>${label}</span>
      <input type="color" value="${escapeHtml(value)}" data-style-color="${key}" />
    </label>`;
}

function styleSlider(key, label, value, min, max, step, unit) {
  return `
    <label class="style-slider">
      <span>${label}<strong data-style-value="${key}">${formatNumber(value, 1)} ${unit}</strong></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-style-slider="${key}" data-unit="${unit}" />
    </label>`;
}

function renderRegions(backdrop) {
  const regions = [...new Set((state.data?.prs || []).map(pr => pr.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));
  const host = backdrop.querySelector('#filterRegions');
  host.innerHTML = `<button class="chip ${state.filters.regions.size ? '' : 'active'}" data-region="">Alle</button>` +
    regions.map(region => `<button class="chip ${state.filters.regions.has(region) ? 'active' : ''}" data-region="${escapeHtml(region)}">${escapeHtml(region)}</button>`).join('');
  host.querySelectorAll('[data-region]').forEach(button => {
    button.addEventListener('click', () => {
      const region = button.dataset.region;
      if (!region) state.filters.regions.clear();
      else if (state.filters.regions.has(region)) state.filters.regions.delete(region);
      else state.filters.regions.add(region);
      clampAllRanges();
      emitChange();
      renderFilterControls(backdrop);
    });
  });
}

function renderRanges(backdrop) {
  const host = backdrop.querySelector('#filterRanges');
  host.innerHTML = METRICS.map(metric => renderMetric(metric)).join('');
  host.querySelectorAll('[data-range-key]').forEach(node => bindRange(node, backdrop));
}

function renderMetric(metric) {
  const values = valuesFor(metric.key);
  const global = metricBounds(metric.key, state.data?.prs || []);
  const min = global.min ?? 0;
  const max = global.max ?? 0;
  const visibleMin = values[0] ?? min;
  const visibleMax = values[values.length - 1] ?? max;
  const current = state.filters.ranges[metric.key] || { min: visibleMin, max: visibleMax };
  const low = clampToValues(current.min, values, visibleMin);
  const high = clampToValues(current.max, values, visibleMax);
  const safeLow = Math.min(low, high);
  const safeHigh = Math.max(low, high);

  return `
    <div class="range-card" data-range-key="${metric.key}">
      <div class="range-head">
        <strong>${metric.label}</strong>
        <span>${formatMetric(metric, safeLow)} - ${formatMetric(metric, safeHigh)}</span>
      </div>
      <div class="double-range">
        <input type="range" min="${min}" max="${max}" step="0.1" value="${safeLow}" data-range-min />
        <input type="range" min="${min}" max="${max}" step="0.1" value="${safeHigh}" data-range-max />
      </div>
      <div class="range-foot">
        <span>${formatMetric(metric, min)}</span>
        <span>${formatMetric(metric, max)}</span>
      </div>
      <div class="range-live">
        aktuell ${formatMetric(metric, visibleMin)} - ${formatMetric(metric, visibleMax)}
      </div>
    </div>`;
}

function bindRange(node, backdrop) {
  const key = node.dataset.rangeKey;
  const minInput = node.querySelector('[data-range-min]');
  const maxInput = node.querySelector('[data-range-max]');
  const metric = METRICS.find(item => item.key === key);

  const update = event => {
    const values = valuesFor(key);
    let low = nearestValue(Number(minInput.value), values);
    let high = nearestValue(Number(maxInput.value), values);
    if (event?.target === minInput && low > high) low = high;
    if (event?.target === maxInput && high < low) high = low;
    minInput.value = low;
    maxInput.value = high;
    setRangeFilter(key, low, high);
    clampAllRanges();
    emitChange();
    renderFilterControls(backdrop);
  };

  minInput.addEventListener('input', update);
  maxInput.addEventListener('input', update);
  node.querySelector('.range-head span').textContent =
    `${formatMetric(metric, Number(minInput.value))} - ${formatMetric(metric, Number(maxInput.value))}`;
}

function clampAllRanges() {
  METRICS.forEach(metric => {
    const range = state.filters.ranges[metric.key];
    if (!range) return;
    const values = valuesFor(metric.key);
    if (!values.length) {
      state.filters.ranges[metric.key] = null;
      return;
    }
    const min = values[0];
    const max = values[values.length - 1];
    const nextMin = Math.max(min, range.min);
    const nextMax = Math.min(max, range.max);
    if (nextMin > nextMax) setRangeFilter(metric.key, min, max);
    else setRangeFilter(metric.key, nextMin, nextMax);
  });
}

function valuesFor(key) {
  return prsForRange(key)
    .map(pr => metricValue(pr, key))
    .filter(Number.isFinite)
    .sort((a, b) => a - b)
    .filter((value, index, values) => index === 0 || value !== values[index - 1]);
}

function metricBounds(key, prs) {
  const values = prs.map(pr => metricValue(pr, key)).filter(Number.isFinite).sort((a, b) => a - b);
  return { min: values[0] ?? 0, max: values[values.length - 1] ?? 0 };
}

function nearestValue(value, values) {
  if (!values.length) return value;
  return values.reduce((best, next) => Math.abs(next - value) < Math.abs(best - value) ? next : best, values[0]);
}

function clampToValues(value, values, fallback) {
  if (!values.length) return fallback;
  return nearestValue(Math.max(values[0], Math.min(values[values.length - 1], Number(value))), values);
}

function formatMetric(metric, value) {
  if (metric.format) return metric.format(value);
  return `${formatNumber(value, metric.precision)} ${metric.unit}`;
}

function formatNumber(value, precision) {
  return String(Number(value).toFixed(precision)).replace(/\.0$/, '').replace('.', ',');
}

function valuePrecision(step) {
  const raw = String(step);
  return raw.includes('.') ? raw.split('.')[1].length : 0;
}

function emitChange() {
  onChangeCallback();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
