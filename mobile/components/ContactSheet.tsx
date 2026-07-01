import { View, Text, TouchableOpacity, StyleSheet, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/Colors';

const WHATSAPP = '393331489589';
const EMAIL = 'help.me.napoli@gmail.com';

// For the simple ContactSheet (subject is a short topic string).
export function openWhatsApp(subject: string) {
  const msg = `Hi Erik! I'd like to ask about: ${subject}.`;
  Linking.openURL(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`).catch(() => {});
}
export function openEmail(subject: string) {
  const body = `Hi Erik,%0A%0A`;
  Linking.openURL(`mailto:${EMAIL}?subject=${encodeURIComponent('HelpMeNapoli — ' + subject)}&body=${body}`).catch(() => {});
}

// For BookingSheet / DriverSheet — message is already fully formatted.
export function sendWhatsApp(msg: string) {
  Linking.openURL(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`).catch(() => {});
}
export function sendEmail(subject: string, body: string) {
  Linking.openURL(`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`).catch(() => {});
}

// A bottom-sheet that lets the user reach Erik by WhatsApp or email.
// Open when `subject` is non-null; the subject seeds the prefilled message.
export default function ContactSheet({ subject, onClose }: { subject: string | null; onClose: () => void }) {
  return (
    <Modal visible={subject !== null} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>GET IN TOUCH</Text>
          <Text style={styles.title} numberOfLines={2}>{subject}</Text>
          <Text style={styles.sub}>How would you like to reach me?</Text>

          <TouchableOpacity style={[styles.choice, styles.wa]} activeOpacity={0.85} onPress={() => { openWhatsApp(subject ?? 'Hello'); onClose(); }}>
            <Ionicons name="logo-whatsapp" size={22} color={Colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.choiceTitle}>WhatsApp</Text>
              <Text style={styles.choiceSub}>+39 333 148 9859</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.choice, styles.email]} activeOpacity={0.85} onPress={() => { openEmail(subject ?? 'Hello'); onClose(); }}>
            <Ionicons name="mail" size={22} color={Colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.choiceTitle, { color: Colors.dark }]}>Email</Text>
              <Text style={[styles.choiceSub, { color: Colors.mid }]}>{EMAIL}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.mid} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,15,11,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 34, alignSelf: 'center', width: '100%', maxWidth: 520,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.cardBorder, marginBottom: 16 },
  eyebrow: { fontFamily: 'DMSans-Medium', fontSize: 11, letterSpacing: 2, color: Colors.goldDim, marginBottom: 4 },
  title: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 20, color: Colors.dark },
  sub: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid, marginTop: 4, marginBottom: 16 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: Radius.lg, padding: 16, marginBottom: 10 },
  wa: { backgroundColor: '#25D366' },
  email: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cardBorder },
  choiceTitle: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.white },
  choiceSub: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  cancel: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
  cancelText: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.mid },
});
