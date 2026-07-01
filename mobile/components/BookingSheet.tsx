import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  TextInput, Pressable, Linking,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Radius } from '@/constants/Colors';
import {
  type Experience, type FixedDate, type BookingField,
  REQUEST_DATE_FIELDS,
} from '@/constants/experiences';
import { sendWhatsApp, sendEmail } from './ContactSheet';

// ─── message builders ─────────────────────────────────────────────────────────

function buildInquiryMessage(expTitle: string, fields: BookingField[], answers: Record<string, string>): string {
  const lines = [`Hi Erik! I'd like to request: *${expTitle}*`, ''];
  fields.forEach((f) => {
    const val = f.type === 'number'
      ? (answers[f.id] || String(f.min ?? 1))
      : (answers[f.id] || '');
    if (val) lines.push(`• ${f.label}: ${val}`);
  });
  lines.push('', 'Please send me details on how to confirm and pay. Thanks!');
  return lines.join('\n');
}

function buildDateRequestMessage(expTitle: string, fields: BookingField[], answers: Record<string, string>): string {
  const lines = [`📅 *DATE REQUEST — ${expTitle}*`, ''];
  fields.forEach((f) => {
    const val = f.type === 'number' ? (answers[f.id] || String((f as any).min ?? 1)) : (answers[f.id] || '');
    if (val) lines.push(`• ${f.label}: ${val}`);
  });
  lines.push('', "I'd love to join when you set a date — please keep me posted!");
  return lines.join('\n');
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DatePicker({ dates, selected, onSelect }: {
  dates: FixedDate[]; selected: FixedDate | null; onSelect: (d: FixedDate) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Choose a date</Text>
      {dates.map((d) => {
        const active = selected?.iso === d.iso;
        return (
          <TouchableOpacity key={d.iso} style={[styles.dateRow, active && styles.dateRowActive]} onPress={() => onSelect(d)} activeOpacity={0.8}>
            <View style={[styles.dateRadio, active && styles.dateRadioActive]}>
              {active && <View style={styles.dateRadioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dateLabel, active && styles.dateLabelActive]}>{d.label}</Text>
              {d.description ? <Text style={styles.dateDesc}>{d.description}</Text> : null}
              {d.spotsLeft !== undefined ? (
                <Text style={styles.spotsLeft}>{d.spotsLeft} spot{d.spotsLeft !== 1 ? 's' : ''} left</Text>
              ) : null}
            </View>
            {d.whatsappGroup ? <Ionicons name="logo-whatsapp" size={16} color="#25D366" /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PeoplePicker({ value, onChange, min = 1, max = 20 }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Number of people</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]} onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
          <Ionicons name="remove" size={20} color={value <= min ? Colors.faint : Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]} onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
          <Ionicons name="add" size={20} color={value >= max ? Colors.faint : Colors.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FieldInput({ field, value, onChange }: { field: BookingField; value: string; onChange: (v: string) => void }) {
  if (field.type === 'number') {
    const num = parseInt(value) || field.min || 1;
    const min = field.min ?? 1;
    const max = field.max ?? 20;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{field.label}{field.required ? ' *' : ''}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={[styles.stepBtn, num <= min && styles.stepBtnDisabled]} onPress={() => onChange(String(Math.max(min, num - 1)))} disabled={num <= min}>
            <Ionicons name="remove" size={20} color={num <= min ? Colors.faint : Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.stepValue}>{num}</Text>
          <TouchableOpacity style={[styles.stepBtn, num >= max && styles.stepBtnDisabled]} onPress={() => onChange(String(Math.min(max, num + 1)))} disabled={num >= max}>
            <Ionicons name="add" size={20} color={num >= max ? Colors.faint : Colors.dark} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (field.type === 'select') {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{field.label}{field.required ? ' *' : ''}</Text>
        <View style={styles.selectGrid}>
          {field.options.map((opt) => (
            <TouchableOpacity key={opt} style={[styles.selectChip, value === opt && styles.selectChipActive]} onPress={() => onChange(opt)} activeOpacity={0.8}>
              <Text style={[styles.selectChipText, value === opt && styles.selectChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{field.label}{field.required ? ' *' : ''}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={'placeholder' in field ? field.placeholder : ''}
        placeholderTextColor={Colors.faint}
        multiline
      />
    </View>
  );
}

// ─── main sheet ───────────────────────────────────────────────────────────────

type SheetMode = 'choose' | 'public' | 'private' | 'request-date';
type Props = { exp: Experience | null; onClose: () => void };

export default function BookingSheet({ exp, onClose }: Props) {
  const [mode, setMode] = useState<SheetMode>('choose');
  const [selectedDate, setSelectedDate] = useState<FixedDate | null>(null);
  const [people, setPeople] = useState(2);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function reset() { setMode('choose'); setSelectedDate(null); setPeople(2); setAnswers({}); }
  function handleClose() { reset(); onClose(); }
  function setAnswer(id: string, val: string) { setAnswers((p) => ({ ...p, [id]: val })); }

  function submit(channel: 'whatsapp' | 'email') {
    if (!exp) return;
    let msg = '';
    if (mode === 'request-date') {
      const extraReq: BookingField[] = (exp.booking as any).extraRequestFields ?? [];
      msg = buildDateRequestMessage(exp.title, [...REQUEST_DATE_FIELDS, ...extraReq], answers);
    } else {
      const fields = mode === 'private'
        ? (exp.booking.type !== 'inquiry' ? exp.booking.privateFields : exp.booking.fields)
        : exp.booking.type === 'inquiry' ? exp.booking.fields : [];
      msg = buildInquiryMessage(exp.title, fields ?? [], answers);
    }
    if (channel === 'whatsapp') sendWhatsApp(msg);
    else sendEmail(`Booking request — ${exp.title}`, msg);
    handleClose();
  }

  function canSubmit(fields: BookingField[]) {
    return fields.filter((f) => f.required).every((f) => {
      if (f.type === 'number') return true;
      return (answers[f.id] || '').trim().length > 0;
    });
  }

  if (!exp) return null;
  const { booking } = exp;

  const isInquiry = booking.type === 'inquiry';
  const hasFixedDates = booking.type !== 'inquiry' && booking.fixedDates.length > 0;
  const stayTuned = booking.type !== 'inquiry' && (booking as any).stayCuned === true;
  const isHybrid = booking.type === 'hybrid';
  const hasPrivate = isHybrid || booking.type === 'inquiry' || (booking.type === 'rsvp' && booking.hasPrivate);

  // For inquiry-only: go straight to form
  const effectiveMode: SheetMode = isInquiry ? 'private' : mode;

  const privateFields: BookingField[] = isInquiry
    ? booking.fields
    : booking.type !== 'inquiry' && 'privateFields' in booking
      ? (booking.privateFields ?? [])
      : [];

  const extraReqFields: BookingField[] = (booking as any).extraRequestFields ?? [];
  const requestFields = [...REQUEST_DATE_FIELDS, ...extraReqFields];
  const canSubmitPrivate = canSubmit(privateFields);
  const canSubmitRequest = canSubmit(requestFields);

  return (
    <Modal visible={exp !== null} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          {effectiveMode !== 'choose' && !isInquiry ? (
            <TouchableOpacity onPress={() => setMode('choose')} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={Colors.mid} />
            </TouchableOpacity>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetEyebrow}>
              {effectiveMode === 'request-date' ? 'REQUEST A DATE' : 'BOOK AN EXPERIENCE'}
            </Text>
            <Text style={styles.sheetTitle} numberOfLines={2}>{exp.title}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.mid} />
          </TouchableOpacity>
        </View>

        {/* ── Mode chooser (hybrid / rsvp with private) ── */}
        {effectiveMode === 'choose' && (
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>

            {/* Upcoming public dates */}
            {hasFixedDates && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Upcoming public dates</Text>
                {booking.type !== 'inquiry' && booking.fixedDates.map((d) => (
                  <TouchableOpacity
                    key={d.iso}
                    style={styles.dateRow}
                    onPress={() => { setSelectedDate(d); setMode('public'); }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dateLabel}>{d.label}</Text>
                      {d.description ? <Text style={styles.dateDesc}>{d.description}</Text> : null}
                      {d.spotsLeft !== undefined ? (
                        <Text style={styles.spotsLeft}>{d.spotsLeft} spot{d.spotsLeft !== 1 ? 's' : ''} left</Text>
                      ) : null}
                    </View>
                    {d.whatsappGroup
                      ? <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                      : <Ionicons name="chevron-forward" size={16} color={Colors.mid} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Stay tuned block */}
            {stayTuned && !hasFixedDates && (
              <View style={styles.stayTunedBox}>
                <Ionicons name="notifications-outline" size={22} color={Colors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stayTunedTitle}>Public dates coming soon</Text>
                  <Text style={styles.stayTunedSub}>Request a date below to let Erik know you're interested — the more requests for a date, the sooner it gets scheduled.</Text>
                </View>
              </View>
            )}

            {/* Request a date */}
            {(stayTuned || isHybrid) && (
              <TouchableOpacity style={styles.modeOption} onPress={() => setMode('request-date')} activeOpacity={0.85}>
                <View style={styles.modeOptionIcon}><Ionicons name="calendar" size={20} color={Colors.gold} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeOptionTitle}>Request an event date</Text>
                  <Text style={styles.modeOptionSub}>Tell Erik your preferred date and group size</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.mid} />
              </TouchableOpacity>
            )}

            {/* Private booking */}
            {hasPrivate && (
              <TouchableOpacity style={styles.modeOption} onPress={() => setMode('private')} activeOpacity={0.85}>
                <View style={styles.modeOptionIcon}><Ionicons name="lock-closed" size={20} color={Colors.gold} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeOptionTitle}>Book a private experience</Text>
                  <Text style={styles.modeOptionSub}>Your own date, your group only</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.mid} />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ── Public date selected → join group or confirm ── */}
        {effectiveMode === 'public' && selectedDate && (
          <>
            <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
              <View style={styles.selectedDateCard}>
                <Text style={styles.selectedDateLabel}>{selectedDate.label}</Text>
                {selectedDate.description ? <Text style={styles.selectedDateDesc}>{selectedDate.description}</Text> : null}
                {selectedDate.spotsLeft !== undefined ? (
                  <Text style={styles.spotsLeft}>{selectedDate.spotsLeft} spots left</Text>
                ) : null}
              </View>
              {!selectedDate.whatsappGroup && (
                <PeoplePicker value={people} onChange={setPeople} />
              )}
              {selectedDate.whatsappGroup && (
                <View style={styles.groupNote}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.mid} />
                  <Text style={styles.groupNoteText}>Tap below to join the WhatsApp group for this event — that's where updates, details and payment info will be shared.</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.sendRow}>
              {selectedDate.whatsappGroup ? (
                <TouchableOpacity
                  style={[styles.sendBtn, styles.sendWa, { flex: 1 }]}
                  onPress={() => { Linking.openURL(selectedDate.whatsappGroup!).catch(() => {}); handleClose(); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                  <Text style={styles.sendBtnText}>Join WhatsApp Group</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={[styles.sendBtn, styles.sendWa]} onPress={() => submit('whatsapp')} activeOpacity={0.85}>
                    <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                    <Text style={styles.sendBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.sendBtn, styles.sendEmail]} onPress={() => submit('email')} activeOpacity={0.85}>
                    <Ionicons name="mail" size={18} color={Colors.gold} />
                    <Text style={[styles.sendBtnText, { color: Colors.dark }]}>Email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {/* ── Private / inquiry form ── */}
        {(effectiveMode === 'private' || isInquiry) && (
          <>
            <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
              {privateFields.map((f) => (
                <FieldInput key={f.id} field={f} value={answers[f.id] || ''} onChange={(v) => setAnswer(f.id, v)} />
              ))}
              <Text style={styles.requiredNote}>* Required</Text>
            </ScrollView>
            <View style={styles.sendRow}>
              <TouchableOpacity style={[styles.sendBtn, styles.sendWa, !canSubmitPrivate && styles.sendBtnDisabled]} onPress={() => submit('whatsapp')} disabled={!canSubmitPrivate} activeOpacity={0.85}>
                <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                <Text style={styles.sendBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendBtn, styles.sendEmail, !canSubmitPrivate && styles.sendBtnDisabled]} onPress={() => submit('email')} disabled={!canSubmitPrivate} activeOpacity={0.85}>
                <Ionicons name="mail" size={18} color={Colors.gold} />
                <Text style={[styles.sendBtnText, { color: Colors.dark }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Request a date form ── */}
        {effectiveMode === 'request-date' && (
          <>
            <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.requestIntro}>Let Erik know you're interested — the more people request a specific date, the sooner it gets organised.</Text>
              {requestFields.map((f) => (
                <FieldInput key={f.id} field={f} value={answers[f.id] || ''} onChange={(v) => setAnswer(f.id, v)} />
              ))}
              <Text style={styles.requiredNote}>* Required</Text>
            </ScrollView>
            <View style={styles.sendRow}>
              <TouchableOpacity style={[styles.sendBtn, styles.sendWa, !canSubmitRequest && styles.sendBtnDisabled]} onPress={() => submit('whatsapp')} disabled={!canSubmitRequest} activeOpacity={0.85}>
                <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                <Text style={styles.sendBtnText}>Send via WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendBtn, styles.sendEmail, !canSubmitRequest && styles.sendBtnDisabled]} onPress={() => submit('email')} disabled={!canSubmitRequest} activeOpacity={0.85}>
                <Ionicons name="mail" size={18} color={Colors.gold} />
                <Text style={[styles.sendBtnText, { color: Colors.dark }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingBottom: 32,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.cardBorder, marginTop: 12, marginBottom: 4 },

  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  backBtn: { padding: 4, marginTop: 2 },
  sheetEyebrow: { fontFamily: 'DMSans-Medium', fontSize: 10, letterSpacing: 2, color: Colors.goldDim, marginBottom: 2 },
  sheetTitle: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 20, color: Colors.dark },
  closeBtn: { padding: 4, marginTop: 2 },

  formScroll: { flexGrow: 0 },
  formContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },

  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'DMSans-Medium', fontSize: 12, color: Colors.mid, marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' },

  // stay tuned
  stayTunedBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.gold + '12', borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.gold + '30',
    padding: 16, marginBottom: 14,
  },
  stayTunedTitle: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark, marginBottom: 4 },
  stayTunedSub: { fontFamily: 'DMSans-Regular', fontSize: 12.5, color: Colors.mid, lineHeight: 17 },

  // mode options
  modeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    padding: 16, marginBottom: 10, ...Shadow.sm,
  },
  modeOptionIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.gold + '18', alignItems: 'center', justifyContent: 'center',
  },
  modeOptionTitle: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.dark },
  modeOptionSub: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginTop: 2 },

  // date rows
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
    padding: 14, marginBottom: 8,
  },
  dateRowActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '08' },
  dateRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  dateRadioActive: { borderColor: Colors.gold },
  dateRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.gold },
  dateLabel: { fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.dark },
  dateLabelActive: { color: Colors.dark },
  dateDesc: { fontFamily: 'DMSans-Regular', fontSize: 12, color: Colors.mid, marginTop: 3, lineHeight: 16 },
  spotsLeft: { fontFamily: 'DMSans-Medium', fontSize: 11.5, color: '#3E8E6B', marginTop: 3 },

  // selected date card
  selectedDateCard: {
    backgroundColor: Colors.white, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.gold + '50',
    padding: 16, marginBottom: 16,
  },
  selectedDateLabel: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 18, color: Colors.dark, marginBottom: 4 },
  selectedDateDesc: { fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid, lineHeight: 18 },

  groupNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.light, borderRadius: Radius.md, padding: 14,
  },
  groupNoteText: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid, lineHeight: 18 },

  // stepper
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignSelf: 'flex-start', overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 18, paddingVertical: 12 },
  stepBtnDisabled: { opacity: 0.35 },
  stepValue: { fontFamily: 'DMSans-Medium', fontSize: 18, color: Colors.dark, minWidth: 40, textAlign: 'center' },

  // select chips
  selectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radius.pill, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
  },
  selectChipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  selectChipText: { fontFamily: 'DMSans-Medium', fontSize: 13, color: Colors.dark },
  selectChipTextActive: { color: Colors.dark },

  // text input
  textInput: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, fontFamily: 'DMSans-Regular', fontSize: 14,
    color: Colors.dark, minHeight: 52,
  },

  requestIntro: {
    fontFamily: 'DMSans-Regular', fontSize: 13, color: Colors.mid,
    lineHeight: 18, marginBottom: 20,
  },
  requiredNote: { fontFamily: 'DMSans-Regular', fontSize: 11, color: Colors.faint, marginTop: 4 },

  // send buttons
  sendRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 8 },
  sendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.pill, paddingVertical: 15,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendWa: { backgroundColor: '#25D366' },
  sendEmail: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.cardBorder },
  sendBtnText: { fontFamily: 'DMSans-Medium', fontSize: 15, color: Colors.white },
});
