export const madeiraKnowledgeTopics = [
  {
    id: 'landscape-types',
    category: 'landscape',
    title: 'Landschaftstypen',
    lead: 'Hochgebirge, Lorbeerwald, Kueste, Wasserfall, Nebelwald und Vulkanlandschaft.',
    chart: 'landscape',
    explanation: 'Landschaftstypen helfen, Touren nicht nur nach Schwierigkeit, sondern nach Erlebnischarakter zu planen.',
    items: [
      { type: 'Hochgebirge', description: 'Grate, Wolkenmeer, Fels und starke Tiefenwirkung.', season: 'Frueh starten, stabile Wetterfenster', prs: ['PR 1', 'PR 1.2'] },
      { type: 'Lorbeerwald', description: 'Feuchte, gruene Levada- und Waldstimmung.', season: 'Ganzjaehrig, besonders nach Regen', prs: ['PR 9', 'PR 6', 'PR 13'] },
      { type: 'Kueste', description: 'Offene Linien, Meer, Wind und klare Horizonte.', season: 'Milde Tage mit wenig Wind', prs: ['PR 8'] },
      { type: 'Wasserfall', description: 'Levada-Wasser, Schluchten und Fotomotive.', season: 'Nach Regen, aber nur bei sicherer Lage', prs: ['PR 9', 'PR 6'] },
      { type: 'Nebelwald', description: 'Mystische Stimmung, diffuse Kontraste und viel Gruen.', season: 'Bei niedriger Wolkenbasis', prs: ['PR 13', 'PR 16'] },
      { type: 'Vulkanlandschaft', description: 'Fels, Hoehenlinien und raues Zentralmassiv.', season: 'Klare Sicht und wenig Wind', prs: ['PR 1'] }
    ]
  },
  {
    id: 'madeira-basics',
    category: 'knowledge',
    title: 'Madeira Wissen',
    lead: 'Planungswissen fuer Wetter, Zeitfenster, Hoehenlage und Fahrwege.',
    chart: 'cards',
    explanation: 'Madeira ist klein, aber topografisch komplex. Fahrzeit, Wolkenhoehe und Sperrstatus sind oft wichtiger als reine Kilometer.',
    items: [
      { title: 'Hoehenlage', text: 'Zwischen Kueste und Hochplateau koennen Wetter und Sicht komplett wechseln.' },
      { title: 'Levada-Logik', text: 'Levadawege wirken flach, koennen aber Tunnel, Enge und Feuchtigkeit enthalten.' },
      { title: 'Fahrzeit', text: 'Google-Zeiten sind Startwerte. Parken, Topografie und Verkehr brauchen Zuschlaege.' }
    ]
  }
];
