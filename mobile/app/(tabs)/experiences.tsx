import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import { experiences, type Experience } from '@/constants/experiences';
import ContactSheet from '@/components/ContactSheet';

const SCRIM = ['rgba(26,20,16,0)', 'rgba(26,20,16,0.15)', 'rgba(26,20,16,0.88)'] as const;

function ExperienceCard({ exp, onInfo }: { exp: Experience; onInfo: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onInfo}>
      <Image source={exp.image} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient colors={SCRIM} locations={[0, 0.45, 1]} style={styles.cardScrim}>
        <View style={styles.cardBottom}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{exp.title}</Text>
            <Text style={styles.cardTagline}>{exp.tagline}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoPillText}>Info</Text>
            <Ionicons name="arrow-forward" size={13} color={Colors.dark} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ExperiencesScreen() {
  const [subject, setSubject] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>WITH ERIK</Text>
        <Text style={styles.headerTitle}>Experiences</Text>
        <Text style={styles.headerSub}>Handpicked and led with a local — tap any one to ask about it.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} exp={exp} onInfo={() => setSubject(exp.title)} />
        ))}

        <TouchableOpacity style={styles.contactCard} activeOpacity={0.9} onPress={() => setSubject('Experiences')}>
          <View style={styles.contactIcon}>
            <Ionicons name="chatbubbles" size={20} color={Colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Contact me for info</Text>
            <Text style={styles.contactSub}>Questions, dates, private groups — reach me on WhatsApp or email.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.gold} />
        </TouchableOpacity>
      </ScrollView>

      <ContactSheet subject={subject} onClose={() => setSubject(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14,
    backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.divider,
  },
  headerEyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2, color: Colors.goldDim, marginBottom: 3 },
  headerTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 26, color: Colors.dark },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: Colors.mid, marginTop: 3, lineHeight: 17 },

  // Centered, capped column so photos stay nicely proportioned on wide screens.
  scroll: { padding: 16, paddingBottom: 40, alignItems: 'center' },

  card: {
    width: '100%', maxWidth: 460, aspectRatio: 1.3,
    borderRadius: Radius.lg, overflow: 'hidden',
    marginBottom: 14, backgroundColor: Colors.warm, ...Shadow.md,
  },
  cardImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardScrim: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  cardTitle: {
    fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: Colors.white, lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  cardTagline: {
    fontFamily: 'DMSans-Regular', fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  infoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.white, borderRadius: Radius.pill,
    paddingHorizontal: 13, paddingVertical: 8, ...Shadow.sm,
  },
  infoPillText: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: Colors.dark },

  contactCard: {
    width: '100%', maxWidth: 460,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.dark, borderRadius: Radius.lg, padding: 18, marginTop: 4, ...Shadow.md,
  },
  contactIcon: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: 'rgba(212,168,67,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  contactTitle: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.gold, marginBottom: 2 },
  contactSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: 'rgba(245,240,232,0.7)', lineHeight: 16 },
});
