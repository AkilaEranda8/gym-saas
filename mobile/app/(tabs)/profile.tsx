import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["access_token", "refresh_token", "branch_id"]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>My Profile</Text>

        <View style={styles.card}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: "#080d16" },
  container:  { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#f59e0b22", borderWidth: 2, borderColor: "#f59e0b44",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 36 },
  name:       { fontSize: 22, fontWeight: "700", color: "#e2e8f0" },
  card: {
    width: "100%", backgroundColor: "#111827",
    borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#1e293b",
  },
  logoutBtn: {
    paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "#ef444444", alignItems: "center",
  },
  logoutText: { color: "#f87171", fontWeight: "700", fontSize: 15 },
});
