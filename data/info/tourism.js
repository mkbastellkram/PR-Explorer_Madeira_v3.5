export const tourismTopics = [
  {
    id: 'crowd-level',
    category: 'tourism',
    title: 'Touristische Belastung',
    lead: 'PRs nach erwarteter Besucherintensitaet fuer ruhigere Planung.',
    chart: 'heat-ranking',
    metric: 'crowdLevel',
    metricLabel: 'Crowd',
    explanation: 'Crowd Level 1 ist ruhig, 5 ist sehr stark frequentiert. Die Werte sind Startwerte und koennen spaeter saisonal werden.',
    items: [
      { pr: 'PR 1', crowdLevel: 5, note: 'Sehr bekanntes Hochgebirgsziel.' },
      { pr: 'PR 6', crowdLevel: 5, note: 'Klassiker mit hoher touristischer Nachfrage.' },
      { pr: 'PR 9', crowdLevel: 4, note: 'Sehr attraktiv, besonders bei stabilem Wetter.' },
      { pr: 'PR 8', crowdLevel: 3, note: 'Beliebt, aber raeumlich besser verteilbar.' },
      { pr: 'PR 13', crowdLevel: 2, note: 'Ruhigerer Waldcharakter.' }
    ]
  }
];
