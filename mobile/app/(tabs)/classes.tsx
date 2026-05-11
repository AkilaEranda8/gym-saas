import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, Alert, ActivityIndicator,
} from "react-native";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClassSchedule, ClassSessionDTO, ClassType, ClassDifficulty } from "../../src/hooks/useClassSchedule";
import { useBookClass } from "../../src/hooks/useBookClass";

const COLORS = {
  bg:      "#080d16",
  surface: "#0f172a",
  card:    "#111827",
  border:  "#1e293b",
  gold:    "#f59e0b",
  text:    "#e2e8f0",
  muted:   "#475569",
};

const CLASS_EMOJIS: Record<ClassType, string> = {
  YOGA: "🧘", HIIT: "🔥", ZUMBA: "💃", PILATES: "🤸", BOXING: "🥊",
  SPINNING: "🚴", STRENGTH: "🏋️", MEDITATION: "🧘‍♀️", DANCE: "🕺",
  CARDIO: "❤️", CROSSFIT: "⚡", OTHER: "🏃",
};

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr   = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ── Session Card ──────────────────────────────────────────────

function SessionCard({
  session, onBook, booking,
}: {
  session: ClassSessionDTO;
  onBook: (s: ClassSessionDTO) => void;
  booking: boolean;
}) {
  const pct   = session.actualCapacity > 0
    ? Math.round((session.bookedCount / session.actualCapacity) * 100) : 0;
  const color = session.classColor || COLORS.muted;

  const barColor = session.isFull ? "#ef4444"
    : pct >= 85 ? "#f59e0b"
    : "#22c55e";

  return (
    <View style={[styles.sessionCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.sessionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionName}>{session.className}</Text>
          {session.trainerName && (
            <Text style={styles.sessionTrainer}>{session.trainerName}</Text>
          )}
        </View>

        {/* Book button */}
        {session.status === "SCHEDULED" && (
          session.isUserBooked ? (
            <View style={styles.bookedBadge}>
              <Text style={styles.bookedBadgeText}>✓ Booked</Text>
            </View>
          ) : session.isFull ? (
            <TouchableOpacity
              style={styles.waitlistBtn}
              onPress={() => onBook(session)}
              disabled={booking}
            >
              <Text style={styles.waitlistBtnText}>Waitlist</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => onBook(session)}
              disabled={booking}
            >
              {booking
                ? <ActivityIndicator size="small" color="#000" />
                : <Text style={styles.bookBtnText}>Book</Text>
              }
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Info row */}
      <View style={styles.sessionMeta}>
        <Text style={[styles.metaText, { color: COLORS.gold, fontWeight: "700" }]}>
          {formatTime(session.startTime)} → {formatTime(session.endTime)}
        </Text>
        {session.room && (
          <Text style={styles.metaText}>📍 {session.room}</Text>
        )}
        <Text style={styles.metaText}>⏱ {session.durationMinutes}m</Text>
      </View>

      {/* Fill bar */}
      <View style={{ marginTop: 8 }}>
        <View style={styles.fillBg}>
          <View style={[styles.fillBar, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.fillText}>{session.bookedCount}/{session.actualCapacity} slots</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function ClassesScreen() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [bookingId, setBookingId]       = useState<string | null>(null);

  const { sessions, isLoading, error, refetch } = useClassSchedule(selectedDate);
  const { bookClass }                           = useBookClass();

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(today, i - 3)),
  []);

  const handleBook = async (session: ClassSessionDTO) => {
    setBookingId(session.id);
    try {
      await bookClass(session.id);
      Alert.alert("🎉 Booked!", `${session.className} on ${session.sessionDate}`);
      refetch();
    } catch (e: any) {
      Alert.alert("Booking Failed", e.message);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Classes</Text>
        <Text style={styles.subtitle}>{formatDate(selectedDate)}</Text>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayScroll}
      >
        {weekDays.map((d) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday    = d.toDateString() === today.toDateString();
          return (
            <TouchableOpacity
              key={d.toISOString()}
              style={[styles.dayItem, isSelected && styles.dayItemActive]}
              onPress={() => setSelectedDate(new Date(d))}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </Text>
              <View style={[styles.dayNum, isToday && styles.dayNumToday, isSelected && styles.dayNumSelected]}>
                <Text style={[styles.dayNumText, (isToday || isSelected) && { color: "#000" }]}>
                  {d.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sessions */}
      {isLoading ? (
        <View style={styles.centered}>
          {[1, 2, 3].map((k) => (
            <View key={k} style={styles.skeleton} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No classes today</Text>
          <Text style={styles.emptySubtitle}>Check another day or contact your gym</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onBook={handleBook}
              booking={bookingId === item.id}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: COLORS.bg },
  header:          { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title:           { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: 0.5 },
  subtitle:        { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  dayScroll:       { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dayItem:         { alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  dayItemActive:   { backgroundColor: COLORS.surface },
  dayName:         { fontSize: 11, color: COLORS.muted, fontWeight: "600", marginBottom: 4 },
  dayNameActive:   { color: COLORS.gold },
  dayNum:          { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dayNumToday:     { backgroundColor: COLORS.gold },
  dayNumSelected:  { backgroundColor: COLORS.gold },
  dayNumText:      { fontSize: 14, fontWeight: "700", color: COLORS.text },
  centered:        { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  skeleton:        { width: "90%", height: 100, backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 12 },
  errorText:       { color: "#f87171", textAlign: "center", fontSize: 15 },
  retryBtn:        { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  retryText:       { color: COLORS.text, fontSize: 14 },
  emptyTitle:      { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptySubtitle:   { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  sessionCard: {
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  sessionHeader:   { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  sessionName:     { fontSize: 16, fontWeight: "700", color: COLORS.text },
  sessionTrainer:  { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  sessionMeta:     { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metaText:        { fontSize: 12, color: COLORS.muted },
  bookBtn: {
    backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, alignItems: "center", justifyContent: "center",
  },
  bookBtnText:     { fontSize: 13, fontWeight: "700", color: "#000" },
  waitlistBtn: {
    backgroundColor: "#f59e0b22", paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.gold,
  },
  waitlistBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.gold },
  bookedBadge: {
    backgroundColor: "#22c55e22", paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#22c55e44",
  },
  bookedBadgeText: { fontSize: 13, fontWeight: "600", color: "#22c55e" },
  fillBg:  { height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  fillBar: { height: 4, borderRadius: 2 },
  fillText: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
});
