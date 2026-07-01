import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  TextInput, Pressable,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import { sendWhatsApp, sendEmail } from './ContactSheet';

type Answers = Record<string, string>;

const ERIK_PHONE = '393331489589'; // Italian format, no +

function buildDriverMessage(a: Answers): string {
  const lines = [
    '🚗 *DRIVER REQUEST — HelpMeNapoli*',
    '',
    `Name: ${a.name || '—'}`,
    `Date: ${a.date || '—'}`,
    `Time: ${a.time || '—'}`,
    `From: ${a.from || '—'}`,
    `To: ${a.to || '—'}`,
    `Service: ${a.service || '—'}`,
    `Luggage: ${a.luggage || '—'}`,
  ];
  if (a.flight_info) lines.push(`Flight / ferry / train: ${a.flight_info}`);
  if (a.notes) lines.push(`Notes: ${a.notes}`);
  lines.push('', 'Please confirm availability and price. Thanks!');
  return lines.join('\n');
}

function SelectRow({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label} *</Text>
      <View style={styles.chips}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, value === opt && styles.chipActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function InputRow({ label, placeholder, value, onChange, required }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={Colors.faint}
      />
    </View>
  );
}

type Props = { visible: boolean; onClose: () => void };

export default function DriverSheet({ visible, onClose }: Props) {
  const [a, setA] = useState<Answers>({});
  function set(k: string, v: string) { setA((p) => ({ ...p, [k]: v })); }
  function reset() { setA({}); }
  function handleClose() { reset(); onClose(); }

  const required = ['name', 'date', 'time', 'from', 'to', 'service', 'luggage'];
  const canSend = required.every((k) => (a[k] || '').trim().length > 0);

  function send(channel: 'whatsapp' | 'email') {
    const msg = buildDriverMessage(a);
    if (channel === 'whatsapp') sendWhatsApp(msg);
    else sendEmail('Driver request — HelpMeNapoli', msg);
    handleClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>PRIVATE TRANSFER</Text>
            <Text style={styles.title}>Request a Driver</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.mid} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <InputRow label="Your name"    required value={a.name   ?? ''} onChange={(v) => set('name', v)}   placeholder="First name is fine" />
          <InputRow label="Date"         required value={a.date   ?? ''} onChange={(v) => set('date', v)}   placeholder="e.g. 14 July" />
          <InputRow label="Time"         required value={a.time   ?? ''} onChange={(v) => set('time', v)}   placeholder="e.g. 09:00, afternoon" />
          <InputRow label="From (pickup)"required value={a.from   ?? ''} onChange={(v) => set('from', v)}   placeholder="Address, hotel name, airport…" />
          <InputRow label="To (drop-off)"required value={a.to     ?? ''} onChange={(v) => set('to', v)}     placeholder="Address, hotel name, port…" />

          <SelectRow
            label="Service type"
            options={['Drop-off / one way', 'Half-day driver (4h)', 'Full-day driver (8h)']}
            value={a.service ?? ''}
            onChange={(v) => set('service', v)}
          />

          <SelectRow
            label="Luggage"
            options={['None', 'Hand luggage only', '1–2 bags', '3+ bags / bulky']}
            value={a.luggage ?? ''}
            onChange={(v) => set('luggage', v)}
          />

          <InputRow
            label="Flight / ferry / train info"
            value={a.flight_info ?? ''}
            onChange={(v) => set('flight_info', v)}
            placeholder="e.g. EasyJet U2 1234 arriving 11:30 — optional"
          />
          <InputRow
            label="Anything else?"
            value={a.notes ?? ''}
            onChange={(v) => set('notes', v)}
            placeholder="Car seats, accessibility, extra stops…"
          />

          <Text style={styles.requiredNote}>* Required</Text>
        </ScrollView>

        <View style={styles.sendRow}>
          <TouchableOpacity
            style={[styles.sendBtn, styles.sendWa, !canSend && styles.disabled]}
            onPress={() => send('whatsapp')}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.sendBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, styles.sendEmail, !canSend && styles.disabled]}
            onPress={() => send('email')}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            <Ionicons name="mail" size={18} color={Colors.gold} />
            <Text style={[styles.sendBtnText, { color: Colors.dark }]}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', paddingBottom: 32,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.cardBorder, marginTop: 12, marginBottom: 4 },

  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  eyebrow: { fontFamily: 'DMSans-Medium', fontSize: 10, letterSpacing: 2, color: Colors.goldDim, marginBottom: 2 },
  title: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 22, color: Colors.dark },
  closeBtn: { padding: 4, marginTop: 2 },

  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },

  field: { marginBottom: 18 },
  label: { fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.mid, marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.dark,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radius.pill, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.dark },
  chipTextActive: { color: Colors.dark },

  requiredNote: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.faint, marginTop: 4 },

  sendRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 8 },
  sendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.pill, paddingVertical: 15,
  },
  disabled: { opacity: 0.4 },
  sendWa: { backgroundColor: '#25D366' },
  sendEmail: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.cardBorder },
  sendBtnText: { fontFamily: 'DMSans-Medium', fontSize: 15, color: '#fff' },
});
