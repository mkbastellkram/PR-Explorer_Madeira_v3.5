export const photoGuideTopics = [
  {
    id: 'sunrise',
    category: 'photo',
    title: 'Sonnenaufgang',
    lead: 'Fruehe Routen mit starkem Licht, Bergsilhouetten und klarer Blickrichtung.',
    chart: 'cards',
    metric: 'sunriseScore',
    metricLabel: 'Score',
    explanation: 'Sonnenaufgang eignet sich vor allem fuer hoeher gelegene oder oestlich offene Standorte. Wind und Wolkenbasis bleiben entscheidend.',
    items: [
      { pr: 'PR 1', sunriseScore: 98, sunriseDescription: 'Zentralmassiv, Grate, Wolkenmeer und sehr starke Tiefenwirkung.' },
      { pr: 'PR 8', sunriseScore: 87, sunriseDescription: 'Kuestenlicht und offene Ostwirkung.' },
      { pr: 'PR 1.2', sunriseScore: 82, sunriseDescription: 'Pico-Ruivo-Umfeld mit kurzer Zustiegslogik.' }
    ]
  },
  {
    id: 'sunset',
    category: 'photo',
    title: 'Sonnenuntergang',
    lead: 'Routen mit westlicher Lichtwirkung und guter Spaetlicht-Stimmung.',
    chart: 'cards',
    metric: 'sunsetScore',
    metricLabel: 'Score',
    explanation: 'Sonnenuntergang ist stark von Rueckweg, Fahrzeit und Sperrstatus abhaengig. Nur mit genug Zeitpuffer planen.',
    items: [
      { pr: 'PR 1.2', sunsetScore: 91, sunsetDescription: 'Kurzer Gipfelbezug, starke Spaetlicht-Chance.' },
      { pr: 'PR 13', sunsetScore: 84, sunsetDescription: 'Hoehenlage und Waldkante.' },
      { pr: 'PR 8', sunsetScore: 78, sunsetDescription: 'Kuestenmotiv mit einfachem Bildaufbau.' }
    ]
  },
  {
    id: 'golden-hour',
    category: 'photo',
    title: 'Goldene Stunde',
    lead: 'Warme Lichtfenster fuer Landschaft, Personen und Details.',
    chart: 'cards',
    metric: 'goldenHourScore',
    metricLabel: 'Score',
    explanation: 'Goldene Stunde ist besonders stark auf Wegen mit offener Sicht, Kuestenkanten oder Hochlagen.',
    items: [
      { pr: 'PR 1', goldenHourScore: 96 },
      { pr: 'PR 8', goldenHourScore: 88 },
      { pr: 'PR 6', goldenHourScore: 76 }
    ]
  },
  {
    id: 'blue-hour',
    category: 'photo',
    title: 'Blue Hour',
    lead: 'Kuehle Lichtstimmung fuer Silhouetten, Kueste und ruhige Szenen.',
    chart: 'cards',
    metric: 'blueHourScore',
    metricLabel: 'Score',
    explanation: 'Blue Hour verlangt sichere Rueckkehrlogik. Fuer lange Levada-Touren nur mit konservativem Zeitplan.',
    items: [
      { pr: 'PR 1.2', blueHourScore: 82 },
      { pr: 'PR 8', blueHourScore: 80 },
      { pr: 'PR 7', blueHourScore: 64 }
    ]
  }
];
