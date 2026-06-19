export const rankingTopics = [
  {
    id: 'tunnels',
    category: 'tunnels',
    title: 'Tunnel-Ranking',
    lead: 'PRs mit Tunnelpassagen, Stirnlampenbedarf und besonderem Erlebniswert.',
    chart: 'bar',
    metric: 'tunnelCount',
    metricLabel: 'Tunnel',
    explanation: 'Tunnel sind auf Madeira oft ein Planungsfaktor: Licht, Bodenfeuchte und Gegenverkehr koennen den Charakter einer Tour deutlich veraendern.',
    items: [
      { pr: 'PR 9', tunnelCount: 4, longestTunnel: 'lang', flashlightRequired: true, note: 'Levada-Klassiker mit mehreren dunklen Abschnitten.' },
      { pr: 'PR 16', tunnelCount: 3, longestTunnel: 'mittel', flashlightRequired: true, note: 'Tunnel und feuchte Passagen im Levada-Kontext.' },
      { pr: 'PR 1', tunnelCount: 2, longestTunnel: 'kurz', flashlightRequired: true, note: 'Hochgebirgstunnel mit starkem Kontrastwechsel.' },
      { pr: 'PR 17', tunnelCount: 1, longestTunnel: 'kurz', flashlightRequired: false, note: 'Tunnel als Nebenmerkmal.' }
    ]
  },
  {
    id: 'waterfalls',
    category: 'waterfalls',
    title: 'Wasserfall-Wert',
    lead: 'Touren mit starkem Wasser-, Levada- und Fotocharakter.',
    chart: 'bar',
    metric: 'waterfallRating',
    metricLabel: 'Fotowert',
    explanation: 'Der Wasserfall-Wert ist ein redaktioneller Startwert und kann spaeter mit echten POI-Daten verknuepft werden.',
    items: [
      { pr: 'PR 9', waterfallCount: 3, waterfallRating: 95, mainWaterfall: 'Caldeirao Verde', photoValue: 'sehr hoch' },
      { pr: 'PR 6', waterfallCount: 2, waterfallRating: 88, mainWaterfall: '25 Fontes', photoValue: 'sehr hoch' },
      { pr: 'PR 7', waterfallCount: 1, waterfallRating: 72, mainWaterfall: 'Levada do Moinho', photoValue: 'hoch' },
      { pr: 'PR 16', waterfallCount: 1, waterfallRating: 68, mainWaterfall: 'Levada-Abschnitt', photoValue: 'mittel' }
    ]
  },
  {
    id: 'bridges',
    category: 'bridges',
    title: 'Bruecken & Stege',
    lead: 'Routen mit Bruecken, Stegen und ausgesetzten Uebergaengen.',
    chart: 'bar',
    metric: 'bridgeCount',
    metricLabel: 'Bruecken',
    explanation: 'Brueckentypen helfen bei Foto-, Komfort- und Hoehenangst-Planung. Die Werte sind als Datenmodell vorbereitet.',
    items: [
      { pr: 'PR 1', bridgeCount: 3, bridgeType: 'Metall', note: 'Hochgebirgsstege und Sicherungen.' },
      { pr: 'PR 9', bridgeCount: 2, bridgeType: 'Beton', note: 'Levada-Querungen.' },
      { pr: 'PR 6', bridgeCount: 2, bridgeType: 'Holz', note: 'Wald- und Wasserpassagen.' },
      { pr: 'PR 13', bridgeCount: 1, bridgeType: 'Beton', note: 'Kleinerer Uebergang.' }
    ]
  },
  {
    id: 'calories',
    category: 'fitness',
    title: 'Kalorien-Schaetzung',
    lead: 'Grobe Orientierung fuer lange, steile und zeitintensive PRs.',
    chart: 'bar',
    metric: 'estimatedCalories',
    metricLabel: 'kcal',
    explanation: 'Die Kalorienwerte sind bewusst nur Schaetzwerte. Spaeter koennen Koerpergewicht, Gepaeck und Wetter als Faktoren hinzukommen.',
    items: [
      { pr: 'PR 1.1', estimatedCalories: 1120 },
      { pr: 'PR 2', estimatedCalories: 980 },
      { pr: 'PR 1.3', estimatedCalories: 940 },
      { pr: 'PR 17', estimatedCalories: 910 },
      { pr: 'PR 6', estimatedCalories: 650 }
    ]
  }
];
