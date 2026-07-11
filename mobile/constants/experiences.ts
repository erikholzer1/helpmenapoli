import { type ImageSourcePropType } from 'react-native';

// ─── Booking model ────────────────────────────────────────────────────────────

export type FixedDate = {
  label: string;
  iso: string;
  spotsLeft?: number;
  description?: string;
  whatsappGroup?: string; // https://chat.whatsapp.com/... — tap = join group
};

export type SelectField = { id: string; label: string; type: 'select'; options: string[]; required?: boolean };
export type NumberField = { id: string; label: string; type: 'number'; min?: number; max?: number; required?: boolean };
export type TextField  = { id: string; label: string; type: 'text'; placeholder?: string; required?: boolean };
export type BookingField = SelectField | NumberField | TextField;

export type BookingConfig =
  | { type: 'rsvp';    fixedDates: FixedDate[]; stayCuned?: boolean; hasPrivate?: boolean; privateFields?: BookingField[]; extraRequestFields?: BookingField[] }
  | { type: 'inquiry'; fields: BookingField[] }
  | { type: 'hybrid';  fixedDates: FixedDate[]; stayCuned?: boolean; privateFields: BookingField[]; extraRequestFields?: BookingField[] };

export type Experience = {
  id: string;
  title: string;
  tagline: string;
  image: ImageSourcePropType;
  booking: BookingConfig;
};

// ─── Shared request-a-date fields (added automatically) ──────────────────────
export const REQUEST_DATE_FIELDS: BookingField[] = [
  { id: 'req_name',   label: 'Your name', type: 'text', placeholder: 'First name is fine', required: true },
  { id: 'req_date',   label: 'Preferred date(s)', type: 'text', placeholder: 'e.g. 20 July, any Saturday in August', required: true },
  { id: 'req_time',   label: 'Preferred time', type: 'text', placeholder: 'e.g. morning, 10am — leave blank if flexible' },
  { id: 'req_people', label: 'Number of people', type: 'number', min: 1, max: 30, required: true },
  { id: 'req_note',   label: 'Anything else?', type: 'text', placeholder: 'Optional — dietary needs, questions…' },
];

// ─── Experiences ──────────────────────────────────────────────────────────────

export const experiences: Experience[] = [

  {
    id: 'boat',
    title: 'Boat Day — Capri & Beyond',
    tagline: 'A day on the bay, the coast at your pace.',
    image: require('@/assets/images/experiences/boat-capri.png'),
    booking: {
      type: 'hybrid',
      fixedDates: [
        {
          label: 'Sunday 12 July — Capri cruise',
          iso: '2026-07-12',
          spotsLeft: 27,
          description: 'Departing Torre Annunziata — full day cruising around Capri. Food & drinks included.',
          whatsappGroup: 'https://chat.whatsapp.com/LjMzGsNBfQUKsq6y9HoU27?s=cl&p=i&ilr=4',
        },
      ],
      privateFields: [
        { id: 'date',        label: 'Preferred date(s)', type: 'text', placeholder: 'e.g. 20 July or flexible', required: true },
        { id: 'people',      label: 'Number of people', type: 'number', min: 1, max: 27, required: true },
        { id: 'duration',    label: 'Trip duration', type: 'select', options: ['Half day (4h)', 'Full day (8h)', 'Sunset (2–3h)', 'Multi-day'], required: true },
        { id: 'destination', label: 'Where would you like to go?', type: 'select', options: ['Bay of Naples', 'Amalfi Coast', 'Capri', 'Ischia', 'Procida', 'Surprise me!'] },
        { id: 'boat_type',   label: 'Boat preference', type: 'select', options: ['No preference', 'Sailboat', 'Motorboat', 'RIB / speedboat', 'Luxury yacht'] },
        { id: 'captain',     label: 'Captain', type: 'select', options: ['With captain (recommended)', 'Self-skippered (licence required)'], required: true },
        { id: 'extras',      label: 'Any extras or special requests?', type: 'text', placeholder: 'e.g. snorkelling gear, catering, sunset drinks…' },
      ],
    },
  },

  {
    id: 'cheese-wine',
    title: 'Cheese & Wine Tasting',
    tagline: 'Learn about Italian cheeses — how to use them and how to pair them with wine.',
    image: require('@/assets/images/experiences/cheese-wine.jpeg'),
    booking: {
      type: 'hybrid',
      fixedDates: [],
      stayCuned: true,
      privateFields: [
        { id: 'date',    label: 'Preferred date', type: 'text', placeholder: 'e.g. any Thursday in August', required: true },
        { id: 'people',  label: 'Number of people', type: 'number', min: 2, max: 20, required: true },
        { id: 'dietary', label: 'Dietary restrictions?', type: 'text', placeholder: 'e.g. lactose-free, vegan…' },
      ],
    },
  },

  {
    id: 'cooking',
    title: 'Neapolitan Cooking Class',
    tagline: 'Cook a true Neapolitan meal — then eat it.',
    image: require('@/assets/images/experiences/cooking.jpeg'),
    booking: {
      type: 'inquiry',
      fields: [
        { id: 'date',    label: 'Preferred date', type: 'text', placeholder: 'e.g. any Friday in August', required: true },
        { id: 'people',  label: 'Number of people', type: 'number', min: 2, max: 14, required: true },
        { id: 'dietary', label: 'Dietary restrictions?', type: 'text', placeholder: 'e.g. vegetarian, gluten-free…' },
      ],
    },
  },

  {
    id: 'walking-tour',
    title: 'Naples Walking & Food Tour',
    tagline: 'Wander the old city and taste it as you go.',
    image: require('@/assets/images/experiences/walking-tour.jpeg'),
    booking: {
      type: 'inquiry',
      fields: [
        { id: 'date',      label: 'Preferred date', type: 'text', placeholder: 'e.g. 10 July, flexible on weekdays', required: true },
        { id: 'time',      label: 'Preferred time', type: 'text', placeholder: 'e.g. morning, 10am — leave blank if flexible' },
        { id: 'people',    label: 'Number of people', type: 'number', min: 1, max: 20, required: true },
        { id: 'tour_type', label: 'What kind of tour?', type: 'select', options: ['Mix of both', 'Walking only (castles, churches, landmarks)', 'Food tour only'], required: true },
        { id: 'hours',     label: 'How many hours?', type: 'select', options: ['2–3 hours', 'Half day (4h)', 'Full day (6–8h)'], required: true },
        { id: 'focus',     label: 'Any focus areas?', type: 'text', placeholder: 'e.g. Spaccanapoli, street food, specific landmarks…' },
      ],
    },
  },

  {
    id: 'hiking',
    title: 'Hiking Excursions',
    tagline: 'Trails above the coast and the islands.',
    image: require('@/assets/images/experiences/hiking.jpeg'),
    booking: {
      type: 'hybrid',
      fixedDates: [],
      stayCuned: true,
      extraRequestFields: [
        { id: 'req_fitness', label: 'Hiking level', type: 'select', options: ['Easy pace', 'Moderate', 'Challenging'], required: true },
      ],
      privateFields: [
        { id: 'date',    label: 'Preferred date(s)', type: 'text', placeholder: 'e.g. any weekend in August', required: true },
        { id: 'time',    label: 'Preferred time', type: 'text', placeholder: 'e.g. morning start — leave blank if flexible' },
        { id: 'people',  label: 'Number of people', type: 'number', min: 1, max: 15, required: true },
        { id: 'trail',   label: 'Trail preference', type: 'select', options: ['Vesuvius', 'Sentiero degli Dei', 'Monte Faito', 'Ischia', 'Surprise me!'] },
        { id: 'fitness', label: 'Fitness level', type: 'select', options: ['Easy pace', 'Moderate', 'Challenging'], required: true },
        { id: 'notes',   label: 'Anything else?', type: 'text', placeholder: 'e.g. kids, accessibility needs…' },
      ],
    },
  },

  {
    id: 'fishing',
    title: 'Fishing Charter',
    tagline: 'Head out on the water with local fishermen.',
    image: require('@/assets/images/experiences/fishing.webp'),
    booking: {
      type: 'inquiry',
      fields: [
        { id: 'date',       label: 'Preferred date(s)', type: 'text', placeholder: 'e.g. early July, flexible', required: true },
        { id: 'time',       label: 'Preferred time', type: 'text', placeholder: 'e.g. early morning — leave blank if flexible' },
        { id: 'people',     label: 'Number of people', type: 'number', min: 1, max: 4, required: true },
        { id: 'experience', label: 'Fishing experience', type: 'select', options: ['First time', 'Occasional', 'Experienced'], required: true },
        { id: 'notes',      label: 'Anything else?', type: 'text', placeholder: 'e.g. kids coming, seasickness concerns…' },
      ],
    },
  },

  {
    id: 'bread',
    title: 'Bread Classes',
    tagline: 'Sourdough & focaccia, from starter to bake.',
    image: require('@/assets/images/experiences/bread.jpeg'),
    booking: {
      type: 'hybrid',
      fixedDates: [],
      stayCuned: true,
      privateFields: [
        { id: 'date',   label: 'Preferred date', type: 'text', placeholder: 'e.g. any weekend in July', required: true },
        { id: 'people', label: 'Number of people', type: 'number', min: 1, max: 12, required: true },
        { id: 'focus',  label: 'Sourdough, focaccia, or both?', type: 'select', options: ['Both', 'Sourdough only', 'Focaccia only'] },
      ],
    },
  },

  {
    id: 'italian',
    title: 'Italian Language Class',
    tagline: 'Real, usable Italian with a local — 4-week courses.',
    image: require('@/assets/images/experiences/italian.jpeg'),
    booking: {
      type: 'hybrid',
      fixedDates: [],
      stayCuned: true,
      privateFields: [
        { id: 'course',  label: 'Which course?', type: 'select', options: ['Interactive Italian (conversational)', 'Grammar course (structured)', 'Not sure — advise me'], required: true },
        { id: 'date',    label: 'Preferred start date', type: 'text', placeholder: 'e.g. first week of August', required: true },
        { id: 'people',  label: 'Number of people', type: 'number', min: 1, max: 10, required: true },
        { id: 'level',   label: 'Italian level', type: 'select', options: ['Complete beginner', 'Some basics', 'Intermediate'], required: true },
        { id: 'schedule', label: 'Preferred schedule', type: 'text', placeholder: 'e.g. weekday mornings, flexible' },
      ],
    },
  },

  {
    id: 'custom',
    title: 'Customize Your Own Experience',
    tagline: "Tell me what you're after — we'll build it together.",
    image: require('@/assets/images/experiences/custom.jpeg'),
    booking: {
      type: 'inquiry',
      fields: [
        { id: 'event_type', label: 'What type of experience?', type: 'text', placeholder: 'e.g. food tour, sunset cruise, cooking + dining…', required: true },
        { id: 'date',       label: 'What dates would work best for you?', type: 'text', placeholder: 'e.g. 10–17 July, flexible on weekends', required: true },
        { id: 'hours',      label: 'How many hours?', type: 'select', options: ['2–3 hours', 'Half day (4h)', 'Full day (8h)', 'Multiple days', 'Flexible'], required: true },
        { id: 'people',     label: 'Number of people', type: 'number', min: 1, max: 50, required: true },
        { id: 'budget',     label: 'Budget per person (rough)', type: 'select', options: ['Under €50', '€50–100', '€100–200', 'Flexible / let\'s talk'] },
        { id: 'idea',       label: 'Describe your ideal experience', type: 'text', placeholder: 'Vibe, interests, anything special…', required: true },
      ],
    },
  },

];

export const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/EmxgA1r5wha5nWdiMjJzyR';

// ─── Partner (affiliate) experiences ─────────────────────────────────────────
// GetYourGuide tours with Erik's partner tag. These are NOT led by Erik — the
// app shows them in a separate section with a clear disclosure, and tapping
// one opens GetYourGuide directly (no BookingSheet, no WhatsApp).

export type AffiliateExperience = {
  id: string;
  title: string;
  tagline: string;
  image: ImageSourcePropType;
  url: string;
};

export const affiliateExperiences: AffiliateExperience[] = [
  {
    id: 'aff-pompeii',
    title: 'Pompeii VIP: Skip the Line',
    tagline: 'Tour the ruins with a real archaeologist — skip-the-line entry included.',
    image: require('@/assets/images/top10/daytrips.webp'),
    url: 'https://www.getyourguide.com/pompei-campania-l156880/pompeii-vip-skip-the-line-with-your-archaeologist-t301893/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-historic-center',
    title: 'Historic Center: Gothic & Baroque',
    tagline: 'Naples old town walking tour with Veiled Christ entry tickets.',
    image: require('@/assets/images/top10/museums.jpg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-historic-center-tour-veiled-christ-entry-tickets-t486218/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-pizza',
    title: 'Pizza-Making Workshop',
    tagline: 'Private class with drinks & appetizers — stretch, top and fire a true Neapolitan pizza.',
    image: require('@/assets/images/top10/pizzerias.webp'),
    url: 'https://www.getyourguide.com/naples-l162/private-pizza-making-workshop-with-drink-and-appetizers-t765797/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-capri-yacht',
    title: 'Luxury Capri Boat Trip',
    tagline: 'Cruise to Capri in style — private luxury boat from Naples.',
    image: require('@/assets/images/experiences/boat-capri.png'),
    url: 'https://www.getyourguide.com/naples-l162/naples-luxury-capri-boat-trip-t655099/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-ischia-boat',
    title: 'Ischia Boat Tour',
    tagline: 'Circle the green island with a local lunch and swimming stops.',
    image: require('@/assets/images/experiences/boat.jpeg'),
    url: 'https://www.getyourguide.com/forio-l164626/forio-ischia-island-boat-tour-with-local-lunch-and-swimming-t426615/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-blue-grotto',
    title: 'Capri, Anacapri & the Blue Grotto',
    tagline: 'Small-group day trip from Naples — the island top to bottom.',
    image: require('@/assets/images/experiences/boat-capri.png'),
    url: 'https://www.getyourguide.com/naples-l162/blue-grotto-capri-and-anacapri-small-group-tour-from-naples-t548902/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-capri-swim',
    title: 'Capri Boat Tour with Swimming',
    tagline: 'Small-group cruise around the island — swim stops and drinks on board.',
    image: require('@/assets/images/experiences/boat.jpeg'),
    url: 'https://www.getyourguide.com/capri-l693/naples-capri-exclusive-boat-tour-with-swim-small-group-t50408/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-baia-scuba',
    title: 'Baia Underwater Park: Scuba Dive',
    tagline: 'Beginner-friendly dive over the sunken Roman ruins of Baia.',
    image: require('@/assets/images/experiences/fishing.webp'),
    url: 'https://www.getyourguide.com/naples-l162/baia-beginner-scuba-dive-in-underwater-archaeological-park-t1364689/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-kayak',
    title: 'Posillipo Kayak Tour',
    tagline: 'Paddle the wild Posillipo coastline — coves, villas and grottoes.',
    image: require('@/assets/images/top10/beaches.jpeg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-wild-posillipo-kayak-tour-t1191472/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-herculaneum',
    title: 'Herculaneum: Skip the Line',
    tagline: 'Guided tour of the buried city with an archaeologist.',
    image: require('@/assets/images/top10/daytrips.webp'),
    url: 'https://www.getyourguide.com/naples-l162/herculaneum-skip-the-line-guided-tour-with-archaeologist-t204331/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-veiled-christ',
    title: 'The Veiled Christ: Ticket & Tour',
    tagline: 'Entrance and guided tour of the Sansevero Chapel masterpiece.',
    image: require('@/assets/images/top10/theater.jpg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-veiled-christ-guided-tour-and-ticket-t833595/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-mann',
    title: 'Archaeological Museum Guided Tour',
    tagline: "The MANN — home of Pompeii's greatest treasures, with a guide.",
    image: require('@/assets/images/top10/museums.jpg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-national-archaeological-museum-of-naples-guided-tour-t415352/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-capodimonte',
    title: 'Capodimonte Museum Small-Group Tour',
    tagline: 'Caravaggio, Titian and the Bourbon palace above the city.',
    image: require('@/assets/images/top10/parks.jpg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-capodimonte-museum-small-group-tour-t561524/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-fiat500',
    title: 'Naples by Vintage Fiat 500',
    tagline: 'Private tour of the city in a classic Fiat 500 or 600.',
    image: require('@/assets/images/experiences/walking-tour.jpeg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-private-tour-by-classic-fiat-500-or-fiat-600-t36391/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-hopon',
    title: 'Hop-On Hop-Off Bus Tour',
    tagline: '24-hour ticket — see the city from the open top deck.',
    image: require('@/assets/images/top10/vibey.jpg'),
    url: 'https://www.getyourguide.com/naples-l162/naples-hop-on-hop-off-tour-24-hour-ticket-t50723/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
  {
    id: 'aff-poseidon',
    title: 'Poseidon Thermal Gardens (Ischia)',
    tagline: 'Ferry from Naples to the famous thermal spa park — a full day of soaking.',
    image: require('@/assets/images/top10/spas.jpeg'),
    url: 'https://www.getyourguide.com/naples-l162/giardini-poseidon-terme-dal-porto-di-napoli-t953605/?partner_id=GCMOPOO&currency=EUR&travel_agent=1&cmp=share_to_earn',
  },
];
