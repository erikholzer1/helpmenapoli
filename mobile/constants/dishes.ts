// "What to eat in Naples" — a dish glossary (not a place list, so no map).
// Content from Erik. Grouped by course.

export type Dish = { name: string; desc: string; tag?: string };
export type DishCategory = { id: string; title: string; icon: string; dishes: Dish[] };

export const dishIntro =
  'A local\'s cheat-sheet to eating in Naples — the dishes worth ordering, course by course, plus a few only-in-Napoli things to try.';

export const dishCategories: DishCategory[] = [
  {
    id: 'antipasti', title: 'Appetizers', icon: 'restaurant',
    dishes: [
      { name: 'Alici fritte', desc: 'Fried fresh anchovies.' },
      { name: 'Frittatine', desc: 'Fried béchamel-and-pasta balls.' },
      { name: 'Zeppoline', desc: 'Fried pizza-dough balls, often with seaweed.' },
      { name: 'Crocchè', desc: 'Potato croquettes.' },
      { name: 'Caprese', desc: 'Mozzarella and tomatoes.' },
      { name: 'Parmigiana', desc: 'Baked eggplant parmesan.' },
      { name: 'Zuppa di cozze', desc: 'Mussels in a savory garlic broth.' },
      { name: 'Insalata di polpo', desc: 'Octopus salad.' },
      { name: 'Casatiello', desc: 'Savory cake with cured meats, cheese and egg.' },
      { name: 'Arancini', desc: 'Rice balls stuffed with ragù, meat and peas.' },
    ],
  },
  {
    id: 'pasta', title: 'Pasta', icon: 'nutrition',
    dishes: [
      { name: 'Spaghetti alle vongole', desc: 'Spaghetti with clams.' },
      { name: 'Pasta al ragù', desc: 'Rich tomato-and-meat sauce.' },
      { name: 'Pasta alla Genovese', desc: 'Slow-cooked onion-and-meat sauce.' },
      { name: 'Pasta e patate', desc: 'Potatoes and smoked provola.' },
      { name: 'Pasta alla Nerano', desc: 'Zucchini and cheese.' },
      { name: 'Spaghetti alla puttanesca', desc: 'Tomatoes, olives, capers, anchovies and garlic.' },
      { name: 'Pasta e fagioli', desc: 'Hearty bean soup.' },
      { name: 'Gnocchi alla Sorrentina', desc: 'Baked with tomato and mozzarella.' },
      { name: 'Scialatielli ai frutti di mare', desc: 'Thick fresh pasta with mixed seafood.' },
    ],
  },
  {
    id: 'pizza', title: 'Pizza', icon: 'pizza',
    dishes: [
      { name: 'Margherita con bufala', desc: 'Margherita with buffalo mozzarella.' },
      { name: 'Pizza fritta', desc: 'Fried, stuffed pizza.' },
    ],
  },
  {
    id: 'contorni', title: 'Sides', icon: 'leaf',
    dishes: [
      { name: 'Friarielli', desc: 'Pan-fried broccoli rabe.', tag: 'Winter' },
      { name: 'Scarole', desc: 'Pan-fried escarole.', tag: 'Winter' },
      { name: 'Peperoni', desc: 'Pan-fried bell peppers.', tag: 'Year-round' },
      { name: 'Peperoncini verdi', desc: 'Shishito-style green peppers fried with tomato.', tag: 'Summer' },
      { name: 'Melanzane a funghetto', desc: 'Cubed eggplant in cherry-tomato sauce and basil.' },
      { name: 'Zucchine alla scapece', desc: 'Fried zucchini marinated in vinegar, oil and mint.' },
    ],
  },
  {
    id: 'secondi', title: 'Mains', icon: 'fish',
    dishes: [
      { name: 'Calamari fritti', desc: 'Fried calamari.' },
      { name: 'Pesce fresco', desc: 'Whatever the fresh catch is.' },
      { name: 'Polpette', desc: 'Meatballs.' },
      { name: 'Salsiccia e friarielli', desc: 'Sausage with broccoli rabe.' },
      { name: 'Polpetielli alla Luciana', desc: 'Baby octopus in tomato, garlic, capers and olives.' },
      { name: 'Braciole al ragù', desc: 'Stuffed, rolled beef simmered in ragù.' },
      { name: 'Impepata di cozze', desc: 'Mussels with garlic, white wine, lemon, pepper and parsley.' },
      { name: 'Alici marinate', desc: 'Anchovies marinated in vinegar, garlic and herbs.' },
      { name: 'Totani e patate', desc: 'Squid and potatoes.' },
    ],
  },
  {
    id: 'dolci', title: 'Desserts', icon: 'ice-cream',
    dishes: [
      { name: 'Sfogliatella', desc: 'The crisp riccia or soft frolla shell pastry.' },
      { name: 'Babà', desc: 'Rum-soaked sponge.' },
      { name: 'Pastiera Napoletana', desc: 'Wheat-and-ricotta Easter tart.' },
      { name: 'Fiocco di neve', desc: 'Cloud-soft cream-filled bun.' },
      { name: 'Graffe Napoletane', desc: 'Fluffy potato doughnuts.' },
      { name: 'Zeppole di San Giuseppe', desc: "Cream pastry for St Joseph's day." },
      { name: 'Torta Caprese', desc: 'Flourless chocolate-almond cake.' },
      { name: 'Struffoli', desc: 'Honeyed dough balls (Christmas).' },
    ],
  },
  {
    id: 'wines', title: 'Local Wines & Cocktails', icon: 'wine',
    dishes: [
      { name: 'Falanghina', desc: 'Crisp, citrusy, and mineral-driven white.', tag: '🥂 White' },
      { name: 'Greco di Tufo', desc: 'Bold, deeply structural, flinty white.', tag: '🥂 White' },
      { name: 'Fiano di Avellino', desc: 'Rich, nutty, and highly aromatic white.', tag: '🥂 White' },
      { name: 'Biancolella', desc: 'Coastal, saline, and herb-scented white.', tag: '🥂 White' },
      { name: 'Coda di Volpe', desc: 'Smooth, fruity, low-acidity white.', tag: '🥂 White' },
      { name: 'Aglianico', desc: 'Bold, deeply tannic red with dark fruit.', tag: '🍷 Red' },
      { name: 'Taurasi', desc: '"Barolo of the South" — complex and ageworthy.', tag: '🍷 Red' },
      { name: 'Piedirosso', desc: 'Light, red-berried, distinctively smoky.', tag: '🍷 Red' },
      { name: 'Lacryma di Cristo', desc: 'Volcanic, earth-driven, fruit-forward blend.', tag: '🍷 Red' },
      { name: 'Primitivo', desc: 'Rich, jammy and raisiny with tobacco notes — more common to Puglia.', tag: '🍷 Red' },
      { name: 'Spritz Aperol', desc: 'The classic orange spritz.', tag: '🍹 Cocktail' },
      { name: 'Spritz Campari', desc: 'A more bitter, ruby version.', tag: '🍹 Cocktail' },
      { name: 'Spritz Hugo', desc: 'Elderflower and prosecco — lighter and floral.', tag: '🍹 Cocktail' },
      { name: 'Spritz Limoncello', desc: 'Local twist on the spritz.', tag: '🍹 Cocktail' },
      { name: 'Negroni', desc: 'Gin, Campari, sweet vermouth — a timeless classic.', tag: '🍹 Cocktail' },
      { name: 'Americano', desc: 'Campari and vermouth with soda — lighter than a Negroni.', tag: '🍹 Cocktail' },
      { name: 'Negroni Sbagliato', desc: 'The "wrong" Negroni — prosecco instead of gin.', tag: '🍹 Cocktail' },
    ],
  },
  {
    id: 'digestivi', title: 'Digestivi', icon: 'wine',
    dishes: [
      { name: 'Limoncello', desc: 'Liqueur from the zest of local lemons.' },
      { name: 'Nocillo', desc: 'Liqueur from unripe green walnuts and spices.' },
      { name: 'Rucolino', desc: 'Liqueur made with wild arugula (rocket).' },
      { name: 'Amaro del Capo', desc: 'Calabrian-style herb amaro.' },
      { name: 'Amaro Jefferson', desc: 'Herbal amaro with citrus notes.' },
      { name: 'Grappa', desc: 'Spirit distilled from winemaking pomace.' },
      { name: 'Strega', desc: 'Benevento botanical liqueur (cinnamon, mint, fennel).' },
      { name: 'Meloncello', desc: 'Cantaloupe-melon liqueur.' },
      { name: 'Crema di limone', desc: 'Creamier, sweeter, milder limoncello.' },
      { name: 'Espresso', desc: 'The non-negotiable full stop to any meal.' },
    ],
  },
];

export const funThingsToTry: Dish[] = [
  { name: 'Limonata a cosce aperte', desc: 'Fizzy lemonade with baking soda that foams over — forcing you to spread your legs as you gulp it.' },
  { name: 'Cuzzetiello', desc: 'A bread loaf hollowed out and stuffed with ragù, meatballs, Genovese or parmigiana.' },
  { name: '€2 takeaway spritz', desc: 'Grab one and wander Piazza Bellini and Via dei Tribunali.' },
];
