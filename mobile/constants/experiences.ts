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
  | { type: 'rsvp';    fixedDates: FixedDate[]; stayCuned?: boolean; hasPrivate?: boolean; privateFields?: BookingField[] }
  | { type: 'inquiry'; fields: BookingField[] }
  | { type: 'hybrid';  fixedDates: FixedDate[]; stayCuned?: boolean; privateFields: BookingField[] };

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
        { id: 'date',   label: 'Preferred date', type: 'text', placeholder: 'e.g. 10 July, flexible on weekdays', required: true },
        { id: 'people', label: 'Number of people', type: 'number', min: 1, max: 20, required: true },
        { id: 'focus',  label: 'Any focus areas?', type: 'text', placeholder: 'e.g. street food, history, Spaccanapoli…' },
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
      privateFields: [
        { id: 'date',    label: 'Preferred date(s)', type: 'text', placeholder: 'e.g. any weekend in August', required: true },
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
        { id: 'people',     label: 'Number of people', type: 'number', min: 1, max: 8, required: true },
        { id: 'experience', label: 'Fishing experience', type: 'select', options: ['First time', 'Occasional', 'Experienced'], required: true },
        { id: 'style',      label: 'Style', type: 'select', options: ['Traditional with local fishermen', 'Sport fishing', 'Either / no preference'] },
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
        { id: 'date',       label: 'When are you in Naples?', type: 'text', placeholder: 'e.g. 10–17 July', required: true },
        { id: 'hours',      label: 'How many hours?', type: 'select', options: ['2–3 hours', 'Half day (4h)', 'Full day (8h)', 'Multiple days', 'Flexible'], required: true },
        { id: 'people',     label: 'Number of people', type: 'number', min: 1, max: 50, required: true },
        { id: 'budget',     label: 'Budget per person (rough)', type: 'select', options: ['Under €50', '€50–100', '€100–200', 'Flexible / let\'s talk'] },
        { id: 'idea',       label: 'Describe your ideal experience', type: 'text', placeholder: 'Vibe, interests, anything special…', required: true },
      ],
    },
  },

];

export const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/EmxgA1r5wha5nWdiMjJzyR';
