import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';

type ServiceType = {
  id: string;
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  features: string[];
  startingFrom?: string;
};

const services: ServiceType[] = [
  {
    id: 'transfer',
    title: 'Airport transfer',
    description: 'Private car from Naples Capodichino airport to your hotel or anywhere in the city. Flight tracking included — your driver adjusts if you land early or late.',
    iconName: 'car-outline',
    features: ['Fixed price', 'Meet & greet at arrivals', 'Flight tracking', 'Child seats available'],
    startingFrom: '€35',
  },
  {
    id: 'boat',
    title: 'Boat rental',
    description: 'Rent a private boat for a half-day or full day. Explore the Amalfi Coast, Capri, Procida, or just anchor in a quiet cove in the bay.',
    iconName: 'boat-outline',
    features: ['Skippered or bareboat', 'Capri & Amalfi day trips', 'Up to 8 people', 'Swimming & snorkelling stops'],
    startingFrom: '€350 half-day',
  },
  {
    id: 'fishing',
    title: 'Fishing charter',
    description: 'Full and half-day fishing trips on the Bay of Naples with experienced local fishermen. Spinning, bottom fishing, and trolling for sea bass, bream, and amberjack.',
    iconName: 'fish-outline',
    features: ['All gear provided', 'Experienced local guides', 'Up to 6 people', 'Early morning departures'],
    startingFrom: '€120 half-day',
  },
  {
    id: 'driver',
    title: 'Private driver (day)',
    description: 'A local English-speaking driver for the full day. Perfect for Pompeii, the Amalfi Coast, or any custom itinerary — he knows where to park, which back roads to take, and the best lunch stops.',
    iconName: 'map-outline',
    features: ['English-speaking driver', 'Custom itinerary', 'Local knowledge', 'Up to 6 passengers'],
    startingFrom: '€200 full day',
  },
  {
    id: 'concierge',
    title: 'Concierge & reservations',
    description: 'Can\'t get a table at a restaurant you want? Need a hard-to-find ticket or a last-minute arrangement? Erik\'s local network opens doors that are closed to visitors.',
    iconName: 'key-outline',
    features: ['Restaurant reservations', 'Event tickets', 'Local contacts', 'One-off requests welcome'],
  },
];

type RequestFormProps = {
  service: ServiceType;
  onClose: () => void;
};

function RequestForm({ service, onClose }: RequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit() {
    if (!name || !email) {
      Alert.alert('Missing info', 'Please add your name and email so we can get back to you.');
      return;
    }
    const body = `Service: ${service.title}%0AName: ${name}%0AEmail: ${email}%0ADate: ${date}%0AGuests: ${guests}%0ANotes: ${notes}`;
    Linking.openURL(`mailto:erikholzer1@gmail.com?subject=HelpMeNapoli — ${service.title}&body=${body}`);
    onClose();
  }

  return (
    <View style={formStyles.overlay}>
      <View style={formStyles.sheet}>
        <View style={formStyles.sheetHeader}>
          <Text style={formStyles.sheetTitle}>{service.title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={Colors.mid} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={formStyles.formBody}>
          <Text style={formStyles.label}>Your name</Text>
          <TextInput style={formStyles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.mid} />

          <Text style={formStyles.label}>Email address</Text>
          <TextInput style={formStyles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={Colors.mid} keyboardType="email-address" autoCapitalize="none" />

          <Text style={formStyles.label}>Preferred date</Text>
          <TextInput style={formStyles.input} value={date} onChangeText={setDate} placeholder="e.g. July 15th" placeholderTextColor={Colors.mid} />

          <Text style={formStyles.label}>Number of people</Text>
          <TextInput style={formStyles.input} value={guests} onChangeText={setGuests} placeholder="How many guests?" placeholderTextColor={Colors.mid} keyboardType="number-pad" />

          <Text style={formStyles.label}>Any additional notes</Text>
          <TextInput
            style={[formStyles.input, formStyles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Special requests, arrival details, etc."
            placeholderTextColor={Colors.mid}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={formStyles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={formStyles.submitText}>Send request</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>

          <Text style={formStyles.replyNote}>
            Erik typically replies within a few hours. You can also reach him on WhatsApp.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

export default function BookScreen() {
  const [requestService, setRequestService] = useState<ServiceType | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>ARRANGED FOR YOU</Text>
        <Text style={styles.headerTitle}>Book a service</Text>
        <Text style={styles.headerSub}>Transfers, boats, charters & more</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {services.map((s) => (
          <View key={s.id} style={styles.serviceCard}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name={s.iconName} size={20} color="#3E8E6B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{s.title}</Text>
                {s.startingFrom ? (
                  <Text style={styles.serviceFrom}>From {s.startingFrom}</Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.serviceDesc}>{s.description}</Text>
            <View style={styles.featuresGrid}>
              {s.features.map((f) => (
                <View key={f} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={12} color="#3E8E6B" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.requestBtn}
              onPress={() => setRequestService(s)}
              activeOpacity={0.8}
            >
              <Text style={styles.requestBtnText}>Request this service</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.whatsappCard}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <View style={{ flex: 1 }}>
            <Text style={styles.whatsappTitle}>Prefer WhatsApp?</Text>
            <Text style={styles.whatsappSub}>Message Erik directly for a quick response</Text>
          </View>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL('https://wa.me/message/helpmenapoli')}
          >
            <Text style={styles.whatsappBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {requestService ? (
        <RequestForm service={requestService} onClose={() => setRequestService(null)} />
      ) : null}
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

  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 14,
    ...Shadow.md,
  },
  serviceCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E1F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceTitle: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.dark },
  serviceFrom: { fontFamily: 'DMSans-Regular', fontSize: 11, color: '#3E8E6B', marginTop: 1 },
  serviceDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.mid,
    lineHeight: 19,
    marginBottom: 12,
  },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '47%' },
  featureText: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.dark,
    borderRadius: Radius.pill,
    paddingVertical: 12,
  },
  requestBtnText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.white },

  whatsappCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginTop: 4,
    ...Shadow.sm,
  },
  whatsappTitle: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },
  whatsappSub: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.mid, marginTop: 1 },
  whatsappBtn: {
    backgroundColor: '#25D366',
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  whatsappBtnText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.white },
});

const formStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 18, color: Colors.dark },
  formBody: { padding: 16, paddingBottom: 40 },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: Colors.warm,
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.dark,
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  submitText: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.white },
  replyNote: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: Colors.mid,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
