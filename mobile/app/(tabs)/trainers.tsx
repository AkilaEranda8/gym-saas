import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, RefreshControl, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTrainers, type TrainerDTO } from "../../src/hooks/useTrainers";

const SPECIALTY_EMOJI: Record<string, string> = {
  YOGA: "🧘", HIIT: "🔥", ZUMBA: "💃", PILATES: "🤸", BOXING: "🥊",
  SPINNING: "🚴", STRENGTH: "🏋️", NUTRITION: "🥗", CARDIO: "🏃",
  CROSSFIT: "⚡", REHABILITATION: "🩺", PERSONAL_TRAINING: "👤", OTHER: "🎯",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#22c55e", INACTIVE: "#6b7280", ON_LEAVE: "#f59e0b",
};

function TrainerCard({ trainer }: { trainer: TrainerDTO }) {
  const initials = trainer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const statusColor = STATUS_COLOR[trainer.status] ?? "#6b7280";
  const specialty = trainer.primarySpecialty;
  const emoji = specialty ? (SPECIALTY_EMOJI[specialty] ?? "🎯") : "";

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatarContainer}>
          {trainer.photoUrl ? (
            <Image source={{ uri: trainer.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.name}>{trainer.name}</Text>
          <Text style={styles.email}>{trainer.email}</Text>
          {specialty && (
            <Text style={styles.specialty}>{emoji} {specialty.replace(/_/g, " ")}</Text>
          )}
          <View style={styles.statsRow}>
            <Text style={styles.stat}>⭐ {trainer.rating}</Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.stat}>👥 {trainer.activeClientsCount} clients</Text>
            <Text style={styles.statDivider}>·</Text>
            <Text style={styles.stat}>{trainer.experienceYears}y exp</Text>
          </View>
        </View>
      </View>

      {trainer.specialties.length > 1 && (
        <View style={styles.tags}>
          {trainer.specialties.slice(0, 3).map(s => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s.replace(/_/g, " ")}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function TrainersScreen() {
  const [search, setSearch] = useState("");
  const { trainers, loading, error, refetch } = useTrainers("ACTIVE");

  const filtered = search.trim()
    ? trainers.filter((t: TrainerDTO) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.primarySpecialty ?? "").toLowerCase().includes(search.toLowerCase()))
    : trainers;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trainers</Text>
        <Text style={styles.subtitle}>{filtered.length} active trainers</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trainers..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && trainers.length === 0 ? (
        <ActivityIndicator color="#818cf8" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }: { item: TrainerDTO }) => <TrainerCard trainer={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#818cf8" />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No trainers found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#09090b" },
  header:        { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title:         { fontSize: 24, fontWeight: "700", color: "#fff" },
  subtitle:      { fontSize: 13, color: "#6b7280", marginTop: 2 },
  searchBox:     { flexDirection: "row", alignItems: "center", backgroundColor: "#18181b", borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, gap: 8 },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12 },
  list:          { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  card:          { backgroundColor: "#18181b", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#27272a" },
  cardRow:       { flexDirection: "row", gap: 12 },
  avatarContainer: { position: "relative" },
  avatar:        { width: 52, height: 52, borderRadius: 26 },
  avatarFallback:{ backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center" },
  avatarText:    { color: "#fff", fontWeight: "700", fontSize: 18 },
  statusDot:     { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#09090b" },
  cardInfo:      { flex: 1, gap: 2 },
  name:          { color: "#fff", fontWeight: "600", fontSize: 16 },
  email:         { color: "#6b7280", fontSize: 13 },
  specialty:     { color: "#a78bfa", fontSize: 13, marginTop: 2 },
  statsRow:      { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  stat:          { color: "#a1a1aa", fontSize: 12 },
  statDivider:   { color: "#3f3f46", fontSize: 12 },
  tags:          { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag:           { backgroundColor: "#27272a", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText:       { color: "#a1a1aa", fontSize: 11 },
  error:         { color: "#f87171", textAlign: "center", marginTop: 40 },
  empty:         { color: "#6b7280", textAlign: "center", marginTop: 60, fontSize: 15 },
});
