import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius, Gradients } from '@/constants/Colors';
import {
  transitIntro, tickets, transitSections, goodToKnow, NETWORK_MAP_URL, NETWORK_MAP_IMG,
  alerts, ferries, taxis, type TransitLine, type TransitSection,
} from '@/constants/transit';
import DriverSheet from '@/components/DriverSheet';

function open(url: string) {
  Linking.openURL(url).catch(() => {});
}

// Opens Google Maps with live transit directions from the user's current
// location to the destination — works on web and native, no API key.
function gmapsDir(dest: string) {
  open('https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' + encodeURIComponent(dest));
}

function LinkRow({ label, url, color }: { label: string; url: string; color: string }) {
  return (
    <TouchableOpacity style={styles.linkRow} activeOpacity={0.8} onPress={() => open(url)}>
      <Text style={[styles.linkRowText, { color }]}>{label}</Text>
      <Ionicons name="open-outline" size={13} color={color} />
    </TouchableOpacity>
  );
}

function LineCard({ line, color }: { line: TransitLine; color: string }) {
  return (
    <TouchableOpacity style={styles.lineCard} activeOpacity={0.85} onPress={() => open(line.url)}>
      <View style={styles.lineHead}>
        <View style={[styles.lineDot, { backgroundColor: color }]} />
        <Text style={styles.lineName}>{line.name}</Text>
        {line.tag ? (
          <View style={[styles.lineTag, { backgroundColor: line.tag === 'CLOSED' ? Colors.red : color }]}>
            <Text style={styles.lineTagText}>{line.tag}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.lineRoute}>{line.route}</Text>
      <View style={styles.lineMetaRow}>
        <Ionicons name="time-outline" size={13} color={Colors.mid} />
        <Text style={styles.lineMeta}>{line.hours}</Text>
      </View>
      {line.freq ? (
        <View style={styles.lineMetaRow}>
          <Ionicons name="repeat-outline" size={13} color={Colors.mid} />
          <Text style={styles.lineMeta}>{line.freq}</Text>
        </View>
      ) : null}
      {line.note ? <Text style={styles.lineNote}>{line.note}</Text> : null}
      {line.mapImage ? <Image source={line.mapImage} style={styles.lineMap} resizeMode="contain" /> : null}
      <View style={styles.lineLinkRow}>
        <Text style={[styles.lineLink, { color }]}>Official map & live times</Text>
        <Ionicons name="open-outline" size={13} color={color} />
      </View>
    </TouchableOpacity>
  );
}

function Section({ section }: { section: TransitSection }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeadRow}>
        <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
          <Ionicons name={section.icon as any} size={18} color={Colors.white} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionBlurb}>{section.blurb}</Text>
      {section.lines.map((line) => (
        <LineCard key={line.name} line={line} color={section.color} />
      ))}
    </View>
  );
}

export default function GetAroundScreen() {
  const router = useRouter();
  const [driverOpen, setDriverOpen] = useState(false);
  const FERRY = '#1C6E8C';
  const TAXI = '#C79A2E';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>GETTING AROUND NAPLES</Text>
        <Text style={styles.title}>Getting Around</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Request a driver — prominent CTA */}
        <TouchableOpacity style={styles.driverBanner} activeOpacity={0.88} onPress={() => setDriverOpen(true)}>
          <View style={styles.driverIconWrap}>
            <Ionicons name="car" size={22} color={Colors.dark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverBannerTitle}>Need a private driver?</Text>
            <Text style={styles.driverBannerSub}>Airport, port, day trips — door to door with Erik's trusted drivers.</Text>
          </View>
          <View style={styles.driverArrow}>
            <Ionicons name="arrow-forward" size={16} color={Colors.dark} />
          </View>
        </TouchableOpacity>

        {/* Official network map — first thing you see */}
        <View style={styles.mapWrap}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => open(NETWORK_MAP_URL)}>
            <Image source={{ uri: NETWORK_MAP_IMG }} style={styles.officialMap} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.mapCaptionRow}>
            <Text style={styles.mapCaption}>Official ANM metro, funicular & regional-rail map — tap to open full size.</Text>
            <TouchableOpacity onPress={() => router.push('/transit-map')} hitSlop={8}>
              <Text style={styles.mapOfficial}>Live map →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.intro}>{transitIntro}</Text>

        {/* Service alerts & strikes */}
        <View style={styles.alertCard}>
          <View style={styles.alertHead}>
            <Ionicons name="warning" size={17} color={Colors.red} />
            <Text style={styles.alertTitle}>Service alerts & strikes</Text>
          </View>
          <Text style={styles.alertText}>{alerts.intro}</Text>
          {alerts.links.map((l) => (
            <LinkRow key={l.url} label={l.label} url={l.url} color={Colors.red} />
          ))}
        </View>

        {/* Honesty note */}
        <View style={styles.noticePill}>
          <Ionicons name="information-circle" size={15} color={Colors.goldDim} />
          <Text style={styles.noticeText}>
            Hours, prices & schedules shift for holidays, works & season — tap any line for the official live info.
          </Text>
        </View>

        {/* Tickets */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHead}>
            <Ionicons name="ticket" size={18} color={Colors.gold} />
            <Text style={styles.ticketTitle}>{tickets.title}</Text>
          </View>
          {tickets.points.map((p, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{p}</Text>
            </View>
          ))}
          <LinkRow label="Fares & passes" url={tickets.url} color={Colors.goldDim} />
        </View>

        {/* Line sections */}
        {transitSections.map((s) => (
          <Section key={s.id} section={s} />
        ))}

        {/* Ferries */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <View style={[styles.sectionIcon, { backgroundColor: FERRY }]}>
              <Ionicons name="boat" size={18} color={Colors.white} />
            </View>
            <Text style={styles.sectionTitle}>Ferries to the islands & coast</Text>
          </View>
          <Text style={styles.sectionBlurb}>{ferries.intro}</Text>
          {ferries.ports.map((p) => (
            <View key={p.name} style={styles.lineCard}>
              <View style={styles.lineHead}>
                <View style={[styles.lineDot, { backgroundColor: FERRY }]} />
                <Text style={styles.lineName}>{p.name}</Text>
              </View>
              <Text style={styles.lineNote}>{p.desc}</Text>
              <View style={styles.ferryMetaRow}>
                <Ionicons name="navigate-outline" size={13} color={Colors.mid} />
                <Text style={styles.lineMeta}>{p.routes}</Text>
              </View>
              <View style={styles.ferryMetaRow}>
                <Ionicons name="business-outline" size={13} color={Colors.mid} />
                <Text style={styles.lineMeta}>{p.operators}</Text>
              </View>
              <TouchableOpacity
                style={styles.dirRow}
                activeOpacity={0.8}
                onPress={() => gmapsDir(p.name.split('—')[0].trim() + ', Napoli')}
              >
                <Ionicons name="navigate" size={13} color={FERRY} />
                <Text style={[styles.dirText, { color: FERRY }]}>Directions in Google Maps</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.crossingCard}>
            <Text style={styles.crossingTitle}>Typical crossings from Naples</Text>
            {ferries.crossings.map((c) => (
              <View key={c.to} style={styles.crossingRow}>
                <Text style={styles.crossingTo}>{c.to}</Text>
                <Text style={styles.crossingTime}>{c.time}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.ferryNote}>{ferries.note}</Text>
          <View style={styles.linkWrapRow}>
            {ferries.links.map((l) => (
              <TouchableOpacity key={l.url} style={styles.chipLink} activeOpacity={0.8} onPress={() => open(l.url)}>
                <Text style={styles.chipLinkText}>{l.label}</Text>
                <Ionicons name="open-outline" size={12} color={FERRY} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Taxis & ride apps */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <View style={[styles.sectionIcon, { backgroundColor: TAXI }]}>
              <Ionicons name="car" size={18} color={Colors.white} />
            </View>
            <Text style={styles.sectionTitle}>Taxis & ride apps</Text>
          </View>
          <Text style={styles.sectionBlurb}>{taxis.intro}</Text>
          <View style={styles.ticketCard}>
            {taxis.tips.map((t, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: TAXI }]} />
                <Text style={styles.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
          {taxis.apps.map((a) => (
            <View key={a.name} style={styles.appCard}>
              <Text style={styles.appName}>{a.name}</Text>
              <Text style={styles.appDesc}>{a.desc}</Text>
            </View>
          ))}
        </View>

        {/* Good to know */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.warmer }]}>
              <Ionicons name="bulb" size={18} color={Colors.gold} />
            </View>
            <Text style={styles.sectionTitle}>Good to know</Text>
          </View>
          {goodToKnow.map((g) => (
            <TouchableOpacity key={g.label} style={styles.infoCard} activeOpacity={0.85} onPress={() => open(g.url)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{g.label}</Text>
                <Text style={styles.infoDesc}>{g.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.faint} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>
          Operated by ANM, Trenitalia, EAV & the ferry lines under the UnicoCampania fare system. Times & prices verified from official sources June 2026 — always reconfirm on the day.
        </Text>
      </ScrollView>

      <DriverSheet visible={driverOpen} onClose={() => setDriverOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingTop: 14, paddingBottom: 22, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  eyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2.5, color: Colors.goldSoft, marginBottom: 4 },
  title: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 28, color: Colors.gold },

  driverBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: Colors.gold, borderRadius: Radius.lg,
    padding: 16, ...Shadow.md,
  },
  driverIconWrap: {
    width: 46, height: 46, borderRadius: Radius.md,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  driverBannerTitle: { fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.dark, marginBottom: 2 },
  driverBannerSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: 'rgba(26,20,16,0.7)', lineHeight: 16 },
  driverArrow: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center',
  },

  mapWrap: { marginHorizontal: 16, marginTop: 16 },
  officialMap: { width: '100%', height: 220, borderRadius: 16, backgroundColor: Colors.surface },
  mapCaptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 10 },
  mapCaption: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.faint, lineHeight: 15 },
  mapOfficial: { fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.goldDim },

  intro: { fontFamily: 'DMSans-Regular', fontSize: 14, lineHeight: 21, color: Colors.mid, paddingHorizontal: 18, paddingTop: 18 },

  alertCard: {
    marginHorizontal: 18, marginTop: 16, padding: 16,
    backgroundColor: '#FBEEEC', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(200,57,43,0.22)',
  },
  alertHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.red },
  alertText: { fontFamily: 'DMSans-Regular', fontSize: 13, lineHeight: 19, color: Colors.warm, marginBottom: 6 },

  noticePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 18, marginTop: 14, paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: Colors.surfaceTint, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  noticeText: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 12, lineHeight: 16, color: Colors.mid },

  ticketCard: {
    marginHorizontal: 18, marginTop: 16, padding: 16,
    backgroundColor: Colors.surface, borderRadius: Radius.lg, ...Shadow.sm,
  },
  ticketHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ticketTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 18, color: Colors.dark },
  bulletRow: { flexDirection: 'row', gap: 9, marginBottom: 9 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.gold, marginTop: 7 },
  bulletText: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 13, lineHeight: 19, color: Colors.warm },

  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  linkRowText: { fontFamily: 'DMSans-Medium', fontSize: 13 },

  section: { paddingHorizontal: 18, marginTop: 28 },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  sectionIcon: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  sectionTitle: { flex: 1, fontFamily: 'PlayfairDisplay-Bold', fontSize: 20, color: Colors.dark },
  sectionBlurb: { fontFamily: 'DMSans-Regular', fontSize: 13, lineHeight: 19, color: Colors.mid, marginBottom: 12 },

  lineCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14, marginBottom: 10, ...Shadow.sm },
  lineHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  lineDot: { width: 9, height: 9, borderRadius: 5 },
  lineName: { flex: 1, fontFamily: 'DMSans-Medium', fontSize: 16, color: Colors.dark },
  lineTag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.pill },
  lineTagText: { fontFamily: 'DMSans-Medium', fontSize: 10, color: Colors.white, letterSpacing: 0.3 },
  lineRoute: { fontFamily: 'DMSans-Regular', fontSize: 13, lineHeight: 19, color: Colors.warm, marginBottom: 7 },
  lineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  lineMeta: { flex: 1, fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.mid },
  lineNote: { fontFamily: 'DMSans-Regular', fontSize: 12, lineHeight: 17, color: Colors.faint, marginTop: 4 },
  lineMap: { width: '100%', height: 180, borderRadius: Radius.md, marginTop: 10, backgroundColor: Colors.surfaceTint },
  lineLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  lineLink: { fontFamily: 'DMSans-Medium', fontSize: 12 },

  ferryMetaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  dirRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  dirText: { fontFamily: 'DMSans-Medium', fontSize: 12 },
  crossingCard: {
    backgroundColor: Colors.surfaceTint, borderRadius: Radius.md, padding: 14, marginTop: 2, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  crossingTitle: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.dark, marginBottom: 8 },
  crossingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  crossingTo: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.warm },
  crossingTime: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid },
  ferryNote: { fontFamily: 'DMSans-Regular', fontSize: 12, lineHeight: 17, color: Colors.faint, marginBottom: 10 },
  linkWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipLink: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surface, borderRadius: Radius.pill,
    paddingVertical: 7, paddingHorizontal: 12, ...Shadow.sm,
  },
  chipLinkText: { fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.dark },

  appCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 13, marginBottom: 9, ...Shadow.sm },
  appName: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, marginBottom: 2 },
  appDesc: { fontFamily: 'DMSans-Regular', fontSize: 12, lineHeight: 17, color: Colors.mid },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14, marginBottom: 9, ...Shadow.sm,
  },
  infoLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, marginBottom: 2 },
  infoDesc: { fontFamily: 'DMSans-Regular', fontSize: 12, lineHeight: 17, color: Colors.mid },

  footer: {
    fontFamily: 'DMSans-Light', fontSize: 11, lineHeight: 16, color: Colors.faint,
    textAlign: 'center', paddingHorizontal: 28, marginTop: 28,
  },
});
