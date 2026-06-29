import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius, Gradients } from '@/constants/Colors';
import { dishIntro, dishCategories, funThingsToTry } from '@/constants/dishes';

export default function DishesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.eyebrow}>WHAT TO EAT</Text>
        <Text style={styles.title}>Dishes to try in Naples</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <Image source={require('@/assets/images/top10/dishes.jpeg')} style={styles.hero} resizeMode="cover" />
        <Text style={styles.intro}>{dishIntro}</Text>

        {dishCategories.map((cat) => (
          <View key={cat.id} style={styles.section}>
            <View style={styles.sectionHeadRow}>
              <View style={styles.sectionIcon}>
                <Ionicons name={cat.icon as any} size={17} color={Colors.white} />
              </View>
              <Text style={styles.sectionTitle}>{cat.title}</Text>
            </View>
            <View style={styles.card}>
              {cat.dishes.map((d, i) => (
                <View key={d.name} style={[styles.dishRow, i > 0 && styles.dishDivider]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dishName}>{d.name}</Text>
                    <Text style={styles.dishDesc}>{d.desc}</Text>
                  </View>
                  {d.tag ? (
                    <View style={styles.dishTag}>
                      <Text style={styles.dishTagText}>{d.tag}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Fun things to try */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <View style={[styles.sectionIcon, { backgroundColor: Colors.red }]}>
              <Ionicons name="sparkles" size={17} color={Colors.white} />
            </View>
            <Text style={styles.sectionTitle}>Only-in-Napoli</Text>
          </View>
          {funThingsToTry.map((d) => (
            <View key={d.name} style={styles.funCard}>
              <Text style={styles.dishName}>{d.name}</Text>
              <Text style={styles.dishDesc}>{d.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  title: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 26, color: Colors.gold },

  hero: { width: '100%', height: 150, marginTop: 0 },
  intro: { fontFamily: 'DMSans-Regular', fontSize: 14, lineHeight: 21, color: Colors.mid, paddingHorizontal: 18, paddingTop: 16 },

  section: { paddingHorizontal: 18, marginTop: 24 },
  sectionHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: Radius.md, backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center', ...Shadow.sm,
  },
  sectionTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 20, color: Colors.dark },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: 14, ...Shadow.sm },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  dishDivider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  dishName: { fontFamily: 'DMSans-Medium', fontSize: 14.5, color: Colors.dark },
  dishDesc: { fontFamily: 'DMSans-Regular', fontSize: 12.5, lineHeight: 17, color: Colors.mid, marginTop: 2 },
  dishTag: { backgroundColor: Colors.surfaceTint, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: Colors.cardBorder },
  dishTagText: { fontFamily: 'DMSans-Medium', fontSize: 10, color: Colors.mid },

  funCard: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14, marginBottom: 9, ...Shadow.sm },
});
