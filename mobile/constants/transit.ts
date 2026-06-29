// Naples public-transport reference for the "Getting Around" screen.
//
// Hours/prices verified June 2026 against the official operator sites (ANM,
// Trenitalia, EAV) — NOT written from memory. Every line links out to its
// official page so the user always has the authoritative, live timetable
// (schedules shift for holidays, maintenance and season). Keep that honesty:
// summarise the essentials here, defer to the official link for specifics.

export type TransitLine = {
  name: string;
  route: string;
  hours: string;
  freq?: string;
  note?: string;
  tag?: string;
  url: string; // official page = map + live times
  mapImage?: import('react-native').ImageSourcePropType; // official line map (metro lines)
};

export type TransitSection = {
  id: string;
  title: string;
  blurb: string;
  icon: string; // Ionicons name
  color: string;
  lines: TransitLine[];
};

// The full ANM network map (official PDF).
export const NETWORK_MAP_URL =
  'https://anmspa.my.salesforce.com/sfc/p/#7Q000003PMpH/a/R2000007WHWL/gcVBWumo9Jivw7dZYzJ09GMY4ZE4VhbClN5vbwweZqI';

// A clean schematic network map (Wikimedia Commons, CC-licensed) shown on the
// Getting Around screen. The official ANM PDF (NETWORK_MAP_URL) is one tap away.
export const NETWORK_MAP_IMG =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Napoli%20-%20mappa%20rete%20metropolitana%20(schematica%2C%20con%20linea%202).png';

export const transitIntro =
  'Naples runs on a mix of metro, hillside funiculars, regional trains, buses and the airport shuttle — most under the single UnicoCampania fare system. Here are the lines worth knowing, with the official map and live times one tap away.';

export const tickets = {
  title: 'Tickets & contactless',
  points: [
    'Single urban ticket €1.30 — one 90-minute journey across metro, funicular, bus & tram (one trip per rail line). Day pass €5.40.',
    'Tap & Go: on Metro Line 1, the Centrale & Chiaia funiculars, Alibus and EAV trains you can simply tap a contactless card (Visa, Mastercard, Amex, Maestro) at the gate — tap IN and tap OUT — and skip buying a ticket. It works out the right fare for you.',
    'Otherwise buy before boarding at a tabacchi (tobacconist), station machine or the ANM / UnicoCampania app, and validate on entry. Riding without a valid ticket is fined.',
  ],
  url: 'https://www2.anm.it/index.php?option=com_content&task=view&id=1344&Itemid=320',
};

export type AlertLinks = { intro: string; links: { label: string; url: string }[] };
export const alerts: AlertLinks = {
  intro:
    'Strikes (scioperi) and engineering works can suspend lines at short notice. Italian transit strikes are announced in advance and keep guaranteed service windows (fasce di garanzia) — usually early morning and late afternoon. Always check the day you travel.',
  links: [
    { label: 'ANM — metro, funiculars & buses', url: 'https://www.anm.it/s/notizia-home/Notizia_Home__c/Default?language=en_US' },
    { label: 'EAV — Circumvesuviana, Cumana & Circumflegrea', url: 'https://www.eavsrl.it/' },
    { label: 'Trenitalia — regional rail (Line 2)', url: 'https://www.trenitalia.com/it/regionale/campania.html' },
  ],
};

export type FerryPort = { name: string; desc: string; routes: string; operators: string };
export const ferries = {
  intro:
    'Naples is the gateway to the bay islands and the coast. Which port you leave from depends on where you\'re going and whether you want a fast hydrofoil (aliscafo, passengers only) or a slower car ferry (traghetto).',
  ports: [
    {
      name: 'Molo Beverello — Naples',
      desc: 'The main passenger hub, right by the centre. Fast hydrofoils.',
      routes: 'Capri, Ischia, Procida, Sorrento — plus seasonal runs to the Amalfi Coast (Positano, Amalfi).',
      operators: 'SNAV · NLG · Alilauro · Caremar',
    },
    {
      name: 'Calata Porta di Massa — Naples',
      desc: 'Just east of Beverello. Slower, cheaper car ferries that also take vehicles.',
      routes: 'Ischia & Procida.',
      operators: 'Caremar · Medmar',
    },
    {
      name: 'Mergellina — Naples',
      desc: 'Smaller port to the west; summer long-distance departures.',
      routes: 'Aeolian Islands (Lipari, Vulcano, Salina, Panarea, Stromboli) in summer; some Capri & Procida runs.',
      operators: 'SNAV · Alilauro',
    },
    {
      name: 'Pozzuoli',
      desc: 'West of the city (Metro Line 2 / Cumana) — the shortest crossing to the nearer islands.',
      routes: 'Procida & Ischia (Casamicciola).',
      operators: 'Caremar · Medmar',
    },
  ] as FerryPort[],
  crossings: [
    { to: 'Capri', time: '~50 min by hydrofoil' },
    { to: 'Ischia', time: '~50–90 min' },
    { to: 'Procida', time: '~40 min (≈25 from Pozzuoli)' },
    { to: 'Sorrento', time: '~40 min' },
  ],
  note:
    'Schedules are seasonal and change often — far more frequent April–October, reduced in winter, and weather can cancel hydrofoils. Book ahead in summer and always check live times before you go.',
  links: [
    { label: 'Ferryhopper — compare & book', url: 'https://www.ferryhopper.com/en/ferries/italy' },
    { label: 'Caremar', url: 'https://www.caremar.it/' },
    { label: 'SNAV', url: 'https://www.snav.it/' },
    { label: 'Alilauro', url: 'https://www.alilauro.it/' },
  ],
};

export const taxis = {
  intro:
    'Naples taxis are white, metered and marked with the city logo. Use an official rank (airport, stations, main piazzas) or an app — never go with someone who approaches you offering a ride.',
  tips: [
    'Insist on the meter (tassametro). For the airport, port and other set routes, agree the fixed city rate (tariffa predeterminata) before you set off.',
    'Fixed airport fares run roughly €23–25 to the centre, Central station and the seafront, a little more to the port — confirm your destination is on the fixed-rate list.',
    'Expect small supplements for nights, holidays and luggage. Carry some cash — not every driver takes cards.',
  ],
  apps: [
    { name: 'FreeNow', desc: 'The most widely used app for hailing licensed white taxis in Naples.' },
    { name: 'itTaxi / appTaxi', desc: 'Nationwide taxi-booking apps that also cover Naples.' },
    { name: 'Uber', desc: 'Limited here — it only requests licensed taxis and is often slow to find one. FreeNow is the more reliable choice.' },
  ],
};

export const transitSections: TransitSection[] = [
  {
    id: 'metro',
    title: 'Metro',
    blurb: 'The fastest way across the city — and Line 1 is a sight in itself.',
    icon: 'subway',
    color: '#C8392B',
    lines: [
      {
        name: 'Line 1',
        tag: 'Most useful',
        route: 'Piscinola ↔ Garibaldi (Central station), via Museo, Dante, Toledo, Municipio & Vanvitelli (Vomero).',
        hours: 'First ~6:00 · Sun–Thu last ~23:00 · Fri–Sat last ~01:30',
        freq: 'Every 6–8 min at peak, 10–12 off-peak, ~15 after 21:00',
        note: 'The "Art stations" line — Toledo is one of Europe\'s most beautiful metro stops. Links the hill, the centre and the main rail station.',
        url: 'https://www.anm.it/s/linea-anm/a0YR200000TerNTMAZ/l1',
        mapImage: require('@/assets/images/lines/line1.png'),
      },
      {
        name: 'Line 2',
        route: 'Gianturco ↔ Pozzuoli, via Garibaldi, Cavour, Montesanto, Amedeo, Mergellina & Campi Flegrei.',
        hours: 'Daily ~5:00–23:00',
        freq: 'Every ~8–10 min on weekdays',
        note: 'Run by Trenitalia (it\'s regional rail used as a metro). Handy west toward Mergellina and the Phlegraean coast.',
        url: 'https://www.trenitalia.com/it/regionale/campania/metro-napoli.html',
        mapImage: require('@/assets/images/lines/line2.jpeg'),
      },
      {
        name: 'Line 6',
        tag: 'Limited hours',
        route: 'Mostra (Fuorigrotta) ↔ Municipio, via Mergellina & Chiaia. 8 stops, 16 min end to end.',
        hours: 'Mon–Fri 7:10–21:10 · Sat–Sun 7:10–14:50 only',
        freq: 'Every ~14 min',
        note: 'Newest line (2024). Useful along the seafront, but check the early weekend close.',
        url: 'https://www.anm.it/s/linea-anm/a0YR200000FxeqbMAB/l6',
        mapImage: require('@/assets/images/lines/line6.png'),
      },
    ],
  },
  {
    id: 'funicular',
    title: 'Funiculars',
    blurb: 'Four historic cable railways that climb from the lower city up to Vomero and the hills — a Naples institution.',
    icon: 'trending-up',
    color: '#C79A2E',
    lines: [
      {
        name: 'Centrale',
        tag: 'Busiest',
        route: 'Augusteo (by Via Toledo) ↔ Fuga (Vomero).',
        hours: 'Daily from 7:00 · last car Mon–Tue 22:30, Wed–Thu & Sun 00:30, Fri–Sat 02:00',
        freq: 'Every ~10 min',
        note: 'The main one, and the only funicular running late at night. Quickest hop up to Vomero from the centre.',
        url: 'https://www.anm.it/s/linea-anm/a0Y7Q000007MPl3UAG/funicolare-centrale',
      },
      {
        name: 'Chiaia',
        route: 'Parco Margherita ↔ Cimarosa (Vomero).',
        hours: '7:00–22:00 daily',
        freq: 'Every ~10 min',
        url: 'https://www.anm.it/s/linea-anm/a0Y7Q000007MPlLUAW/funicolare-chiaia',
      },
      {
        name: 'Montesanto',
        route: 'Montesanto ↔ Morghen (Vomero).',
        hours: '7:00–22:00 daily',
        freq: 'Every ~10 min',
        note: 'Connects to the Cumana train and Line 2 at Montesanto.',
        url: 'https://www.anm.it/s/linea-anm/a0Y7Q000007MPlNUAW/funicolare-montesanto',
      },
      {
        name: 'Mergellina',
        route: 'Mergellina ↔ Manzoni (Posillipo).',
        hours: '7:00–22:00 daily',
        freq: 'Every ~10 min',
        note: 'Climbs to Posillipo for the panoramic viewpoints.',
        url: 'https://www.anm.it/s/linea-anm/a0Y7Q000007MPlMUAW/funicolare-mergellina',
      },
    ],
  },
  {
    id: 'regional',
    title: 'Regional trains (EAV)',
    blurb: 'How you reach the famous day trips. Tickets are separate and timetables change by season — check before you go.',
    icon: 'train',
    color: '#3E8E6B',
    lines: [
      {
        name: 'Circumvesuviana',
        tag: 'Day trips',
        route: 'Naples (Garibaldi / Porta Nolana) → Ercolano → Pompei Scavi → Sorrento.',
        hours: 'Roughly 6:00–22:00, seasonal',
        note: 'The line for Herculaneum, Pompeii and Sorrento. Get off at "Pompei Scavi – Villa dei Misteri" for the ruins. Often crowded — keep an eye on your bags.',
        url: 'https://www.eavsrl.it/orari-linee-ferroviarie/',
      },
      {
        name: 'Cumana & Circumflegrea',
        route: 'From Montesanto out to the Phlegraean Fields — Pozzuoli, Cuma & Torregaveta.',
        hours: 'Roughly 6:00–22:00, seasonal',
        note: 'For Pozzuoli\'s volcanic Solfatara, the Flavian Amphitheatre and the western coast.',
        url: 'https://www.eavsrl.it/orari-linee-ferroviarie/',
      },
    ],
  },
  {
    id: 'airport',
    title: 'To & from the airport',
    blurb: 'Capodichino airport sits close to the city — here\'s the public link until the metro reaches it.',
    icon: 'airplane',
    color: '#7B5EA7',
    lines: [
      {
        name: 'Alibus',
        tag: '€5',
        route: 'Airport ↔ Piazza Garibaldi (Central station) ↔ Port (Molo Beverello, for island ferries).',
        hours: '5:30–00:00',
        freq: 'Every 15–25 min',
        note: '€5 ticket, valid 90 min and includes an onward urban ride. ~15–20 min to Garibaldi, ~30–35 to the port. A Metro Line 1 airport stop is due to open around 2026–27.',
        url: 'https://www.anm.it/s/alibus?language=it',
      },
    ],
  },
  {
    id: 'bus',
    title: 'Buses & trams',
    blurb: 'Fill the gaps the rail network misses — the waterfront, the hills, the smaller streets.',
    icon: 'bus',
    color: '#1C7C9C',
    lines: [
      {
        name: 'ANM bus & tram network',
        route: 'Citywide, on the same €1.30 urban ticket.',
        hours: 'Varies by line',
        note: 'Great for short hops, but traffic is heavy and stops aren\'t always obvious — most newcomers lean on the metro and funiculars first. Google Maps or Moovit give live, door-to-door routing.',
        url: 'https://www.anm.it/s/paginainterscambi?type=interscambi-bus-metro&language=it',
      },
    ],
  },
];

export type InfoLink = { label: string; desc: string; url: string };

export const goodToKnow: InfoLink[] = [
  {
    label: 'Don\'t drive in the centre (ZTL)',
    desc: 'The historic core is a Limited Traffic Zone — cameras fine non-permit cars automatically.',
    url: 'https://www.anm.it/s/sportelloztl?language=it',
  },
  {
    label: 'Blue-line parking',
    desc: 'Blue street lines = paid parking; pay at the meter or via app before you leave the car.',
    url: 'https://www.anm.it/s/strisceblueticket?language=it',
  },
  {
    label: 'Interchange hubs',
    desc: 'Garibaldi links everything; Montesanto joins the Cumana, Line 2 & a funicular; Municipio connects Line 1, Line 6 & the port.',
    url: 'https://www.anm.it/s/nodi-di-scambio?language=it',
  },
  {
    label: 'Accessibility & lifts',
    desc: 'Lines 1 and 6 are step-free; many funicular and metro stations have lifts, older lines fewer.',
    url: 'https://www.anm.it/s/accessibilita-della-rete?language=it',
  },
];
