import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyPTSessions, useUpdateSessionStatus, type PTSessionDTO, type PTSessionStatus } from "../../src/hooks/useTrainers";

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "#818cf8", COMPLETED: "#22c55e",
  CANCELLED: "#f87171", NO_SHOW: "#fb923c",
};

const TABS: { key: PTSessionStatus | undefined; label: string }[] = [
  { key: undefined,      label: "All" },
  { key: "SCHEDULED",   label: "Upcoming" },
  { key: "COMPLETED",   label: "Done" },
  { key: "CANCELLED",   label: "Cancelled" },
];

function SessionCard({ session, onMarkComplete }: {
  session: PTSessionDTO;
  onMarkComplete: (id: string) => void;
}) {
  const color = STATUS_COLOR[session.status] ?? "#6b7280";
  const isScheduled = session.status === "SCHEDULED";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.trainerName}>with {session.trainerName}</Text>
          <Text style={styles.date}>
            {session.sessionDate} · {session.startTime.slice(0, 5)} – {session.endTime.slice(0, 5)}
          </Text>
          <Text style={styles.duration}>{session.durationMinutes} min session</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + "22" }]}>
          <Text style={[styles.badgeText, { color }]}>{session.status}</Text>
        </View>
      </View>

      {session.notes && (
        <Text style={styles.notes}>{session.notes}</Text>
      )}

      {isScheduled && (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => onMarkComplete(session.id)}
        >
          <Text style={styles.completeBtnText}>Mark as Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MySessionsScreen() {
  const [activeTab, setActiveTab] = useState<PTSessionStatus | undefined>(undefined);
  const [memberId]                = useState<string | null>(null);

  const { sessions, loading, refetch } = useMyPTSessions(memberId, activeTab);
  const { update }                     = useUpdateSessionStatus();

  const handleMarkComplete = async (sessionId: string) => {
    const ok = await update(sessionId, "COMPLETED");
    if (ok) refetch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My PT Sessions</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={String(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && sessions.length === 0 ? (
        <ActivityIndicator color="#818cf8" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s: PTSessionDTO) => s.id}
          renderItem={({ item }: { item: PTSessionDTO }) => (
            <SessionCard session={item} onMarkComplete={handleMarkComplete} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#818cf8" />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No sessions found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#09090b" },
  header:         { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:          { fontSize: 24, fontWeight: "700", color: "#fff" },
  tabs:           { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a" },
  tabActive:      { backgroundColor: "#4f46e5", borderColor: "#6366f1" },
  tabText:        { color: "#a1a1aa", fontSize: 13, fontWeight: "500" },
  tabTextActive:  { color: "#fff" },
  list:           { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card:           { backgroundColor: "#18181b", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#27272a" },
  cardHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  trainerName:    { color: "#fff", fontWeight: "600", fontSize: 16 },
  date:           { color: "#a1a1aa", fontSize: 13, marginTop: 2 },
  duration:       { color: "#6b7280", fontSize: 12, marginTop: 1 },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:      { fontSize: 11, fontWeight: "600" },
  notes:          { color: "#71717a", fontSize: 13, marginTop: 10, lineHeight: 18 },
  completeBtn:    { marginTop: 12, paddingVertical: 10, backgroundColor: "#22c55e22", borderRadius: 10, borderWidth: 1, borderColor: "#22c55e40", alignItems: "center" },
  completeBtnText:{ color: "#22c55e", fontWeight: "600", fontSize: 14 },
  empty:          { color: "#6b7280", textAlign: "center", marginTop: 60, fontSize: 15 },
});
