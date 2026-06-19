export const statisticTopics = [
  {
    id: 'selection-statistics',
    category: 'statistics',
    title: 'Aktuelle Auswahl analysieren',
    lead: 'Live-Statistik fuer alle PRs oder die aktuell sichtbare Filterauswahl.',
    chart: 'statistics',
    explanation: 'Diese Seite wird direkt aus der geladenen PR-Datenbank berechnet. Sie laedt keine GPX- oder KML-Dateien nach.',
    items: []
  },
  {
    id: 'difficulty-radar',
    category: 'fitness',
    title: 'Schwierigkeit vergleichen',
    lead: 'Distanz, Hoehenmeter, Ausdauer, Exposition und Technik als Radarprofil.',
    chart: 'radar',
    explanation: 'Das Radarprofil ist als Vergleichsmodell vorbereitet. Exposition, Ausdauer und Technik koennen spaeter redaktionell gepflegt werden.',
    items: [
      { pr: 'PR 1', distance: 78, elevationGain: 42, exposure: 95, endurance: 80, technicalDifficulty: 90 },
      { pr: 'PR 1.1', distance: 70, elevationGain: 98, exposure: 58, endurance: 86, technicalDifficulty: 62 },
      { pr: 'PR 6', distance: 42, elevationGain: 35, exposure: 28, endurance: 48, technicalDifficulty: 35 },
      { pr: 'PR 17', distance: 88, elevationGain: 62, exposure: 74, endurance: 92, technicalDifficulty: 78 }
    ]
  }
];

export const preparedStatisticFields = [
  'tunnelCount',
  'waterfallCount',
  'bridgeCount',
  'averageDriveMin',
  'averageDriveKm',
  'sunriseScore',
  'sunsetScore',
  'insta360Score'
];
