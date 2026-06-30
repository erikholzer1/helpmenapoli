import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import { usePremium } from '@/hooks/usePremium';

const PERKS = [
  { icon: 'calendar-outline',  text: 'All events — not just weekends' },
  { icon: 'list-outline',      text: 'Every Top 10 list unlocked' },
  { icon: 'language-outline',  text: 'Full language guide' },
  { icon: 'refresh-outline',   text: 'Updates forever — no subscription' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PaywallSheet({ visible, onClose }: Props) {
  const { unlock } = usePremium();

  async function handlePurchase() {
    // TODO: replace with real Apple IAP when App Store account is ready.
    // For now, tapping "Unlock" grants premium immediately.
    await unlock();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.iconWrap}>
          <Ionicons name="star" size={28} color={Colors.gold} />
        </View>
        <Text style={styles.title}>Unlock HelpMeNapoli</Text>
        <Text style={styles.sub}>One-time purchase — yours forever.</Text>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.text} style={styles.perk}>
              <Ionicons name={p.icon as any} size={18} color={Colors.gold} />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase} activeOpacity={0.85}>
          <Text style={styles.buyBtnText}>Unlock for $8</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16,
    alignItems: 'center',
    ...Shadow.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.light, marginBottom: 24,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.gold + '1A',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold', fontSize: 24,
    color: Colors.dark, marginBottom: 6,
  },
  sub: {
    fontFamily: 'DMSans-Regular', fontSize: 14,
    color: Colors.mid, marginBottom: 24,
  },
  perks: { width: '100%', gap: 14, marginBottom: 32 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkText: { fontFamily: 'DMSans-Regular', fontSize: 15, color: Colors.dark, flex: 1 },

  buyBtn: {
    width: '100%', backgroundColor: Colors.gold,
    borderRadius: Radius.pill, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  buyBtnText: { fontFamily: 'DMSans-Medium', fontSize: 17, color: Colors.dark },

  dismissBtn: { paddingVertical: 8 },
  dismissText: { fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.mid },
});
