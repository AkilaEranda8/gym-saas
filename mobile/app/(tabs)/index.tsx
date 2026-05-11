import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>💪</Text>
        <Text style={styles.title}>PowerHouse</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Links</Text>
          <Text style={styles.tip}>→ Classes tab to browse & book classes</Text>
          <Text style={styles.tip}>→ Bookings tab to view your upcoming sessions</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: "#080d16" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  logo:      { fontSize: 64 },
  title:     { fontSize: 32, fontWeight: "800", color: "#e2e8f0", letterSpacing: 1 },
  subtitle:  { fontSize: 16, color: "#475569", textAlign: "center" },
  card: {
    marginTop: 24, width: "100%", backgroundColor: "#111827",
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#1e293b", gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#f59e0b", marginBottom: 4 },
  tip:       { fontSize: 14, color: "#94a3b8" },
});
