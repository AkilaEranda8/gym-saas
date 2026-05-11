import { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Modal, ScrollView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEquipmentList, useReportIssue, EquipmentDTO, EquipmentStatus } from "../src/hooks/useEquipment";

const STATUS_COLOR: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "#10b981",
  MAINTENANCE:      "#f59e0b",
  OUT_OF_ORDER:     "#ef4444",
  RETIRED:          "#475569",
  UNDER_INSPECTION: "#3b82f6",
};

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "Operational",
  MAINTENANCE:      "Maintenance",
  OUT_OF_ORDER:     "Out of Order",
  RETIRED:          "Retired",
  UNDER_INSPECTION: "Inspecting",
};

const STATUS_FILTERS: Array<{ label: string; value: EquipmentStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Active", value: "OPERATIONAL" },
  { label: "Maint.", value: "MAINTENANCE" },
  { label: "Down", value: "OUT_OF_ORDER" },
];

export default function EquipmentScreen() {
  const router = useRouter();
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState<EquipmentStatus | "">("");
  const [reportTarget, setReport]   = useState<EquipmentDTO | null>(null);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc]   = useState("");

  const { items, loading, refetch } = useEquipmentList({
    status: filterStatus || undefined,
    search: search.length >= 2 ? search : undefined,
  });
  const { report, loading: reporting } = useReportIssue();

  const handleReport = async () => {
    if (!reportTarget || !issueTitle.trim()) {
      Alert.alert("Required", "Please enter a title for the issue.");
      return;
    }
    const result = await report({
      equipmentId: reportTarget.id,
      title: issueTitle.trim(),
      description: issueDesc.trim() || undefined,
      priority: "MEDIUM",
    });
    if (result) {
      Alert.alert("Reported", `Request #${result.requestNumber} submitted.`);
      setReport(null); setIssueTitle(""); setIssueDesc("");
    } else {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  const renderItem = ({ item }: { item: EquipmentDTO }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.brand && (
            <Text style={styles.cardSub}>{item.brand}{item.model ? ` · ${item.model}` : ""}</Text>
          )}
          {item.location && <Text style={styles.cardSub}>📍 {item.location}</Text>}
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}20` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
          {item.categoryName && (
            <Text style={styles.categoryLabel}>{item.categoryName}</Text>
          )}
        </View>
      </View>

      {(item.isServiceOverdue || item.openRequestsCount > 0) && (
        <View style={styles.alertRow}>
          {item.isServiceOverdue && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>⏰ Service overdue</Text>
            </View>
          )}
          {item.openRequestsCount > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>🔧 {item.openRequestsCount} open request{item.openRequestsCount > 1 ? "s" : ""}</Text>
            </View>
          )}
        </View>
      )}

      {item.status !== "RETIRED" && (
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => setReport(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.reportBtnText}>Report Issue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gym Equipment</Text>
        <TouchableOpacity onPress={refetch}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search equipment..."
          placeholderTextColor="#475569"
          style={styles.searchInput}
        />
      </View>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}
        contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filterStatus === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filterStatus === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {loading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""}`}
        </Text>
        <Text style={styles.summaryText}>
          {items.filter((i) => i.status === "OPERATIONAL").length} operational
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#f59e0b" size="large" />
          <Text style={styles.loadingText}>Loading equipment...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No equipment found</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Report issue modal */}
      <Modal
        visible={!!reportTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Report Issue</Text>
            {reportTarget && (
              <Text style={styles.modalSub}>{reportTarget.name}</Text>
            )}

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              value={issueTitle}
              onChangeText={setIssueTitle}
              placeholder="Brief description of the issue"
              placeholderTextColor="#475569"
              style={styles.modalInput}
            />

            <Text style={styles.inputLabel}>Details (optional)</Text>
            <TextInput
              value={issueDesc}
              onChangeText={setIssueDesc}
              placeholder="More details..."
              placeholderTextColor="#475569"
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => { setReport(null); setIssueTitle(""); setIssueDesc(""); }}
                style={styles.cancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReport}
                disabled={reporting}
                style={[styles.submitBtn, reporting && styles.disabledBtn]}
                activeOpacity={0.8}
              >
                {reporting
                  ? <ActivityIndicator color="#0a0f1e" size="small" />
                  : <Text style={styles.submitBtnText}>Submit Report</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#0a0f1e" },
  header:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:       { padding: 4 },
  backText:      { color: "#f59e0b", fontSize: 14 },
  title:         { color: "#e2e8f0", fontSize: 18, fontWeight: "700" },
  refreshText:   { color: "#475569", fontSize: 20 },
  searchRow:     { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput:   { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: "#e2e8f0", fontSize: 14 },
  filterRow:     { paddingBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8, flexDirection: "row" },
  filterChip:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b" },
  filterChipActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  filterText:    { color: "#94a3b8", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#0a0f1e" },
  summaryRow:    { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  summaryText:   { color: "#475569", fontSize: 12 },
  list:          { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card:          { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, padding: 14 },
  cardRow:       { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  statusDot:     { width: 10, height: 10, borderRadius: 5, marginTop: 5, flexShrink: 0 },
  cardContent:   { flex: 1, gap: 2 },
  cardName:      { color: "#e2e8f0", fontSize: 15, fontWeight: "600" },
  cardSub:       { color: "#475569", fontSize: 12 },
  cardRight:     { alignItems: "flex-end", gap: 4 },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText:    { fontSize: 11, fontWeight: "600" },
  categoryLabel: { color: "#475569", fontSize: 11 },
  alertRow:      { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  alertBadge:    { backgroundColor: "#f59e0b20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  alertText:     { color: "#f59e0b", fontSize: 11 },
  reportBtn:     { marginTop: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#1e293b", alignItems: "center" },
  reportBtnText: { color: "#94a3b8", fontSize: 13 },
  centered:      { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  loadingText:   { color: "#475569", marginTop: 12, fontSize: 14 },
  emptyText:     { color: "#475569", fontSize: 14 },
  modalOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet:    { backgroundColor: "#111827", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: "#1e293b" },
  modalTitle:    { color: "#e2e8f0", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  modalSub:      { color: "#475569", fontSize: 13, marginBottom: 20 },
  inputLabel:    { color: "#94a3b8", fontSize: 12, marginBottom: 6 },
  modalInput:    { backgroundColor: "#0d1526", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: "#e2e8f0", fontSize: 14, marginBottom: 14 },
  modalTextArea: { height: 80, textAlignVertical: "top" },
  modalActions:  { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn:     { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b", alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  submitBtn:     { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#f59e0b", alignItems: "center" },
  submitBtnText: { color: "#0a0f1e", fontSize: 14, fontWeight: "700" },
  disabledBtn:   { opacity: 0.6 },
});
