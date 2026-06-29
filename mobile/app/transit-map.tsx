import { View, Text, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/Colors';
import TransitMap from '@/components/TransitMap';

const { height } = Dimensions.get('window');

// Full-screen interactive network map — reached from the Getting Around screen.
// Pinch to zoom; the ◎ button drops a "you are here" pin using device location.
export default function TransitMapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Network map</Text>
        <TouchableOpacity
          style={styles.gmapBtn}
          activeOpacity={0.85}
          onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&travelmode=transit').catch(() => {})}
        >
          <Ionicons name="navigate" size={14} color={Colors.white} />
          <Text style={styles.gmapText}>Google Maps</Text>
        </TouchableOpacity>
      </View>

      <TransitMap height={height - 150} />

      <Text style={styles.hint}>
        Pinch to zoom · tap a stop for its name · tap ◎ to find your location.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.pill,
    backgroundColor: Colors.light, alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: 'PlayfairDisplay-Bold', fontSize: 20, color: Colors.dark },
  gmapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1976D2', borderRadius: Radius.pill,
    paddingVertical: 8, paddingHorizontal: 13,
  },
  gmapText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.white },
  hint: {
    fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.faint,
    textAlign: 'center', paddingHorizontal: 24, paddingTop: 10,
  },
});
