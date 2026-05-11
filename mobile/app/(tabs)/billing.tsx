import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Linking, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMyPayments, useDownloadInvoice, PaymentDTO, PaymentStatus } from "../../src/hooks/useBilling";

const STATUS_COLOR: Record<PaymentStatus, string> = {
  PAID:      "#22c55e",
  PENDING:   "#f59e0b",
  FAILED:    "#ef4444",
  REFUNDED:  "#a855f7",
  CANCELLED: "#94a3b8",
};

const METHOD_ICON: Record<string, string> = {
  CASH: "💵", CARD: "💳", ONLINE: "🌐", BANK_TRANSFER: "🏦",
  PAYHERE: "🔵", EZ_CASH: "📱", M_CASH: "📲",
};

type FilterTab = "ALL" | "PENDING" | "PAID" | "REFUNDED";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL",      label: "All" },
  { key: "PENDING",  label: "Pending" },
  { key: "PAID",     label: "Paid" },
  { key: "REFUNDED", label: "Refunded" },
];

function PaymentCard({ payment, onInvoice }: { payment: PaymentDTO; onInvoice: (id: string) => void }) {
  const statusColor = STATUS_COLOR[payment.status] ?? "#94a3b8";
  const icon        = METHOD_ICON[payment.method] ?? "💰";

  return (
    <View style={[styles.card, payment.isOverdue && styles.overdueCard]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.paymentNumber}>{payment.paymentNumber}</Text>
          <Text style={styles.paymentType}>{payment.paymentType.replace("_", " ")}</Text>
          {payment.description ? (
            <Text style={styles.description} numberOfLines={1}>{payment.description}</Text>
          ) : null}
          <Text style={styles.methodRow}>
            {icon} {payment.method.replace("_", " ")}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>{payment.finalAmountFormatted}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{payment.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.dateText}>
          {payment.paidAt
            ? new Date(payment.paidAt).toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" })
            : new Date(payment.createdAt).toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" })}
        </Text>
        {payment.isOverdue && (
          <Text style={styles.overdueText}>⚠ Overdue</Text>
        )}
        {payment.invoiceNumber && payment.status === "PAID" && (
          <TouchableOpacity onPress={() => onInvoice(payment.id)} style={styles.invoiceBtn}>
            <Text style={styles.invoiceBtnText}>📄 Invoice</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function BillingScreen() {
  const memberId = null; // Replace with current member ID from auth context
  const { payments, isLoading, refetch } = useMyPayments(memberId);
  const { getInvoiceUrl, loading: invoiceLoading } = useDownloadInvoice();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const filtered = payments.filter((p: PaymentDTO) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return p.status === "PENDING";
    if (activeTab === "PAID")    return p.status === "PAID";
    if (activeTab === "REFUNDED") return p.status === "REFUNDED";
    return true;
  });

  const totalPaid    = payments.filter((p: PaymentDTO) => p.status === "PAID").reduce((s: number, p: PaymentDTO) => s + p.amountLkr, 0);
  const totalPending = payments.filter((p: PaymentDTO) => p.status === "PENDING").reduce((s: number, p: PaymentDTO) => s + p.amountLkr, 0);

  const handleInvoice = async (paymentId: string) => {
    const url = await getInvoiceUrl(paymentId);
    if (!url) {
      Alert.alert("Invoice", "Could not load invoice");
      return;
    }
    const fullUrl = `http://localhost:9090/api/v1/billing/invoices`;
    Alert.alert("Invoice", "Invoice PDF URL copied.\n\n" + url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Billing</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: "#22c55e" }]}>
            Rs. {(totalPaid / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={[styles.summaryCard, { marginLeft: 12 }]}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            Rs. {(totalPending / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {FILTER_TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, activeTab === key && styles.tabBtnActive]}
            onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No payments found</Text>
          <Text style={styles.emptySubText}>Your payment history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#10b981" />}
          renderItem={({ item }: { item: PaymentDTO }) => (
            <PaymentCard payment={item} onInvoice={handleInvoice} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#f8fafc" },
  header:       { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:  { fontSize: 22, fontWeight: "700", color: "#1e293b" },
  summaryRow:   { flexDirection: "row", paddingHorizontal: 20, marginBottom: 12 },
  summaryCard:  { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "700" },
  tabRow:       { flexDirection: "row", paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  tabBtn:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: "#e2e8f0" },
  tabBtnActive: { backgroundColor: "#10b981" },
  tabText:      { fontSize: 13, fontWeight: "500", color: "#64748b" },
  tabTextActive:{ color: "#fff" },
  list:         { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  loader:       { flex: 1, justifyContent: "center" },
  empty:        { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: "600", color: "#475569" },
  emptySubText: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  card:         { backgroundColor: "#fff", borderRadius: 14, padding: 16,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  overdueCard:  { borderLeftWidth: 3, borderLeftColor: "#ef4444" },
  cardTop:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  cardLeft:     { flex: 1, marginRight: 12 },
  cardRight:    { alignItems: "flex-end" },
  paymentNumber:{ fontSize: 12, fontFamily: "monospace", color: "#64748b", marginBottom: 2 },
  paymentType:  { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  description:  { fontSize: 12, color: "#64748b", marginTop: 2 },
  methodRow:    { fontSize: 12, color: "#94a3b8", marginTop: 4 },
  amount:       { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: "600" },
  cardBottom:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                  paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  dateText:     { fontSize: 12, color: "#94a3b8" },
  overdueText:  { fontSize: 11, color: "#ef4444", fontWeight: "500" },
  invoiceBtn:   { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#f0fdf4",
                  borderRadius: 8 },
  invoiceBtnText:{ fontSize: 12, color: "#16a34a", fontWeight: "500" },
});
