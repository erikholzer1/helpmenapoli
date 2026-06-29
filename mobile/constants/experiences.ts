import { type ImageSourcePropType } from 'react-native';

export type Experience = {
  id: string;
  title: string;
  tagline: string;
  image: ImageSourcePropType;
};

// Image-forward, no prices — descriptions kept deliberately light. Tapping a
// card opens an email to Erik. Photos in assets/images/experiences/.
export const experiences: Experience[] = [
  { id: 'walking-tour', title: 'Naples Walking Tour with Food', tagline: 'Wander the old city and taste it as you go.', image: require('@/assets/images/experiences/walking-tour.jpeg') },
  { id: 'cheese-wine', title: 'Cheese & Wine Tasting', tagline: 'Learn about Italian cheeses — how to use them and how to pair them with wine.', image: require('@/assets/images/experiences/cheese-wine.jpeg') },
  { id: 'boat', title: 'Rent a Boat', tagline: 'A day on the bay, the coast at your pace.', image: require('@/assets/images/experiences/boat.jpeg') },
  { id: 'fishing', title: 'Fishing Charter', tagline: 'Head out on the water with local fishermen.', image: require('@/assets/images/experiences/fishing.webp') },
  { id: 'bread', title: 'Bread Classes', tagline: 'Sourdough & focaccia, from starter to bake.', image: require('@/assets/images/experiences/bread.jpeg') },
  { id: 'cooking', title: 'Cooking Class', tagline: 'Cook a true Neapolitan meal — then eat it.', image: require('@/assets/images/experiences/cooking.jpeg') },
  { id: 'italian', title: 'Interactive Italian Class', tagline: 'Real, usable Italian with a local.', image: require('@/assets/images/experiences/italian.jpeg') },
  { id: 'hiking', title: 'Hiking Excursions', tagline: 'Trails above the coast and the islands.', image: require('@/assets/images/experiences/hiking.jpeg') },
  { id: 'custom', title: 'Customize Your Own Experience', tagline: "Tell me what you're after — we'll build it together.", image: require('@/assets/images/experiences/custom.jpeg') },
];
