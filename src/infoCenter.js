import { state, filteredPrs, durationToMinutes, prStatus } from './state.js';
import { rankingTopics } from '../data/info/rankings.js';
import { photoGuideTopics } from '../data/info/photo-guides.js';
import { insta360GuideTopics } from '../data/info/insta360-guides.js';
import { statisticTopics } from '../data/info/statistics.js';
import { madeiraKnowledgeTopics } from '../data/info/madeira-knowledge.js';
import { tourismTopics } from '../data/info/tourism.js';
import { attractionTopics } from '../data/info/attractions.js';

const categories = [
  { id: 'rankings', icon: '🏆', title: 'Rankings', text: 'Bestenlisten fuer schnelle Reiseentscheidungen.', topics: ['tunnels', 'waterfalls', 'bridges', 'calories'] },
  { id: 'statistics', icon: '📊', title: 'Statistik', text: 'Live-Auswertung fuer alle oder sichtbare PRs.', topics: ['selection-statistics'] },
  { id: 'photo', icon: '📷', title: 'Fotografie', text: 'Sonnenaufgang, Golden Hour und Blue Hour.', topics: ['sunrise', 'sunset', 'golden-hour', 'blue-hour'] },
  { id: 'insta360', icon: '🎥', title: 'Video & Insta360', text: 'Fake-Drone, Tiefenwirkung und Bewegungsachsen.', topics: ['best-insta360-spots'] },
  { id: 'landscape', icon: '⛰️', title: 'Natur & Landschaft', text: 'Landschaftstypen und passende PRs.', topics: ['landscape-types'] },
  { id: 'fitness', icon: '❤️', title: 'Schwierigkeit & Fitness', text: 'Belastung, Radarprofil und Kalorien.', topics: ['difficulty-radar', 'calories'] },
  { id: 'tourism', icon: '👥', title: 'Touristenaufkommen', text: 'Crowd Level und ruhigere Alternativen.', topics: ['crowd-level'] },
  { id: 'attractions', icon: '◆', title: 'Sehenswuerdigkeiten', text: 'Kuratierte POIs nach Kategorien.', topics: ['top-attractions'] },
  { id: 'tunnels', icon: '🔦', title: 'Tunnel', text: 'Tunnelanzahl, Laenge und Lampenbedarf.', topics: ['tunnels'] },
  { id: 'waterfalls', icon: '💧', title: 'Wasserfaelle', text: 'Wasserfall- und Fotowert.', topics: ['waterfalls'] },
  { id: 'bridges', icon: '🌉', title: 'Bruecken', text: 'Stege, Bruecken und Uebergaenge.', topics: ['bridges'] },
  { id: 'weather', icon: '🌦️', title: 'Wetter & Jahreszeiten', text: 'Vorbereitet fuer saisonale Empfehlungen.', topics: ['madeira-basics'] },
  { id: 'knowledge', icon: '🧭', title: 'Madeira Wissen', text: 'Grundwissen fuer Planung und Orientierung.', topics: ['madeira-basics'] }
];

const topics = [
  ...rankingTopics,
  ...photoGuideTopics,
  ...insta360GuideTopics,
  ...statisticTopics,
  ...madeiraKnowledgeTopics,
  ...tourismTopics,
  ...attractionTopics
];

const topicById = new Map(topics.map(topic => [topic.id, topic]));

let openPrCallback = null;
let mode = 'visible';

export function openInfoCenter(openPr, initialTopicId = '') {
  openPrCallback = openPr;
  document.querySelector('#infoCenter')?.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'infoCenter';
  backdrop.className = 'info-center-backdrop';
  const initialTopic = topicById.get(initialTopicId);
  backdrop.innerHTML = `<section class="info-center" role="dialog" aria-modal="true">${initialTopic ? renderTopic(initialTopic) : renderIndex()}</section>`;
  backdrop.addEventListener('click', handleClick);
  document.body.append(backdrop);
}

export function infoDigestsForPr(prLabel) {
  const normalized = normalizePrLabel(prLabel);
  return topics.flatMap(topic => {
    const hits = (topic.items || []).filter(item => itemMentionsPr(item, normalized));
    const item = hits[0];
    return item ? [{
      topicId: topic.id,
      category: topic.category || '',
      title: topic.title,
      lead: topic.lead,
      text: digestText(topic, item),
      value: digestValue(topic, item)
    }] : [];
  });
}

function handleClick(event) {
  const close = event.target.closest('[data-info-close]');
  const back = event.target.closest('[data-info-back]');
  const category = event.target.closest('[data-info-category]')?.dataset.infoCategory;
  const topic = event.target.closest('[data-info-topic]')?.dataset.infoTopic;
  const pr = event.target.closest('[data-info-pr]')?.dataset.infoPr;
  const nextMode = event.target.closest('[data-info-mode]')?.dataset.infoMode;

  if (event.target.id === 'infoCenter' || close) {
    document.querySelector('#infoCenter')?.remove();
    return;
  }
  if (back) {
    renderInto(renderIndex());
    return;
  }
  if (category) {
    renderInto(renderCategory(category));
    return;
  }
  if (topic) {
    renderInto(renderTopic(topicById.get(topic)));
    return;
  }
  if (nextMode) {
    mode = nextMode;
    const activeTopic = document.querySelector('.info-center [data-current-topic]')?.dataset.currentTopic;
    if (activeTopic) renderInto(renderTopic(topicById.get(activeTopic)));
    return;
  }
  if (pr) {
    const match = findPrByLabel(pr);
    document.querySelector('#infoCenter')?.remove();
    if (match) openPrCallback(match.id);
  }
}

function renderInto(html) {
  document.querySelector('#infoCenter .info-center').innerHTML = html;
}

function renderIndex() {
  return `
    ${header('Info Center', 'Wissen, Analyse, Inspiration und direkte PR-Verweise.', false)}
    <div class="info-scroll">
      <div class="info-hero">
        <strong>Madeira Knowledge Hub</strong>
        <span>Datengetriebener Reisefuehrer fuer Planung, Foto, Statistik und Vergleich.</span>
      </div>
      <div class="info-category-grid">
        ${categories.map(category => `
          <button class="info-category-card" data-info-category="${escapeHtml(category.id)}">
            <span>${category.icon}</span>
            <strong>${escapeHtml(category.title)}</strong>
            <em>${escapeHtml(category.text)}</em>
          </button>`).join('')}
      </div>
    </div>`;
}

function renderCategory(categoryId) {
  const category = categories.find(item => item.id === categoryId);
  const related = (category?.topics || []).map(id => topicById.get(id)).filter(Boolean);
  return `
    ${header(category?.title || 'Info Center', category?.text || '', true)}
    <div class="info-scroll">
      <div class="info-topic-list">
        ${related.map(topic => topicCard(topic)).join('') || '<div class="info-empty">Noch keine Themen hinterlegt.</div>'}
      </div>
    </div>`;
}

function renderTopic(topic) {
  if (!topic) return renderIndex();
  return `
    ${header(topic.title, topic.lead, true)}
    <div class="info-scroll" data-current-topic="${escapeHtml(topic.id)}">
      <div class="info-hero compact">
        <strong>${escapeHtml(topic.title)}</strong>
        <span>${escapeHtml(topic.lead)}</span>
      </div>
      ${topic.chart === 'statistics' ? renderStatisticsTopic() : renderChart(topic)}
      ${renderRanking(topic)}
      <section class="info-explain">
        <strong>Einordnung</strong>
        <p>${escapeHtml(topic.explanation || '')}</p>
      </section>
      ${renderPrLinks(topic)}
    </div>`;
}

function header(title, sub, showBack) {
  return `
    <header class="info-center-head">
      ${showBack ? '<button type="button" data-info-back aria-label="Zurueck">‹</button>' : '<span></span>'}
      <div><strong>${escapeHtml(title)}</strong><em>${escapeHtml(sub)}</em></div>
      <button type="button" data-info-close aria-label="Schliessen">&times;</button>
    </header>`;
}

function topicCard(topic) {
  return `
    <button class="info-topic-card" data-info-topic="${escapeHtml(topic.id)}">
      <strong>${escapeHtml(topic.title)}</strong>
      <span>${escapeHtml(topic.lead)}</span>
    </button>`;
}

function renderChart(topic) {
  if (topic.chart === 'bar' || topic.chart === 'heat-ranking') return renderBarChart(topic);
  if (topic.chart === 'radar') return renderRadar(topic);
  if (topic.chart === 'landscape') return renderLandscape(topic);
  if (topic.chart === 'attractions') return renderAttractions();
  return renderScoreCards(topic);
}

function renderAttractions() {
  const functional = new Set(['trailhead', 'parking', 'bus', 'toilet', 'water', 'supplies', 'health']);
  const pois = (state.pois || [])
    .filter(poi => poi.sourceLayer === 'prx')
    .filter(poi => !functional.has(poi.category));
  const groups = groupBy(pois, poi => poi.label || 'Sonstige');
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  return `
    <section class="info-chart-card">
      <strong>${pois.length} kuratierte POIs</strong>
      <p>Top-100 ist vorbereitet, aber noch nicht befuellt. Aktuell sichtbar ist der gepruefte PRX-Kontextbestand.</p>
      <div class="attraction-groups">
        ${sortedGroups.map(([label, items]) => `
          <article class="attraction-group">
            <header><strong>${escapeHtml(label)}</strong><span>${items.length}</span></header>
            <div>
              ${items.slice(0, 12).map(poi => attractionCard(poi)).join('')}
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

function attractionCard(poi) {
  const related = (poi.relatedPr || []).find(Boolean);
  return `
    <button ${related ? `data-info-pr="${escapeHtml(related)}"` : ''}>
      <b>${escapeHtml(poi.name)}</b>
      <span>${escapeHtml(poi.shortText || poi.subcategory || '')}</span>
    </button>`;
}

function renderBarChart(topic) {
  const items = sortedItems(topic);
  const max = Math.max(1, ...items.map(item => Number(item[topic.metric]) || 0));
  return `
    <section class="info-chart-card">
      <strong>${escapeHtml(topic.metricLabel || 'Ranking')}</strong>
      <div class="info-bars">
        ${items.map(item => {
          const value = Number(item[topic.metric]) || 0;
          return `<button data-info-pr="${escapeHtml(item.pr)}"><span>${escapeHtml(item.pr)}</span><i style="--w:${(value / max) * 100}%"></i><em>${escapeHtml(value)}</em></button>`;
        }).join('')}
      </div>
    </section>`;
}

function renderScoreCards(topic) {
  const items = sortedItems(topic);
  return `
    <section class="info-score-grid">
      ${items.map(item => `
        <button class="info-score-card" data-info-pr="${escapeHtml(item.pr)}">
          <strong>${escapeHtml(item.pr || item.title || '')}</strong>
          <span>${escapeHtml(item[topic.metric] ?? item.text ?? '')}</span>
          <em>${escapeHtml(item.sunriseDescription || item.sunsetDescription || item.note || '')}</em>
        </button>`).join('')}
    </section>`;
}

function renderRadar(topic) {
  const axes = ['distance', 'elevationGain', 'exposure', 'endurance', 'technicalDifficulty'];
  const labels = ['Distanz', 'Hoehe', 'Exposition', 'Ausdauer', 'Technik'];
  const items = topic.items.slice(0, 4);
  const size = 320;
  const center = 160;
  const radius = 112;
  return `
    <section class="info-chart-card">
      <strong>Radarvergleich</strong>
      <svg class="info-radar" viewBox="0 0 ${size} ${size}">
        ${[.25, .5, .75, 1].map(step => `<polygon points="${radarPoints(axes.map(() => step * 100), axes.length, center, radius)}"></polygon>`).join('')}
        ${labels.map((label, index) => {
          const point = polar(index, axes.length, center, radius + 22);
          return `<text x="${point.x}" y="${point.y}" text-anchor="middle">${label}</text>`;
        }).join('')}
        ${items.map((item, index) => `<path d="M ${radarPoints(axes.map(axis => Number(item[axis]) || 0), axes.length, center, radius)} Z" class="radar-line r${index}"></path>`).join('')}
      </svg>
      <div class="info-pr-chips">${items.map(item => prButton(item.pr)).join('')}</div>
    </section>`;
}

function renderLandscape(topic) {
  return `
    <section class="info-topic-list">
      ${topic.items.map(item => `
        <article class="info-landscape-card">
          <strong>${escapeHtml(item.type)}</strong>
          <p>${escapeHtml(item.description)}</p>
          <em>${escapeHtml(item.season)}</em>
          <div class="info-pr-chips">${(item.prs || []).map(prButton).join('')}</div>
        </article>`).join('')}
    </section>`;
}

function renderStatisticsTopic() {
  const prs = mode === 'all' ? (state.data?.prs || []) : filteredPrs();
  const stats = statsFor(prs);
  return `
    <section class="info-chart-card">
      <div class="info-mode">
        <button class="${mode === 'visible' ? 'active' : ''}" data-info-mode="visible">Sichtbar</button>
        <button class="${mode === 'all' ? 'active' : ''}" data-info-mode="all">Alle PRs</button>
      </div>
      <div class="info-kpi-grid">
        ${kpi('PRs', stats.count)}
        ${kpi('Kilometer', fmt(stats.km, ' km'))}
        ${kpi('Hoehenmeter', fmt(stats.hm, ' hm'))}
        ${kpi('Ø Dauer', fmt(stats.avgHours, ' h'))}
        ${kpi('Ø Anfahrt', fmt(stats.avgDriveMin, ' min'))}
        ${kpi('Ø km Fahrt', fmt(stats.avgDriveKm, ' km'))}
      </div>
      <div class="info-mini-bars">
        <strong>Schwierigkeit</strong>
        ${distributionBars(stats.difficulty)}
      </div>
      <div class="info-mini-bars">
        <strong>Status</strong>
        ${distributionBars(stats.status)}
      </div>
    </section>`;
}

function renderRanking(topic) {
  if (!topic.items?.length || topic.chart === 'landscape') return '';
  return `
    <section class="info-ranking">
      <strong>Ranking</strong>
      ${sortedItems(topic).map((item, index) => `
        <button data-info-pr="${escapeHtml(item.pr || '')}">
          <span>${index + 1}</span>
          <b>${escapeHtml(item.pr || item.title || item.type || '')}</b>
          <em>${escapeHtml(item.note || item.photoValue || item.mainWaterfall || item.bridgeType || '')}</em>
        </button>`).join('')}
    </section>`;
}

function renderPrLinks(topic) {
  const prs = uniquePrLabels(topic);
  if (!prs.length) return '';
  return `<section class="info-pr-links"><strong>Verlinkte PRs</strong><div>${prs.map(prButton).join('')}</div></section>`;
}

function prButton(label) {
  return `<button data-info-pr="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
}

function uniquePrLabels(topic) {
  const labels = [];
  (topic.items || []).forEach(item => {
    if (item.pr) labels.push(item.pr);
    (item.prs || []).forEach(pr => labels.push(pr));
  });
  return [...new Set(labels)];
}

function itemMentionsPr(item, normalizedPr) {
  if (normalizePrLabel(item.pr) === normalizedPr) return true;
  return (item.prs || []).some(label => normalizePrLabel(label) === normalizedPr);
}

function digestText(topic, item) {
  return item.note ||
    item.sunriseDescription ||
    item.sunsetDescription ||
    item.photoValue ||
    item.mainWaterfall ||
    item.bridgeType ||
    item.description ||
    item.text ||
    topic.lead ||
    '';
}

function digestValue(topic, item) {
  const metric = topic.metric;
  if (metric && item[metric] !== undefined) return `${topic.metricLabel || metric}: ${item[metric]}`;
  if (item.type) return item.type;
  return topic.category || '';
}

function sortedItems(topic) {
  const metric = topic.metric;
  return [...(topic.items || [])].sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0));
}

function statsFor(prs) {
  const count = prs.length || 1;
  return {
    count: prs.length,
    km: prs.reduce((sum, pr) => sum + (Number(pr.distanceKm) || Number(pr.track?.distanceKm) || 0), 0),
    hm: prs.reduce((sum, pr) => sum + (Number(pr.elevationGain) || 0), 0),
    avgHours: prs.reduce((sum, pr) => sum + ((durationToMinutes(pr.duration) || 0) / 60), 0) / count,
    avgDriveMin: prs.reduce((sum, pr) => sum + (Number(pr.driveMin) || 0), 0) / count,
    avgDriveKm: prs.reduce((sum, pr) => sum + (Number(pr.driveKm) || 0), 0) / count,
    difficulty: distribution(prs, 'difficulty'),
    status: prs.reduce((acc, pr) => {
      const label = prStatus(pr) || 'k.A.';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  };
}

function distribution(prs, key) {
  return prs.reduce((acc, pr) => {
    const label = pr[key] || 'k.A.';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function distributionBars(values) {
  const max = Math.max(1, ...Object.values(values));
  return Object.entries(values).map(([label, value]) => `<div><span>${escapeHtml(label)}</span><i style="--w:${(value / max) * 100}%"></i><em>${value}</em></div>`).join('');
}

function kpi(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function radarPoints(values, count, center, radius) {
  return values.map((value, index) => {
    const point = polar(index, count, center, radius * Math.max(0, Math.min(100, value)) / 100);
    return `${point.x},${point.y}`;
  }).join(' ');
}

function polar(index, count, center, radius) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index / count);
  return {
    x: Math.round((center + Math.cos(angle) * radius) * 10) / 10,
    y: Math.round((center + Math.sin(angle) * radius) * 10) / 10
  };
}

function findPrByLabel(label) {
  const normalized = normalizePrLabel(label);
  return (state.data?.prs || []).find(pr => normalizePrLabel(pr.displayId) === normalized);
}

function normalizePrLabel(label) {
  return String(label || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function fmt(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '-' : `${String(Math.round(Number(value) * 10) / 10).replace('.', ',')}${suffix}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
