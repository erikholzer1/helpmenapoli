import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import { discoverLists, type DiscoverList, type Spot } from '@/constants/discover';
import { topImages } from '@/constants/topImages';
import Map from '@/components/Map';

const SCRIM = ['rgba(26,20,16,0.45)', 'rgba(26,20,16,0)', 'rgba(26,20,16,0.82)'] as const;
const BANNER_SCRIM = ['rgba(26,20,16,0.15)', 'rgba(26,20,16,0)', 'rgba(26,20,16,0.82)'] as const;

function openInMaps(spot: Spot) {
  const q = encodeURIComponent(`${spot.name} Napoli`);
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
}

function CategoryCard({ list, onPress }: { list: DiscoverList; onPress: () => void }) {
  const ready = list.items.length > 0;
  const photo = topImages[list.id];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {photo ? <Image source={photo} style={styles.fill} resizeMode="cover" /> : null}
      <LinearGradient colors={SCRIM} locations={[0, 0.4, 1]} style={styles.cardScrim}>
        <View style={[styles.badge, ready ? styles.badgeReady : styles.badgeSoon]}>
          <Text style={[styles.badgeText, ready ? styles.badgeTextReady : styles.badgeTextSoon]}>
            {ready ? 'TOP 10' : 'SOON'}
          </Text>
        </View>
        <Text style={styles.cardLabel}>{list.label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SpotRow({ spot }: { spot: Spot }) {
  return (
    <TouchableOpacity style={styles.spot} onPress={() => openInMaps(spot)} activeOpacity={0.7}>
      <View style={[styles.rank, spot.rank <= 3 && styles.rankTop]}>
        <Text style={[styles.rankText, spot.rank <= 3 && styles.rankTextTop]}>{spot.rank}</Text>
      </View>
      <View style={styles.spotBody}>
        <View style={styles.spotNameRow}>
          <Text style={styles.spotName}>{spot.name}</Text>
          {spot.tag ? <View style={styles.spotTag}><Text style={styles.spotTagText}>{spot.tag}</Text></View> : null}
        </View>
        {spot.area ? (
          <View style={styles.areaRow}>
            <Ionicons name="location-outline" size={11} color={Colors.mid} />
            <Text style={styles.areaText}>{spot.area}</Text>
          </View>
        ) : null}
        {spot.description ? <Text style={styles.spotDesc}>{spot.description}</Text> : null}
      </View>
      <Ionicons name="map-outline" size={16} color={Colors.gold} />
    </TouchableOpacity>
  );
}

function ListDetail({ list, onBack }: { list: DiscoverList; onBack: () => void }) {
  const points = list.items.map((i) => ({ name: i.name, lat: i.lat, lng: i.lng }));
  const photo = topImages[list.id];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.detailTitle} numberOfLines={1}>{list.label}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          {photo ? <Image source={photo} style={styles.fill} resizeMode="cover" /> : null}
          <LinearGradient colors={BANNER_SCRIM} locations={[0, 0.4, 1]} style={styles.bannerScrim}>
            <Text style={styles.bannerBlurb}>{list.blurb}</Text>
          </LinearGradient>
        </View>

        {points.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>On the map</Text>
            <Map points={points} height={200} />
            <Text style={styles.mapHint}>Neighbourhoods & pins are approximate — tap a spot for its exact Maps location.</Text>
            <View style={{ height: 8 }} />
            {list.items.map((s) => <SpotRow key={`${s.rank}-${s.name}`} spot={s} />)}
            {list.note ? (
              <View style={styles.noteCard}>
                <Ionicons name="bulb-outline" size={15} color={Colors.gold} />
                <Text style={styles.noteText}>{list.note}</Text>
              </View>
            ) : null}
            <Text style={styles.verifyNote}>Neighbourhoods and pins are still being verified by a local — the Maps tap-through is always exact.</Text>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={26} color={Colors.mid} />
            <Text style={styles.emptyText}>We’re curating this top 10 — check back soon.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [group, setGroup] = useState<'food' | 'activity'>('food');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? discoverLists.find((l) => l.id === selectedId) ?? null : null;
  if (selected) return <ListDetail list={selected} onBack={() => setSelectedId(null)} />;

  const leftSub = group === 'food' ? 'food' : 'day';
  const rightSub = group === 'food' ? 'drink' : 'night';
  const left = discoverLists.filter((l) => l.group === group && l.sub === leftSub);
  const right = discoverLists.filter((l) => l.group === group && l.sub === rightSub);
  const leftTitle = group === 'food' ? 'Food' : 'Day-time';
  const rightTitle = group === 'food' ? 'Drink' : 'Night-life';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>CURATED BY LOCALS</Text>
        <Text style={styles.headerTitle}>Top 10 Naples lists</Text>
        <Text style={styles.headerSub}>Food, drinks & things to do</Text>
      </View>

      <View style={styles.segment}>
        <TouchableOpacity style={[styles.segmentBtn, group === 'food' && styles.segmentBtnActive]} onPress={() => setGroup('food')}>
          <Ionicons name="restaurant-outline" size={15} color={group === 'food' ? Colors.white : Colors.mid} />
          <Text style={[styles.segmentText, group === 'food' && styles.segmentTextActive]}>Food & drink</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, group === 'activity' && styles.segmentBtnActive]} onPress={() => setGroup('activity')}>
          <Ionicons name="compass-outline" size={15} color={group === 'activity' ? Colors.white : Colors.mid} />
          <Text style={[styles.segmentText, group === 'activity' && styles.segmentTextActive]}>Activities</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.dishBanner} activeOpacity={0.9} onPress={() => router.push('/dishes')}>
          <LinearGradient colors={['#C8392B', '#7A1C15'] as const} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dishBannerInner}>
            <Ionicons name="restaurant" size={72} color="rgba(255,255,255,0.12)" style={styles.dishBannerWatermark} />
            <View style={styles.dishBannerIcon}>
              <Ionicons name="restaurant" size={20} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dishBannerTitle}>What to eat in Naples</Text>
              <Text style={styles.dishBannerSub}>The dishes to try, course by course</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.colHeader}>{leftTitle}</Text>
            {left.map((list) => <CategoryCard key={list.id} list={list} onPress={() => setSelectedId(list.id)} />)}
          </View>
          <View style={styles.column}>
            <Text style={styles.colHeader}>{rightTitle}</Text>
            {right.map((list) => <CategoryCard key={list.id} list={list} onPress={() => setSelectedId(list.id)} />)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10 },
  headerEyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2, color: Colors.goldDim, marginBottom: 3 },
  headerTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24, color: Colors.dark },
  headerSub: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: Colors.mid, marginTop: 2 },

  segment: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  segmentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.cardBorder, backgroundColor: Colors.white,
  },
  segmentBtnActive: { backgroundColor: Colors.dark, borderColor: Colors.dark },
  segmentText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.mid },
  segmentTextActive: { color: Colors.white },

  dishBanner: { borderRadius: Radius.lg, marginBottom: 14, ...Shadow.md },
  dishBannerInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: Radius.lg, overflow: 'hidden',
  },
  dishBannerWatermark: { position: 'absolute', right: -8, bottom: -16 },
  dishBannerIcon: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  dishBannerTitle: {
    fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  dishBannerSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  columns: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  column: { flex: 1, gap: 10 },
  colHeader: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 16, color: Colors.dark, marginBottom: 2 },

  card: {
    width: '100%', height: 116, borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: Colors.warm, ...Shadow.md,
  },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  cardScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', padding: 9 },
  badge: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeReady: { backgroundColor: Colors.gold },
  badgeSoon: { backgroundColor: 'rgba(255,255,255,0.85)' },
  badgeText: { fontFamily: 'DMSans-Medium', fontSize: 9, letterSpacing: 0.6 },
  badgeTextReady: { color: Colors.dark },
  badgeTextSoon: { color: Colors.mid },
  cardLabel: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 15, color: Colors.white, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  detailHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.divider,
  },
  backBtn: { padding: 2 },
  detailTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 18, color: Colors.dark, flex: 1 },

  banner: { height: 160, marginBottom: 16, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.warm, ...Shadow.md },
  bannerScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', padding: 14 },
  bannerBlurb: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.white, lineHeight: 19 },

  sectionLabel: { fontFamily: 'DMSans-Medium', fontSize: 11, color: Colors.mid, letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' },
  mapHint: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, marginTop: 6 },

  spot: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.white,
    borderRadius: Radius.md, padding: 13, marginBottom: 10, ...Shadow.sm,
  },
  rank: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.light, alignItems: 'center', justifyContent: 'center' },
  rankTop: { backgroundColor: Colors.gold },
  rankText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.mid },
  rankTextTop: { color: Colors.dark },
  spotBody: { flex: 1 },
  spotNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  spotName: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },
  spotTag: { backgroundColor: Colors.cream, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  spotTagText: { fontFamily: 'DMSans-Regular', fontSize: 10, color: '#3E8E6B' },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  areaText: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid },
  spotDesc: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginTop: 3, lineHeight: 16 },

  noteCard: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Colors.light, borderRadius: 12, padding: 12, marginTop: 4 },
  noteText: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.warm, lineHeight: 17 },

  verifyNote: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  empty: { alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.mid, textAlign: 'center' },
});
