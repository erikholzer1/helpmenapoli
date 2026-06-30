import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius, Gradients } from '@/constants/Colors';
import ContactSheet from '@/components/ContactSheet';

const { width } = Dimensions.get('window');
const CARD_W = (width - 16 * 2 - 12) / 2;

type NavCardProps = {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  gradient: readonly [string, string, ...string[]];
  onPress: () => void;
};

function NavCard({ title, subtitle, iconName, gradient, onPress }: NavCardProps) {
  return (
    <TouchableOpacity style={styles.navCardWrap} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.navCard}>
        <Ionicons name={iconName} size={110} color="rgba(255,255,255,0.10)" style={styles.navCardWatermark} />
        <View style={styles.navCardIconWrap}>
          <Ionicons name={iconName} size={26} color={Colors.white} />
        </View>
        <Text style={styles.navCardTitle}>{title}</Text>
        <Text style={styles.navCardSub}>{subtitle}</Text>
        <View style={styles.navCardArrowPill}>
          <Ionicons name="arrow-forward" size={13} color={Colors.white} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [contact, setContact] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrow}>NAPLES · ITALY</Text>
            <View style={styles.eyebrowDot} />
          </View>
          <Image
            source={require('@/assets/images/logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.heroRule} />
          <Text style={styles.heroSub}>Your guide to living and loving Naples</Text>
        </LinearGradient>

        {/* Nav grid */}
        <View style={[styles.grid, { marginTop: 22 }]}>
          <NavCard
            title="Language Help"
            subtitle={"Italian phrases, daily vocab & grammar for real-life situations in Naples"}
            iconName="language"
            gradient={['#C79A2E', '#6E5316'] as const}
            onPress={() => router.push('/(tabs)/language')}
          />
          <NavCard
            title="Top 10 Lists"
            subtitle={"The best places to eat, drink & explore — curated by a local"}
            iconName="trophy"
            gradient={['#C8392B', '#7A1C15'] as const}
            onPress={() => router.push('/(tabs)/discover')}
          />
          <NavCard
            title="What's On"
            subtitle={"Events, gigs & markets happening around Naples this week"}
            iconName="ticket"
            gradient={['#3E8E6B', '#1E4D39'] as const}
            onPress={() => router.push('/(tabs)/events')}
          />
          <NavCard
            title="Experiences"
            subtitle={"Private tours, cooking classes & handpicked day trips with Erik"}
            iconName="sparkles"
            gradient={['#7B5EA7', '#3F2F60'] as const}
            onPress={() => router.push('/(tabs)/experiences')}
          />
        </View>

        {/* Getting Around — full-width utility card */}
        <TouchableOpacity
          style={styles.wideCardWrap}
          activeOpacity={0.9}
          onPress={() => router.push('/getaround')}
        >
          <LinearGradient
            colors={['#1C7C9C', '#0E4257'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wideCard}
          >
            <Ionicons name="subway" size={120} color="rgba(255,255,255,0.10)" style={styles.wideCardWatermark} />
            <View style={styles.navCardIconWrap}>
              <Ionicons name="subway" size={26} color={Colors.white} />
            </View>
            <Text style={styles.navCardTitle}>Getting Around</Text>
            <Text style={styles.navCardSub}>Metro, funiculars, trains, ferries & airport — hours, maps & tickets</Text>
            <View style={styles.navCardArrowPill}>
              <Ionicons name="arrow-forward" size={13} color={Colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      <ContactSheet subject={contact} onClose={() => setContact(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  eyebrowDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.gold, opacity: 0.7 },
  eyebrow: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.goldSoft,
  },
  logo: { width: 200, height: 150, marginBottom: 4 },
  heroRule: { width: 40, height: 2, borderRadius: 1, backgroundColor: Colors.gold, opacity: 0.55, marginTop: 6, marginBottom: 12 },
  heroSub: {
    fontFamily: 'DMSans-Light',
    fontSize: 14,
    color: 'rgba(245,240,232,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  navCardWrap: {
    width: CARD_W,
    borderRadius: Radius.lg,
    ...Shadow.lg,
  },
  navCard: {
    minHeight: 200,
    borderRadius: Radius.lg,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 8,
  },
  navCardWatermark: {
    position: 'absolute',
    right: -16,
    bottom: -20,
  },
  navCardIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navCardTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 17,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  navCardSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 17,
  },
  navCardArrowPill: {
    marginTop: 4,
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wideCardWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
  wideCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  wideCardWatermark: { position: 'absolute', right: -18, bottom: -24 },

  suggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  suggestTitle: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, marginBottom: 2 },
  suggestSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, lineHeight: 16 },
});
