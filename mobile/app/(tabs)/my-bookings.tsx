import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyBookings, MyBookingDTO } from "../../src/hooks/useMyBookings";
import { useCancelBooking } from "../../src/hooks/useCancelBooking";
import { BookingStatus } from "../../src/hooks/useClassSchedule";

const COLORS = {
  bg:      "#080d16",
  surface: "#0f172a",
  card:    "#111827",
  border:  "#1e293b",
  gold:    "#f59e0b",
  text:    "#e2e8f0",
  muted:   "#475569",
};

const STATUS_COLOR: Record<BookingStatus, { bg: string; text: string }> = {
  BOOKED:     { bg: "#3b82f622", text: "#60a5fa" },
  ATTENDED:   { bg: "#22c55e22", text: "#4ade80" },
  CANCELLED:  { bg: "#1e293b",   text: "#475569" },
  NO_SHOW:    { bg: "#ef444422", text: "#f87171" },
  WAITLISTED: { bg: "#f59e0b22", text: "#fbbf24" },
};

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function BookingCard({
  item, onCancel, cancelling,
}: {
  item: MyBookingDTO;
  onCancel: (b: MyBookingDTO) => void;
  cancelling: boolean;
}) {
  const { bg, text: col } = STATUS_COLOR[item.status];

  return (
    <View style={[styles.card, { borderLeftColor: item.classColor || COLORS.muted, borderLeftWidth: 4 }]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.className}</Text>
          {item.trainerName && (
            <Text style={styles.cardSub}>{item.trainerName}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <Text style={[styles.statusText, { color: col }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Text style={[styles.metaText, { color: COLORS.gold, fontWeight: "700" }]}>
          {formatDate(item.sessionDate)}
        </Text>
        <Text style={styles.metaText}>
          {formatTime(item.startTime)} → {formatTime(item.endTime)}
        </Text>
        {item.room && <Text style={styles.metaText}>📍 {item.room}</Text>}
        {item.status === "WAITLISTED" && item.waitlistPosition && (
          <Text style={[styles.metaText, { color: "#fbbf24" }]}>
            📋 Waitlist #{item.waitlistPosition}
          </Text>
        )}
      </View>

      {item.status === "BOOKED" && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => onCancel(item)}
          disabled={cancelling}
        >
          {cancelling
            ? <ActivityIndicator size="small" color="#f87171" />
            : <Text style={styles.cancelText}>Cancel Booking</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MyBookingsScreen() {
  const { upcoming, past, isLoading, error, refetch } = useMyBookings();
  const { cancelBooking }                             = useCancelBooking();
  const [cancellingId, setCancellingId]               = useState<string | null>(null);

  const handleCancel = (b: MyBookingDTO) => {
    Alert.alert(
      "Cancel Booking",
      `Cancel ${b.className} on ${formatDate(b.sessionDate)}?`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            setCancellingId(b.id);
            try {
              await cancelBooking(b.id, "Cancelled by member");
              refetch();
            } catch (e: any) {
              Alert.alert("Failed", e.message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const sections = [
    { title: `Upcoming (${upcoming.length})`, data: upcoming },
    { title: `History (${past.length})`,      data: past },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Your upcoming and past classes</Text>
      </View>

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
            <Text style={{ color: COLORS.text, fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 40 }}>📅</Text>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptySub}>Book a class from the Classes tab!</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onCancel={handleCancel}
              cancelling={cancellingId === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.bg },
  header:        { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title:         { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: 0.5 },
  subtitle:      { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  centered:      { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  skeleton: {
    width: "90%", height: 110, backgroundColor: COLORS.card,
    borderRadius: 12, marginBottom: 12,
  },
  errorText:     { color: "#f87171", textAlign: "center", fontSize: 15 },
  retryBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle:    { fontSize: 18, fontWeight: "700", color: COLORS.text },
  emptySub:      { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  sectionHeader: {
    fontSize: 13, fontWeight: "700", color: COLORS.muted,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 10, marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  cardTop:       { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  cardTitle:     { fontSize: 16, fontWeight: "700", color: COLORS.text },
  cardSub:       { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:    { fontSize: 11, fontWeight: "700" },
  cardMeta:      { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 10 },
  metaText:      { fontSize: 12, color: COLORS.muted },
  cancelBtn: {
    paddingVertical: 8, borderRadius: 8, alignItems: "center",
    borderWidth: 1, borderColor: "#ef444444",
  },
  cancelText:    { fontSize: 13, fontWeight: "600", color: "#f87171" },
});
