import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
  SectionList, ActivityIndicator, Image, Switch,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import {
  fetchUpcomingEvents, CATEGORY_META, CATEGORY_ORDER,
  type NaplesEvent, type EventCategory,
} from '@/lib/events';
import { usePremium } from '@/hooks/usePremium';
import PaywallSheet from '@/components/PaywallSheet';

// ─── date helpers ───────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// An event "occupies" every day from its start date through its end date.
function eventStart(e: NaplesEvent): Date { return parseDate(e.date); }
function eventEnd(e: NaplesEvent): Date { return parseDate(e.endDate ?? e.date); }

function isActiveOn(e: NaplesEvent, day: Date): boolean {
  return day >= eventStart(e) && day <= eventEnd(e);
}

function formatDateHeader(iso: string): string {
  const d = parseDate(iso);
  const today = startOfToday();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.getTime() === today.getTime())    return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatRangeLabel(e: NaplesEvent): string | null {
  if (!e.endDate || e.endDate === e.date) return null;
  const s = eventStart(e).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const en = eventEnd(e).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${s} – ${en}`;
}

// ─── filter model ─────────────────────────────────────────────────────────────

type DateRange = 'today' | 'weekend' | 'week' | 'all';

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: 'today',   label: 'Today' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'week',    label: 'This week' },
  { id: 'all',     label: 'All' },
];

// Returns [from, to] inclusive day-bounds for a range (or null for "all").
function rangeBounds(range: DateRange): [Date, Date] | null {
  const today = startOfToday();
  if (range === 'today') return [today, today];
  if (range === 'week') {
    const end = new Date(today); end.setDate(today.getDate() + 6);
    return [today, end];
  }
  if (range === 'weekend') {
    // Upcoming Sat–Sun. If today is already the weekend, use this one.
    const dow = today.getDay(); // 0 Sun … 6 Sat
    const sat = new Date(today);
    if (dow === 0) {            // Sunday → weekend is today only (Sat passed)
      return [today, today];
    }
    sat.setDate(today.getDate() + ((6 - dow + 7) % 7));
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return [sat, sun];
  }
  return null;
}

function inRange(e: NaplesEvent, range: DateRange): boolean {
  const bounds = rangeBounds(range);
  if (!bounds) return true; // "all"
  const [from, to] = bounds;
  // Active on any day within the window?
  return eventStart(e) <= to && eventEnd(e) >= from;
}

type Section = { title: string; isoDate: string; data: NaplesEvent[] };

// Groups filtered events by their start date (each event once), ascending.
function buildSections(events: NaplesEvent[]): Section[] {
  const byDay: Record<string, NaplesEvent[]> = {};
  for (const e of events) {
    // Group under today if the event is already running, else its start date.
    const today = startOfToday();
    const key = eventStart(e) < today ? today.toISOString().split('T')[0] : e.date;
    (byDay[key] ??= []).push(e);
  }
  return Object.keys(byDay)
    .sort()
    .map((iso) => ({ title: formatDateHeader(iso), isoDate: iso, data: byDay[iso] }));
}

// ─── components ───────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: EventCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <View style={[styles.catBadge, { backgroundColor: meta.color + '1A' }]}>
      <Ionicons name={meta.icon as any} size={10} color={meta.color} />
      <Text style={[styles.catLabel, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

function EventCard({ ev }: { ev: NaplesEvent }) {
  const range = formatRangeLabel(ev);
  const open = () => { if (ev.ticketUrl) Linking.openURL(ev.ticketUrl); };
  return (
    <TouchableOpacity style={styles.card} onPress={open} activeOpacity={0.85} disabled={!ev.ticketUrl}>
      {ev.imageUrl ? (
        <Image source={{ uri: ev.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : null}
      <View style={styles.cardLeft}>
        <View style={styles.cardTopRow}>
          <CategoryBadge category={ev.category} />
          {ev.free && (
            <View style={styles.freeBadge}><Text style={styles.freeText}>FREE</Text></View>
          )}
        </View>
        <Text style={styles.cardTitle}>{ev.title}</Text>
        {ev.venue ? (
          <View style={styles.cardMeta}>
            <Ionicons name="location-outline" size={11} color={Colors.mid} />
            <Text style={styles.cardMetaText} numberOfLines={1}>
              {ev.venue}{ev.area ? ` · ${ev.area}` : ''}
            </Text>
          </View>
        ) : null}
        {range ? (
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={11} color={Colors.mid} />
            <Text style={styles.cardMetaText}>{range}</Text>
          </View>
        ) : ev.time ? (
          <View style={styles.cardMeta}>
            <Ionicons name="time-outline" size={11} color={Colors.mid} />
            <Text style={styles.cardMetaText}>{ev.time}</Text>
          </View>
        ) : null}
        {ev.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{ev.description}</Text>
        ) : null}
        {!ev.free && ev.price ? <Text style={styles.cardPrice}>{ev.price}</Text> : null}
      </View>
      {ev.ticketUrl ? (
        <Ionicons name="open-outline" size={15} color={Colors.gold} style={{ marginTop: 2 }} />
      ) : null}
    </TouchableOpacity>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; events: NaplesEvent[] };

export default function EventsScreen() {
  const { isPremium } = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [range, setRange] = useState<DateRange>('weekend');
  const [activeCats, setActiveCats] = useState<Set<EventCategory>>(new Set());
  const [freeOnly, setFreeOnly] = useState(false);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const res = await fetchUpcomingEvents();
    if (res.ok) setState({ status: 'ready', events: res.events });
    else setState({ status: 'error', message: res.error });
  }, []);

  // WHY refetch on focus: project rule — events must never be older than 24h.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleCat = (c: EventCategory) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const renderFilters = () => (
    <View style={styles.filters}>
      {!isPremium && (
        <TouchableOpacity style={styles.upgradeBanner} onPress={() => setPaywallOpen(true)} activeOpacity={0.85}>
          <Ionicons name="star" size={14} color={Colors.gold} />
          <Text style={styles.upgradeBannerText}>Free: weekend events only — unlock all</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.gold} />
        </TouchableOpacity>
      )}
      {/* Date range — segmented */}
      <View style={styles.segment}>
        {DATE_RANGES.map((r) => {
          const locked = !isPremium && (r.id === 'today' || r.id === 'week' || r.id === 'all');
          const active = range === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.segmentBtn, active && styles.segmentBtnActive, locked && styles.segmentBtnLocked]}
              onPress={() => locked ? setPaywallOpen(true) : setRange(r.id)}
            >
              {locked && <Ionicons name="lock-closed" size={9} color={Colors.mid} style={{ marginRight: 3 }} />}
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          const active = activeCats.has(c);
          return (
            <TouchableOpacity
              key={c}
              style={[styles.chip, active && { backgroundColor: meta.color, borderColor: meta.color }]}
              onPress={() => toggleCat(c)}
            >
              <Ionicons name={meta.icon as any} size={12} color={active ? Colors.white : meta.color} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{meta.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Free-only — big, central, obvious */}
      <TouchableOpacity
        style={[styles.freeToggle, freeOnly && styles.freeToggleActive]}
        onPress={() => setFreeOnly((v) => !v)}
        activeOpacity={0.85}
      >
        <Ionicons
          name={freeOnly ? 'pricetag' : 'pricetag-outline'}
          size={18}
          color={freeOnly ? Colors.dark : Colors.gold}
        />
        <Text style={[styles.freeToggleText, freeOnly && styles.freeToggleTextActive]}>
          Free events only
        </Text>
        <Switch
          value={freeOnly}
          onValueChange={setFreeOnly}
          trackColor={{ false: Colors.cardBorder, true: Colors.dark }}
          thumbColor={Colors.white}
          ios_backgroundColor={Colors.cardBorder}
        />
      </TouchableOpacity>
    </View>
  );

  // ── states ──
  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.centerText}>Loading what's on…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header />
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={32} color={Colors.mid} />
          <Text style={styles.centerText}>{state.message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Ionicons name="refresh" size={15} color={Colors.dark} />
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveRange: DateRange = isPremium ? range : 'weekend';
  const filtered = state.events.filter((e) =>
    inRange(e, effectiveRange) &&
    (activeCats.size === 0 || activeCats.has(e.category)) &&
    (!freeOnly || e.free)
  );
  const sections = buildSections(filtered);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header />
      <PaywallSheet visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={renderFilters()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={28} color={Colors.mid} />
            <Text style={styles.emptyText}>Nothing matches these filters — try widening them.</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => <EventCard ev={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>THIS WEEK</Text>
      <Text style={styles.title}>What's On in Naples</Text>
      <Text style={styles.subtitle}>Events, gigs & markets — refreshed daily</Text>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10 },
  eyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2, color: Colors.goldDim, marginBottom: 3 },
  title: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24, color: Colors.dark },
  subtitle: { fontFamily: 'DMSans-Regular', fontSize: 11.5, color: Colors.mid, marginTop: 2 },

  // ── filters ──
  filters: { paddingTop: 6, paddingBottom: 4 },

  upgradeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.gold + '15', borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.gold + '40',
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
  },
  upgradeBannerText: {
    flex: 1, fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.dark,
  },

  segment: {
    flexDirection: 'row', backgroundColor: Colors.light,
    borderRadius: Radius.md, padding: 3, marginBottom: 12,
  },
  segmentBtn: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, borderRadius: 10 },
  segmentBtnActive: { backgroundColor: Colors.white, ...Shadow.sm },
  segmentBtnLocked: { opacity: 0.5 },
  segmentText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.mid },
  segmentTextActive: { color: Colors.dark },

  chipsRow: { flexGrow: 0, marginHorizontal: -14, marginBottom: 14 },
  chips: { paddingHorizontal: 14, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  chipText: { fontFamily: 'DMSans-Medium', fontSize: 12.5, color: Colors.dark },
  chipTextActive: { color: Colors.white },

  freeToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.gold,
    paddingVertical: 14, paddingHorizontal: 18, marginBottom: 14, ...Shadow.sm,
  },
  freeToggleActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  freeToggleText: { flex: 1, fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.dark },
  freeToggleTextActive: { color: Colors.dark },

  // ── day header ──
  dayHeader: { paddingVertical: 8, marginBottom: 4, marginTop: 8 },
  dayHeaderText: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 17, color: Colors.dark },

  // ── cards ──
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.md, padding: 13,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, ...Shadow.sm,
  },
  cardImage: { width: 64, height: 64, borderRadius: Radius.sm, backgroundColor: Colors.light },
  cardLeft: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardTitle: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, lineHeight: 19 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, flex: 1 },
  cardDesc: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, lineHeight: 16, marginTop: 2 },
  cardPrice: { fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.dark, marginTop: 2 },

  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3,
  },
  catLabel: { fontFamily: 'DMSans-Medium', fontSize: 10 },

  freeBadge: { backgroundColor: '#3E8E6B1A', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  freeText: { fontFamily: 'DMSans-Medium', fontSize: 10, color: '#3E8E6B' },

  // ── states ──
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  centerText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.mid, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.gold, borderRadius: Radius.pill, paddingHorizontal: 18, paddingVertical: 10,
  },
  retryText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },

  empty: { alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.mid, textAlign: 'center', paddingHorizontal: 24 },
});
