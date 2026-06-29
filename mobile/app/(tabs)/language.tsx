import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import { phraseCategories, type Category, type Phrase, type VocabItem } from '@/constants/phrases';
import GrammarView from '@/components/GrammarView';
import { speak } from '@/lib/speech';
import { lookupDictionary } from '@/lib/dictionary';

type Tab = 'phrases' | 'vocab';

function PhraseCard({ phrase, catLabel, dialect }: { phrase: Phrase; catLabel?: string; dialect?: boolean }) {
  const headline = dialect ? (phrase.neapolitan ?? phrase.italian) : phrase.italian;
  const isTip = !phrase.italian && !phrase.neapolitan;
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.situation}>{phrase.situation.toUpperCase()}</Text>
        {catLabel ? <Text style={styles.catTag}>{catLabel}</Text> : null}
      </View>
      {isTip ? (
        <Text style={styles.tipText}>{phrase.english}</Text>
      ) : (
        <>
          <Text style={styles.english}>{phrase.english}</Text>
          <TouchableOpacity
            style={styles.speakRow}
            onPress={() => speak(headline)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`Play ${headline}`}
          >
            <Text style={[styles.italian, dialect && styles.headlineDialect]}>{headline}</Text>
            <Ionicons name="volume-high-outline" size={15} color={dialect ? '#3E8E6B' : Colors.gold} />
          </TouchableOpacity>
          {phrase.pronunciation ? <Text style={styles.pronunciation}>{phrase.pronunciation}</Text> : null}
          {dialect && phrase.italian ? <Text style={styles.refLine}>Italian: {phrase.italian}</Text> : null}
        </>
      )}
    </View>
  );
}

function VocabCard({ item, catLabel, dialect }: { item: VocabItem; catLabel?: string; dialect?: boolean }) {
  const headline = dialect ? (item.neapolitan ?? item.italian) : item.italian;
  return (
    <View style={styles.card}>
      <View style={styles.vocabTopRow}>
        <Text style={styles.vocabEnglish}>{item.english}</Text>
        <TouchableOpacity
          style={styles.vocabSpeakRow}
          onPress={() => speak(headline)}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`Play ${headline}`}
        >
          <Ionicons name="volume-high-outline" size={14} color={dialect ? '#3E8E6B' : Colors.gold} />
          <Text style={[styles.vocabItalian, dialect && styles.headlineDialect]}>{headline}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.vocabBottomRow}>
        {item.pronunciation ? <Text style={styles.pronunciation}>{item.pronunciation}</Text> : <View />}
        {catLabel ? <Text style={styles.catTag}>{catLabel}</Text> : null}
      </View>
      {dialect && item.italian ? <Text style={styles.refLine}>Italian: {item.italian}</Text> : null}
      {item.note ? <Text style={styles.vocabNote}>{item.note}</Text> : null}
    </View>
  );
}

export default function LanguageScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('basics');
  const [tab, setTab] = useState<Tab>('phrases');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'phrasebook' | 'grammar'>('phrasebook');

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const category = phraseCategories.find((c: Category) => c.id === activeCategory)!;

  const phraseResults = useMemo(() => {
    if (!searching) {
      return category.phrases.map((p) => ({ item: p, catLabel: '', dialect: category.id === 'neapolitan' }));
    }
    return phraseCategories.flatMap((c) =>
      c.phrases
        .filter((p) =>
          [p.english, p.italian, p.situation, p.neapolitan ?? '']
            .some((f) => f.toLowerCase().includes(q))
        )
        .map((p) => ({ item: p, catLabel: c.label, dialect: c.id === 'neapolitan' }))
    );
  }, [q, searching, category]);

  const vocabResults = useMemo(() => {
    if (!searching) {
      return category.vocab.map((v) => ({ item: v, catLabel: '', dialect: category.id === 'neapolitan' }));
    }
    const curated = phraseCategories.flatMap((c) =>
      c.vocab
        .filter((v) =>
          [v.english, v.italian, v.neapolitan ?? '', v.note ?? '']
            .some((f) => f.toLowerCase().includes(q))
        )
        .map((v) => ({ item: v, catLabel: c.label, dialect: c.id === 'neapolitan' }))
    );
    // Fallback: the big EN→IT dictionary, minus anything already curated above.
    const seen = new Set(curated.map((r) => r.item.english.toLowerCase()));
    const dict = lookupDictionary(q)
      .filter((d) => !seen.has(d.english.toLowerCase()))
      .map((d) => ({
        item: { id: `dict-${d.english}`, english: d.english, italian: d.italian, pronunciation: '' } as VocabItem,
        catLabel: 'Dictionary',
        dialect: false,
      }));
    return [...curated, ...dict];
  }, [q, searching, category]);

  const isPhrases = tab === 'phrases';
  const count = isPhrases ? phraseResults.length : vocabResults.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>SPEAK LIKE A LOCAL</Text>
        <Text style={styles.headerTitle}>Language help</Text>
        <Text style={styles.headerSub}>Phrases & vocabulary for daily Naples life</Text>
      </View>

      {/* Mode: Phrasebook | Grammar */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'phrasebook' && styles.modeBtnActive]}
          onPress={() => setMode('phrasebook')}
        >
          <Ionicons name="book-outline" size={15} color={mode === 'phrasebook' ? Colors.white : Colors.mid} />
          <Text style={[styles.modeText, mode === 'phrasebook' && styles.modeTextActive]}>Phrasebook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'grammar' && styles.modeBtnActive]}
          onPress={() => setMode('grammar')}
        >
          <Ionicons name="school-outline" size={15} color={mode === 'grammar' ? Colors.white : Colors.mid} />
          <Text style={[styles.modeText, mode === 'grammar' && styles.modeTextActive]}>Grammar</Text>
        </TouchableOpacity>
      </View>

      {mode === 'grammar' ? (
        <GrammarView />
      ) : (
      <>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.mid} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search words & phrases..."
          placeholderTextColor={Colors.mid}
          autoCorrect={false}
        />
        {searching ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={Colors.mid} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category chips — hidden while searching (search spans all sections) */}
      {!searching ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsRow}
        >
          {phraseCategories.map((cat: Category) => {
            const active = activeCategory === cat.id;
            const isNap = cat.id === 'neapolitan';
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, active && styles.chipActive, isNap && active && styles.chipNapActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.searchHint}>
          {count} {count === 1 ? 'result' : 'results'} across all sections
        </Text>
      )}

      {/* Phrases / Vocab toggle */}
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, isPhrases && styles.segmentBtnActive]}
          onPress={() => setTab('phrases')}
        >
          <Text style={[styles.segmentText, isPhrases && styles.segmentTextActive]}>Phrases</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, !isPhrases && styles.segmentBtnActive]}
          onPress={() => setTab('vocab')}
        >
          <Text style={[styles.segmentText, !isPhrases && styles.segmentTextActive]}>Vocab</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {count === 0 ? (
          <View style={styles.empty}>
            <Ionicons name={searching ? 'search' : 'information-circle-outline'} size={28} color={Colors.mid} />
            <Text style={styles.emptyText}>
              {searching
                ? `No ${isPhrases ? 'phrases' : 'words'} found for “${query}”`
                : `No ${isPhrases ? 'phrases' : 'words'} in this section — try the ${isPhrases ? 'Vocab' : 'Phrases'} tab`}
            </Text>
          </View>
        ) : isPhrases ? (
          phraseResults.map(({ item, catLabel, dialect }) => (
            <PhraseCard key={item.id} phrase={item} catLabel={catLabel} dialect={dialect} />
          ))
        ) : (
          vocabResults.map(({ item, catLabel, dialect }) => (
            <VocabCard key={item.id} item={item} catLabel={catLabel} dialect={dialect} />
          ))
        )}
      </ScrollView>
      </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  headerEyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2, color: Colors.goldDim, marginBottom: 3 },
  headerTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24, color: Colors.dark },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: Colors.mid, marginTop: 2 },

  modeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  modeBtnActive: { backgroundColor: Colors.dark, borderColor: Colors.dark },
  modeText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.mid },
  modeTextActive: { color: Colors.white },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.dark,
    padding: 0,
  },

  chipsRow: { flexGrow: 0 },
  chips: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.dark, borderColor: Colors.dark },
  chipNapActive: { backgroundColor: '#3E8E6B', borderColor: '#3E8E6B' },
  chipText: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid },
  chipTextActive: { color: Colors.white },

  searchHint: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.mid,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  segment: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.light,
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentBtnActive: { backgroundColor: Colors.white },
  segmentText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.mid },
  segmentTextActive: { color: Colors.dark },

  list: { flex: 1 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 15,
    marginBottom: 10,
    ...Shadow.sm,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  situation: { fontFamily: 'DMSans-Medium', fontSize: 9, color: Colors.mid, letterSpacing: 0.8 },
  catTag: {
    fontFamily: 'DMSans-Medium',
    fontSize: 9,
    color: Colors.gold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  english: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginBottom: 4 },
  italian: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 16, color: Colors.dark },
  headlineDialect: { color: '#3E8E6B' },
  speakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  vocabSpeakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, justifyContent: 'flex-end' },
  pronunciation: { fontFamily: 'DMSans-Regular', fontSize: 12, color: '#7B5EA7', fontStyle: 'italic', marginTop: 3 },
  refLine: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, marginTop: 4 },
  tipText: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.dark, lineHeight: 19 },

  vocabTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  vocabEnglish: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid, flex: 1 },
  vocabItalian: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 16, color: Colors.dark, textAlign: 'right', flexShrink: 1 },
  vocabBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vocabNote: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, fontStyle: 'italic', marginTop: 4 },

  empty: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.mid, textAlign: 'center' },
});
