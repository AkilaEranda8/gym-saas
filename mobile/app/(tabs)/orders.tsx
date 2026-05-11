import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Modal, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useMyOrders, useOrderDetail,
  MemberOrderHistoryDTO, OrderStatus, STATUS_COLOR,
} from "../../src/hooks/useShop";

const MEMBER_ID: string | null = null;

type FilterTab = OrderStatus | "ALL";
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL",       label: "All" },
  { key: "COMPLETED", label: "Completed" },
  { key: "PENDING",   label: "Pending" },
  { key: "REFUNDED",  label: "Refunded" },
];

function OrderDetailSheet({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { order, loading } = useOrderDetail(orderId);

  return (
    <Modal visible animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={detailStyles.backdrop}>
        <View style={detailStyles.sheet}>
          <View style={detailStyles.handle} />
          <View style={detailStyles.header}>
            <Text style={detailStyles.title}>
              {loading ? "Loading..." : `Order #${order?.orderNumber}`}
            </Text>
            <TouchableOpacity onPress={onClose} style={detailStyles.closeBtn}>
              <Text style={detailStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator color="#f59e0b" />
            </View>
          ) : order ? (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Status row */}
              <View style={detailStyles.statusRow}>
                <View style={[detailStyles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + "22" }]}>
                  <Text style={[detailStyles.statusText, { color: STATUS_COLOR[order.status] }]}>
                    {order.status}
                  </Text>
                </View>
                <Text style={detailStyles.paymentMethod}>{order.paymentMethod.replace("_", " ")}</Text>
              </View>

              {/* Items */}
              <Text style={detailStyles.sectionTitle}>Items</Text>
              {order.items.map((item) => (
                <View key={item.id} style={detailStyles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={detailStyles.itemName}>{item.productName}</Text>
                    <Text style={detailStyles.itemUnit}>{item.unitPriceFormatted} × {item.quantity}</Text>
                  </View>
                  <Text style={detailStyles.itemTotal}>{item.totalFormatted}</Text>
                </View>
              ))}

              {/* Total */}
              <View style={detailStyles.totalRow}>
                <Text style={detailStyles.totalLabel}>Total</Text>
                <Text style={detailStyles.totalValue}>{order.totalFormatted}</Text>
              </View>

              {/* Refund reason */}
              {order.refundReason && (
                <View style={detailStyles.refundBox}>
                  <Text style={detailStyles.refundTitle}>Refund Reason</Text>
                  <Text style={detailStyles.refundReason}>{order.refundReason}</Text>
                </View>
              )}

              {/* Date */}
              <Text style={detailStyles.dateText}>
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export default function OrdersScreen() {
  const [filter, setFilter]         = useState<FilterTab>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { orders, loading, refetch } = useMyOrders(MEMBER_ID);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const renderOrder = ({ item }: { item: MemberOrderHistoryDTO }) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => setSelectedId(item.id)} activeOpacity={0.85}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + "22" }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.orderItems} numberOfLines={2}>{item.itemsSummary}</Text>

      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={styles.orderFooterRight}>
          <Text style={styles.orderPayment}>{item.paymentMethod.replace("_", " ")}</Text>
          <Text style={styles.orderTotal}>{item.totalFormatted}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{filtered.length} orders</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}>
        {FILTER_TABS.map((ft) => (
          <TouchableOpacity key={ft.key}
            style={[styles.filterTab, filter === ft.key && styles.filterTabActive]}
            onPress={() => setFilter(ft.key)}>
            <Text style={[styles.filterTabText, filter === ft.key && styles.filterTabTextActive]}>
              {ft.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#f59e0b" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#f59e0b" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyText}>No orders found</Text>
              {MEMBER_ID === null && (
                <Text style={styles.emptySubtext}>Sign in to see your order history</Text>
              )}
            </View>
          }
          renderItem={renderOrder}
        />
      )}

      {/* Detail modal */}
      {selectedId && (
        <OrderDetailSheet orderId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#f8fafc" },
  headerSub: { fontSize: 13, color: "#64748b", marginTop: 2 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#1e293b", borderRadius: 20, borderWidth: 1, borderColor: "#334155" },
  filterTabActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  filterTabText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  filterTabTextActive: { color: "#0f172a" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12 },
  orderCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#334155" },
  orderHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  orderNumber: { color: "#94a3b8", fontSize: 12, fontFamily: "monospace" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  orderItems: { color: "#cbd5e1", fontSize: 13, marginBottom: 10 },
  orderFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderDate: { color: "#64748b", fontSize: 12 },
  orderFooterRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderPayment: { color: "#64748b", fontSize: 11, backgroundColor: "#0f172a", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  orderTotal: { color: "#f59e0b", fontSize: 15, fontWeight: "700" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: "#475569", fontSize: 16, fontWeight: "600" },
  emptySubtext: { color: "#334155", fontSize: 13, marginTop: 6 },
});

const detailStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#0f172a", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: "#334155", borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  title: { fontSize: 17, fontWeight: "700", color: "#f8fafc" },
  closeBtn: { padding: 6 },
  closeBtnText: { color: "#94a3b8", fontSize: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  paymentMethod: { color: "#64748b", fontSize: 12, backgroundColor: "#1e293b", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sectionTitle: { color: "#94a3b8", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  itemName: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  itemUnit: { color: "#64748b", fontSize: 12, marginTop: 2 },
  itemTotal: { color: "#f59e0b", fontSize: 14, fontWeight: "700" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#334155" },
  totalLabel: { color: "#94a3b8", fontSize: 16, fontWeight: "600" },
  totalValue: { color: "#f59e0b", fontSize: 20, fontWeight: "700" },
  refundBox: { backgroundColor: "#7c3aed22", borderRadius: 12, padding: 14, marginTop: 16 },
  refundTitle: { color: "#a855f7", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  refundReason: { color: "#c4b5fd", fontSize: 13 },
  dateText: { color: "#475569", fontSize: 12, textAlign: "center", marginTop: 20 },
});
