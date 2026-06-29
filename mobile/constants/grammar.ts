export type Example = { it: string; en: string };

export type GrammarBlock =
  | { kind: 'note'; text: string }
  | { kind: 'rule'; title: string; detail?: string; examples?: Example[] }
  | { kind: 'pairs'; title?: string; pairs: { it: string; en: string }[] }
  | { kind: 'conjugation'; verb: string; english: string; forms: { p: string; f: string }[] };

export type GrammarTopic = {
  id: string;
  label: string;
  blocks: GrammarBlock[];
};

// Adapted from HelpMeNapoli's "Welcome to Italy" grammar booklet.
const PRON = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];
const conj = (verb: string, english: string, forms: string[]) => ({
  kind: 'conjugation' as const,
  verb,
  english,
  forms: PRON.map((p, i) => ({ p, f: forms[i] })),
});

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'articles',
    label: 'Articles',
    blocks: [
      { kind: 'note', text: 'Italian "the" and "a" change with gender, number, and the first letter of the noun.' },
      {
        kind: 'rule',
        title: 'Masculine singular',
        detail: 'il / un — most nouns · lo / uno — before s+consonant or z · l’ (the) / un (a, no apostrophe) — before a vowel',
        examples: [
          { it: 'il libro, un libro', en: 'the / a book' },
          { it: 'lo studente, uno zaino', en: 'the student, a backpack' },
          { it: "l'amico, un amico", en: 'the / a (male) friend' },
        ],
      },
      {
        kind: 'rule',
        title: 'Masculine plural',
        detail: 'i — most nouns · gli — before a vowel, s+consonant, or z',
        examples: [
          { it: 'i libri', en: 'the books' },
          { it: 'gli studenti, gli amici', en: 'the students, the friends' },
        ],
      },
      {
        kind: 'rule',
        title: 'Feminine',
        detail: "Singular: la / una · l’ / un’ before a vowel (un’ keeps its apostrophe) · Plural: le (always)",
        examples: [
          { it: 'la casa, una casa', en: 'the / a house' },
          { it: "l'amica, un'amica", en: 'the / a (female) friend' },
          { it: "l'acqua, le case", en: 'the water, the houses' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Quantity',
        pairs: [
          { it: 'Qualche', en: 'some' },
          { it: "Un po' di", en: 'a little bit of' },
        ],
      },
    ],
  },
  {
    id: 'pronouns',
    label: 'Pronouns',
    blocks: [
      {
        kind: 'pairs',
        title: 'Personal (subject) pronouns',
        pairs: [
          { it: 'Io', en: 'I' },
          { it: 'Tu', en: 'you' },
          { it: 'Lui / Lei', en: 'he / she' },
          { it: 'Noi', en: 'we' },
          { it: 'Voi', en: 'you (plural)' },
          { it: 'Loro', en: 'they' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Reflexive pronouns',
        pairs: [
          { it: 'Mi', en: 'myself' }, { it: 'Ti', en: 'yourself' },
          { it: 'Si', en: 'him/her/itself' }, { it: 'Ci', en: 'ourselves' },
          { it: 'Vi', en: 'yourselves' }, { it: 'Si', en: 'themselves' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Indirect object pronouns',
        pairs: [
          { it: 'Mi', en: 'to me' }, { it: 'Ti', en: 'to you' },
          { it: 'Gli / Le', en: 'to him / her' }, { it: 'Ci', en: 'to us' },
          { it: 'Vi', en: 'to you (pl)' }, { it: 'Gli', en: 'to them' },
        ],
      },
    ],
  },
  {
    id: 'adjectives',
    label: 'Adjectives',
    blocks: [
      { kind: 'note', text: 'Adjectives agree with the noun in gender and number: -o (m sing), -a (f sing), -i (m pl), -e (f pl). Adjectives ending in -e use -e (singular) and -i (plural) for both genders.' },
      {
        kind: 'pairs',
        title: 'Top 20 adjectives',
        pairs: [
          { it: 'Buono', en: 'good' }, { it: 'Cattivo', en: 'bad' },
          { it: 'Grande', en: 'big' }, { it: 'Piccolo', en: 'small' },
          { it: 'Bello', en: 'beautiful' }, { it: 'Brutto', en: 'ugly' },
          { it: 'Nuovo', en: 'new' }, { it: 'Vecchio', en: 'old' },
          { it: 'Giovane', en: 'young' }, { it: 'Alto', en: 'tall / high' },
          { it: 'Basso', en: 'short / low' }, { it: 'Lungo', en: 'long' },
          { it: 'Corto', en: 'short' }, { it: 'Caldo', en: 'hot' },
          { it: 'Freddo', en: 'cold' }, { it: 'Facile', en: 'easy' },
          { it: 'Difficile', en: 'difficult' }, { it: 'Forte', en: 'strong' },
          { it: 'Felice', en: 'happy' }, { it: 'Stanco', en: 'tired' },
        ],
      },
      {
        kind: 'rule',
        title: 'Agreement in action',
        examples: [
          { it: 'un ragazzo alto', en: 'a tall boy' },
          { it: 'una ragazza alta', en: 'a tall girl' },
          { it: 'i ragazzi alti', en: 'the tall boys' },
          { it: 'le case grandi', en: 'the big houses' },
        ],
      },
    ],
  },
  {
    id: 'comparisons',
    label: 'Comparisons',
    blocks: [
      { kind: 'note', text: 'Put più (more) or meno (less) before the adjective; use di or che for "than". Some comparatives are irregular.' },
      {
        kind: 'rule',
        title: 'More / less',
        examples: [
          { it: 'più bello', en: 'more beautiful' },
          { it: 'meno caro', en: 'less expensive' },
          { it: 'Napoli è più grande di Capri', en: 'Naples is bigger than Capri' },
        ],
      },
      {
        kind: 'rule',
        title: 'As ... as',
        examples: [
          { it: 'alto come te', en: 'as tall as you' },
          { it: 'tanto ... quanto', en: 'as much ... as' },
        ],
      },
      {
        kind: 'rule',
        title: 'Irregular comparatives',
        detail: 'buono → migliore (better) · cattivo → peggiore (worse) · grande → maggiore · piccolo → minore',
        examples: [
          { it: 'Questo vino è migliore', en: 'This wine is better' },
          { it: 'Si mangia meglio qui', en: 'One eats better here (meglio = adverb)' },
          { it: 'È peggio di ieri', en: "It's worse than yesterday" },
        ],
      },
      {
        kind: 'rule',
        title: 'The most / least (superlative)',
        examples: [
          { it: 'il più bello', en: 'the most beautiful' },
          { it: 'la pizza più buona di Napoli', en: 'the best pizza in Naples' },
        ],
      },
    ],
  },
  {
    id: 'regular',
    label: 'Regular verbs',
    blocks: [
      { kind: 'note', text: 'Italian verbs end in -ARE, -ERE or -IRE. To conjugate, drop the last 3 letters and add the ending for each pronoun. Some -IRE verbs add -isc.' },
      conj('-ARE  (endings)', 'e.g. parlare', ['-o', '-i', '-a', '-iamo', '-ate', '-ano']),
      conj('-ERE  (endings)', 'e.g. credere', ['-o', '-i', '-e', '-iamo', '-ete', '-ono']),
      conj('-IRE  (endings)', 'e.g. partire', ['-o', '-i', '-e', '-iamo', '-ite', '-ono']),
      conj('-IRE (isc)', 'e.g. capire, finire', ['-isco', '-isci', '-isce', '-iamo', '-ite', '-iscono']),
      conj('Amare', 'to love (-are)', ['amo', 'ami', 'ama', 'amiamo', 'amate', 'amano']),
      conj('Credere', 'to believe (-ere)', ['credo', 'credi', 'crede', 'crediamo', 'credete', 'credono']),
      conj('Capire', 'to understand (-ire, isc)', ['capisco', 'capisci', 'capisce', 'capiamo', 'capite', 'capiscono']),
      {
        kind: 'pairs',
        title: 'Common -ARE verbs',
        pairs: [
          { it: 'Parlare', en: 'to speak' }, { it: 'Mangiare', en: 'to eat' },
          { it: 'Comprare', en: 'to buy' }, { it: 'Guardare', en: 'to watch' },
          { it: 'Ascoltare', en: 'to listen' }, { it: 'Aspettare', en: 'to wait' },
          { it: 'Lavorare', en: 'to work' }, { it: 'Studiare', en: 'to study' },
          { it: 'Camminare', en: 'to walk' }, { it: 'Viaggiare', en: 'to travel' },
          { it: 'Chiamare', en: 'to call' }, { it: 'Giocare', en: 'to play' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Common -ERE verbs',
        pairs: [
          { it: 'Credere', en: 'to believe' }, { it: 'Leggere', en: 'to read' },
          { it: 'Scrivere', en: 'to write' }, { it: 'Vedere', en: 'to see' },
          { it: 'Chiedere', en: 'to ask' }, { it: 'Chiudere', en: 'to close' },
          { it: 'Mettere', en: 'to put' }, { it: 'Perdere', en: 'to lose' },
          { it: 'Rispondere', en: 'to respond' }, { it: 'Vendere', en: 'to sell' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Common -IRE verbs',
        pairs: [
          { it: 'Aprire', en: 'to open' }, { it: 'Dormire', en: 'to sleep' },
          { it: 'Partire', en: 'to leave' }, { it: 'Sentire', en: 'to feel / hear' },
          { it: 'Offrire', en: 'to offer' }, { it: 'Seguire', en: 'to follow' },
          { it: 'Capire (isc)', en: 'to understand' }, { it: 'Finire (isc)', en: 'to finish' },
          { it: 'Preferire (isc)', en: 'to prefer' }, { it: 'Pulire (isc)', en: 'to clean' },
        ],
      },
    ],
  },
  {
    id: 'irregular',
    label: 'Irregular verbs',
    blocks: [
      { kind: 'note', text: 'The most-used verbs are irregular — they do not follow the regular endings. Worth memorizing.' },
      conj('Essere', 'to be', ['sono', 'sei', 'è', 'siamo', 'siete', 'sono']),
      conj('Avere', 'to have', ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno']),
      conj('Andare', 'to go', ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno']),
      conj('Fare', 'to do / make', ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno']),
      conj('Volere', 'to want', ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono']),
      conj('Dovere', 'to have to', ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono']),
      conj('Potere', 'to be able to / can', ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono']),
      conj('Stare', 'to stay / be', ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno']),
      conj('Dire', 'to say', ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono']),
      conj('Venire', 'to come', ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono']),
      conj('Uscire', 'to go out', ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono']),
      conj('Dare', 'to give', ['do', 'dai', 'dà', 'diamo', 'date', 'danno']),
    ],
  },
  {
    id: 'reflexive',
    label: 'Reflexive verbs',
    blocks: [
      { kind: 'note', text: 'Reflexive verbs describe an action done to oneself. "Mi alzo" = I get up (literally "I raise myself").' },
      {
        kind: 'pairs',
        title: 'Reflexive pronouns',
        pairs: [
          { it: 'Mi', en: 'myself' }, { it: 'Ti', en: 'yourself' },
          { it: 'Si', en: 'him/her/itself' }, { it: 'Ci', en: 'ourselves' },
          { it: 'Vi', en: 'yourselves' }, { it: 'Si', en: 'themselves' },
        ],
      },
      conj('Alzarsi', 'to get up', ['mi alzo', 'ti alzi', 'si alza', 'ci alziamo', 'vi alzate', 'si alzano']),
      {
        kind: 'pairs',
        title: 'Common reflexive verbs',
        pairs: [
          { it: 'Lavarsi', en: 'to wash' }, { it: 'Vestirsi', en: 'to get dressed' },
          { it: 'Svegliarsi', en: 'to wake up' }, { it: 'Divertirsi', en: 'to have fun' },
          { it: 'Rilassarsi', en: 'to relax' }, { it: 'Sentirsi', en: 'to feel' },
          { it: 'Chiamarsi', en: 'to be called' }, { it: 'Allenarsi', en: 'to train' },
        ],
      },
    ],
  },
  {
    id: 'impersonal',
    label: 'Piacere & co.',
    blocks: [
      { kind: 'note', text: 'With piacere ("to like") the thing liked is the subject. Use an indirect pronoun + the verb agreeing with the thing: singular = piace, plural = piacciono.' },
      {
        kind: 'rule',
        title: 'How it works',
        examples: [
          { it: 'Mi piace il caffè', en: 'I like coffee' },
          { it: 'Mi piacciono i libri', en: 'I like books' },
          { it: 'Mi manchi tanto', en: 'I miss you so much' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Indirect object pronouns',
        pairs: [
          { it: 'Mi', en: 'to me' }, { it: 'Ti', en: 'to you' },
          { it: 'Gli / Le', en: 'to him / her' }, { it: 'Ci', en: 'to us' },
          { it: 'Vi', en: 'to you (pl)' }, { it: 'Gli', en: 'to them' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Verbs that work this way',
        pairs: [
          { it: 'Piacere', en: 'to like' }, { it: 'Mancare', en: 'to miss' },
          { it: 'Servire', en: 'to need' }, { it: 'Bastare', en: 'to be enough' },
          { it: 'Interessare', en: 'to interest' }, { it: 'Capitare', en: 'to happen' },
        ],
      },
    ],
  },
  {
    id: 'prepositions',
    label: 'Prepositions',
    blocks: [
      { kind: 'note', text: 'Prepositions combine with articles into one word: a + il = al, di + la = della, in + i = nei.' },
      {
        kind: 'rule',
        title: 'A — to, at, in',
        detail: 'al · allo · alla · ai · agli · alle',
        examples: [
          { it: 'Vado a Roma', en: 'I go to Rome' },
          { it: 'Inizia a mezzogiorno', en: 'It starts at noon' },
        ],
      },
      {
        kind: 'rule',
        title: 'Di — of, from, about',
        detail: 'del · dello · della · dei · degli · delle',
        examples: [
          { it: 'La madre di Antonio', en: "Antonio's mother" },
          { it: 'Sono di Napoli', en: "I'm from Naples" },
        ],
      },
      {
        kind: 'rule',
        title: 'Da — from, by, since',
        detail: 'dal · dallo · dalla · dai · dagli · dalle',
        examples: [
          { it: 'Vengo da Parigi', en: 'I come from Paris' },
          { it: 'Vado dal dottore', en: "I'm going to the doctor's" },
        ],
      },
      {
        kind: 'rule',
        title: 'In — in, into, to',
        detail: 'nel · nello · nella · nei · negli · nelle',
        examples: [
          { it: 'Vivo in Italia', en: 'I live in Italy' },
          { it: 'Viaggio in treno', en: 'I travel by train' },
        ],
      },
      {
        kind: 'rule',
        title: 'Su — on, about',
        detail: 'sul · sullo · sulla · sui · sugli · sulle',
        examples: [{ it: 'Il libro è sul tavolo', en: 'The book is on the table' }],
      },
      {
        kind: 'pairs',
        title: 'Other prepositions',
        pairs: [
          { it: 'Con', en: 'with' }, { it: 'Per', en: 'for, in order to' },
          { it: 'Tra / Fra', en: 'between, among, in' }, { it: 'Sotto', en: 'under' },
          { it: 'Sopra', en: 'above, over' }, { it: 'Verso', en: 'toward' },
          { it: 'Dietro', en: 'behind' }, { it: 'Davanti', en: 'in front of' },
          { it: 'Dentro', en: 'inside' }, { it: 'Fuori', en: 'outside' },
        ],
      },
      {
        kind: 'rule',
        title: 'Tips',
        examples: [
          { it: 'a Roma / in Italia', en: 'a for cities, in for countries' },
          { it: 'Sono di Napoli / Vengo da Napoli', en: 'di with essere, da with venire' },
          { it: 'Tra = Fra', en: 'fully interchangeable' },
        ],
      },
    ],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    blocks: [
      {
        kind: 'pairs',
        title: '1 – 20',
        pairs: [
          { it: 'Uno', en: '1' }, { it: 'Due', en: '2' }, { it: 'Tre', en: '3' },
          { it: 'Quattro', en: '4' }, { it: 'Cinque', en: '5' }, { it: 'Sei', en: '6' },
          { it: 'Sette', en: '7' }, { it: 'Otto', en: '8' }, { it: 'Nove', en: '9' },
          { it: 'Dieci', en: '10' }, { it: 'Undici', en: '11' }, { it: 'Dodici', en: '12' },
          { it: 'Tredici', en: '13' }, { it: 'Quattordici', en: '14' }, { it: 'Quindici', en: '15' },
          { it: 'Sedici', en: '16' }, { it: 'Diciassette', en: '17' }, { it: 'Diciotto', en: '18' },
          { it: 'Diciannove', en: '19' }, { it: 'Venti', en: '20' },
        ],
      },
      {
        kind: 'pairs',
        title: 'Tens',
        pairs: [
          { it: 'Trenta', en: '30' }, { it: 'Quaranta', en: '40' }, { it: 'Cinquanta', en: '50' },
          { it: 'Sessanta', en: '60' }, { it: 'Settanta', en: '70' }, { it: 'Ottanta', en: '80' },
          { it: 'Novanta', en: '90' }, { it: 'Cento', en: '100' },
        ],
      },
      { kind: 'note', text: 'Combine them: ventuno (21), ventidue (22), trentatré (33)...' },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    blocks: [
      {
        kind: 'pairs',
        title: 'Time words',
        pairs: [
          { it: "Un'ora", en: 'an hour' }, { it: 'Minuti', en: 'minutes' },
          { it: 'Secondi', en: 'seconds' }, { it: "Mezz'ora", en: 'half an hour' },
          { it: "Quarto d'ora", en: '15 minutes' }, { it: 'Mezzogiorno', en: 'noon' },
          { it: 'Mezzanotte', en: 'midnight' },
        ],
      },
      {
        kind: 'rule',
        title: 'Telling time',
        examples: [
          { it: "L'una e un quarto", en: '1:15' },
          { it: 'Le due e venti', en: '2:20' },
          { it: 'Le dieci e mezza', en: '10:30' },
          { it: 'Le sei meno quarto', en: '5:45 (quarter to six)' },
        ],
      },
      { kind: 'note', text: 'Add "(formal)" 24-hour style too: le quattordici e venti = 14:20.' },
    ],
  },
];
