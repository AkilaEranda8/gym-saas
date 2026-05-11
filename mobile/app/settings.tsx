import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useGymSettings, useOperatingHours, useUpcomingHolidays,
  useMembershipPlans, useIsOpenNow, MembershipPlanConfigDTO,
  DayScheduleDTO, HolidayDTO,
} from "@/hooks/useSettings";

const DAY_SHORT = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SettingsScreen() {
  const { data: gym, loading: gymLoading, refetch: refetchGym } = useGymSettings();
  const { data: hours, loading: hoursLoading } = useOperatingHours();
  const { data: holidays } = useUpcomingHolidays();
  const { data: plans, loading: plansLoading } = useMembershipPlans();
  const { open: isOpen } = useIsOpenNow();
  const [activeTab, setActiveTab] = useState<"info" | "hours" | "plans">("info");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGym();
    setRefreshing(false);
  };

  const loading = gymLoading || hoursLoading || plansLoading;

  const todayHoliday = holidays?.find((h: HolidayDTO) => h.isToday);
  const upcomingHolidays = holidays?.filter((h: HolidayDTO) => !h.isToday).slice(0, 5) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#e2e8f0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gym Info</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        >
          {/* Gym Banner */}
          {gym?.coverImageUrl && (
            <Image source={{ uri: gym.coverImageUrl }} style={styles.cover} resizeMode="cover" />
          )}

          {/* Gym Card */}
          <View style={styles.gymCard}>
            {gym?.logoUrl ? (
              <Image source={{ uri: gym.logoUrl }} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: gym?.primaryColor ?? "#f59e0b" }]}>
                <Text style={styles.logoInitial}>{gym?.gymName?.[0] ?? "G"}</Text>
              </View>
            )}
            <View style={styles.gymInfo}>
              <Text style={styles.gymName}>{gym?.gymName}</Text>
              {gym?.tagline && <Text style={styles.gymTagline}>{gym.tagline}</Text>}
              {gym?.city && <Text style={styles.gymCity}>{gym.city}{gym.district ? `, ${gym.district}` : ""}</Text>}
            </View>
            {/* Open/Closed badge */}
            {isOpen !== null && (
              <View style={[styles.openBadge, { backgroundColor: isOpen ? "#064e3b" : "#422006" }]}>
                <View style={[styles.openDot, { backgroundColor: isOpen ? "#34d399" : "#f59e0b" }]} />
                <Text style={[styles.openText, { color: isOpen ? "#34d399" : "#f59e0b" }]}>
                  {isOpen ? "Open" : "Closed"}
                </Text>
              </View>
            )}
          </View>

          {todayHoliday && (
            <View style={styles.holidayBanner}>
              <Ionicons name="calendar" size={16} color="#f59e0b" />
              <Text style={styles.holidayText}>
                {todayHoliday.name} today — {todayHoliday.isClosed ? "Gym closed" : "Modified hours"}
              </Text>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabs}>
            {(["info", "hours", "plans"] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setActiveTab(t)}
                style={[styles.tab, activeTab === t && styles.tabActive]}>
                <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                  {t === "info" ? "Info" : t === "hours" ? "Hours" : "Plans"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "info" && gym && (
            <View style={styles.section}>
              {gym.phone && <InfoRow icon="call-outline" label="Phone" value={gym.phone} />}
              {gym.email && <InfoRow icon="mail-outline" label="Email" value={gym.email} />}
              {gym.addressLine1 && <InfoRow icon="location-outline" label="Address" value={gym.addressLine1} />}
              {gym.timezone && <InfoRow icon="time-outline" label="Timezone" value={gym.timezone} />}
              {gym.currency && <InfoRow icon="cash-outline" label="Currency" value={gym.currency} />}
            </View>
          )}

          {activeTab === "hours" && hours && (
            <View style={styles.section}>
              {hours.schedule.map((d: DayScheduleDTO) => (
                <View key={d.dayOfWeek} style={styles.dayRow}>
                  <Text style={[styles.dayName, !d.isOpen && styles.dayNameClosed]}>
                    {DAY_SHORT[d.dayOfWeek]}
                  </Text>
                  {d.isOpen ? (
                    <Text style={styles.dayHours}>{d.openTime} – {d.closeTime}</Text>
                  ) : (
                    <Text style={styles.dayClosed}>Closed</Text>
                  )}
                </View>
              ))}

              {upcomingHolidays.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Upcoming Holidays</Text>
                  {upcomingHolidays.map((h: HolidayDTO) => (
                    <View key={h.id} style={styles.holidayRow}>
                      <Ionicons name="calendar-outline" size={14} color="#475569" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.holidayName}>{h.name}</Text>
                        <Text style={styles.holidayDate}>{h.holidayDate} {h.isClosed ? "· Closed" : ""}</Text>
                      </View>
                      {h.isRecurring && <Text style={styles.recurringTag}>Yearly</Text>}
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {activeTab === "plans" && plans && (
            <View style={styles.section}>
              {plans.filter((p: MembershipPlanConfigDTO) => p.isActive).map((plan: MembershipPlanConfigDTO) => (
                <View key={plan.id} style={[styles.planCard, { borderLeftColor: plan.color ?? "#f59e0b" }]}>
                  <View style={styles.planHeader}>
                    <View style={[styles.planDot, { backgroundColor: plan.color ?? "#f59e0b" }]} />
                    <Text style={styles.planName}>{plan.displayName}</Text>
                    <Text style={styles.planPrice}>{plan.priceFormatted}</Text>
                  </View>
                  {plan.description && <Text style={styles.planDesc}>{plan.description}</Text>}
                  <View style={styles.planFeatures}>
                    {plan.features.slice(0, 4).map((f: string, i: number) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={14} color={plan.color ?? "#f59e0b"} />
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.planDuration}>{plan.durationDays} days</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color="#475569" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0a0f1a" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#e2e8f0" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 40 },
  cover: { width: "100%", height: 160 },
  gymCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, marginTop: -1 },
  logo: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#111827" },
  logoPlaceholder: { width: 56, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoInitial: { fontSize: 24, fontWeight: "800", color: "#000" },
  gymInfo: { flex: 1 },
  gymName: { fontSize: 18, fontWeight: "700", color: "#e2e8f0" },
  gymTagline: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  gymCity: { fontSize: 11, color: "#475569", marginTop: 2 },
  openBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 11, fontWeight: "700" },
  holidayBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#422006", marginHorizontal: 16, borderRadius: 10, padding: 12, marginBottom: 8 },
  holidayText: { fontSize: 12, color: "#f59e0b", flex: 1 },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginBottom: 4, backgroundColor: "#111827", borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#f59e0b" },
  tabText: { fontSize: 13, color: "#475569", fontWeight: "600" },
  tabTextActive: { color: "#000" },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  infoLabel: { fontSize: 11, color: "#475569" },
  infoValue: { fontSize: 13, color: "#e2e8f0", marginTop: 2 },
  dayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  dayName: { width: 40, fontSize: 13, fontWeight: "600", color: "#94a3b8" },
  dayNameClosed: { color: "#334155" },
  dayHours: { fontSize: 13, color: "#e2e8f0" },
  dayClosed: { fontSize: 13, color: "#334155" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 16, marginBottom: 8 },
  holidayRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  holidayName: { fontSize: 13, color: "#e2e8f0" },
  holidayDate: { fontSize: 11, color: "#475569", marginTop: 1 },
  recurringTag: { fontSize: 10, color: "#f59e0b", backgroundColor: "#422006", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  planCard: { borderLeftWidth: 3, borderLeftColor: "#f59e0b", backgroundColor: "#111827", borderRadius: 12, padding: 14, marginBottom: 12 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  planDot: { width: 8, height: 8, borderRadius: 4 },
  planName: { flex: 1, fontSize: 14, fontWeight: "700", color: "#e2e8f0" },
  planPrice: { fontSize: 14, fontWeight: "700", color: "#f59e0b" },
  planDesc: { fontSize: 12, color: "#475569", marginBottom: 8 },
  planFeatures: { gap: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  featureText: { fontSize: 12, color: "#94a3b8" },
  planDuration: { fontSize: 11, color: "#334155", marginTop: 8 },
});
