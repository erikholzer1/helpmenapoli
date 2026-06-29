import { View, Text, ScrollView, TouchableOpacity, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { grammarTopics, type GrammarTopic, type GrammarBlock } from '@/constants/grammar';
import { speak } from '@/lib/speech';

function Speakable({ text, textStyle }: { text: string; textStyle: StyleProp<TextStyle> }) {
  const say = text.replace(/\s*\([^)]*\)/g, '').trim();
  return (
    <TouchableOpacity
      style={styles.speakInline}
      onPress={() => speak(say)}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`Play ${say}`}
    >
      <Text style={textStyle}>{text}</Text>
      <Ionicons name="volume-high-outline" size={12} color={Colors.gold} />
    </TouchableOpacity>
  );
}

function Block({ block }: { block: GrammarBlock }) {
  if (block.kind === 'note') {
    return (
      <View style={styles.note}>
        <Text style={styles.noteText}>{block.text}</Text>
      </View>
    );
  }

  if (block.kind === 'rule') {
    return (
      <View style={styles.card}>
        <Text style={styles.ruleTitle}>{block.title}</Text>
        {block.detail ? <Text style={styles.ruleDetail}>{block.detail}</Text> : null}
        {block.examples?.map((ex, i) => (
          <View key={i} style={styles.exampleRow}>
            <Speakable text={ex.it} textStyle={styles.exampleIt} />
            <Text style={styles.exampleEn}>{ex.en}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.kind === 'pairs') {
    return (
      <View style={styles.card}>
        {block.title ? <Text style={styles.ruleTitle}>{block.title}</Text> : null}
        <View style={styles.pairGrid}>
          {block.pairs.map((p, i) => (
            <View key={i} style={styles.pairItem}>
              <Speakable text={p.it} textStyle={styles.pairIt} />
              <Text style={styles.pairEn}>{p.en}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // conjugation — skip audio for the suffix-only "endings" tables (-o, -i, ...)
  const audible = !block.verb.trimStart().startsWith('-');
  return (
    <View style={styles.card}>
      <View style={styles.conjHeader}>
        {audible ? (
          <Speakable text={block.verb} textStyle={styles.conjVerb} />
        ) : (
          <Text style={styles.conjVerb}>{block.verb}</Text>
        )}
        <Text style={styles.conjEnglish}>{block.english}</Text>
      </View>
      <View style={styles.conjGrid}>
        {block.forms.map((f, i) =>
          audible ? (
            <TouchableOpacity
              key={i}
              style={styles.conjItem}
              onPress={() => speak(f.f)}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`Play ${f.f}`}
            >
              <Text style={styles.conjPron}>{f.p}</Text>
              <Text style={styles.conjForm}>{f.f}</Text>
              <Ionicons name="volume-high-outline" size={11} color={Colors.gold} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <View key={i} style={styles.conjItem}>
              <Text style={styles.conjPron}>{f.p}</Text>
              <Text style={styles.conjForm}>{f.f}</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

export default function GrammarView() {
  const [activeTopic, setActiveTopic] = useState<string>('articles');
  const topic = grammarTopics.find((t: GrammarTopic) => t.id === activeTopic)!;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        {grammarTopics.map((t: GrammarTopic) => {
          const active = activeTopic === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setActiveTopic(t.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 6, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {topic.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  chipText: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid },
  chipTextActive: { color: Colors.white },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    padding: 14,
    marginBottom: 8,
  },
  note: {
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  noteText: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.warm, lineHeight: 19 },

  ruleTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 15, color: Colors.dark },
  ruleDetail: { fontFamily: 'DMSans-Regular', fontSize: 12, color: '#7B5EA7', marginTop: 4, lineHeight: 18 },
  exampleRow: { marginTop: 8 },
  exampleIt: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },
  exampleEn: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginTop: 1 },

  pairGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  pairItem: { width: '50%', paddingVertical: 5, paddingRight: 8 },
  pairIt: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },
  pairEn: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginTop: 1 },

  conjHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  conjVerb: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 16, color: Colors.dark, flexShrink: 1 },
  conjEnglish: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginLeft: 8 },
  conjGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  conjItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
  },
  speakInline: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  conjPron: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, width: 54 },
  conjForm: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, flexShrink: 1 },
});
