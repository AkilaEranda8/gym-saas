import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../src/lib/api";

const COLORS = {
  bg:      "#080d16",
  surface: "#0f172a",
  card:    "#111827",
  border:  "#1e293b",
  gold:    "#f59e0b",
  text:    "#e2e8f0",
  muted:   "#475569",
};

export default function LoginScreen() {
  const router                    = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post<{ access_token: string; refresh_token: string }>(
        "/api/v1/auth/login",
        { username: email.trim(), password }
      );
      await AsyncStorage.setItem("access_token",  res.data.access_token);
      await AsyncStorage.setItem("refresh_token", res.data.refresh_token);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Invalid credentials";
      Alert.alert("Login Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>💪</Text>
          <Text style={styles.logoTitle}>PowerHouse</Text>
          <Text style={styles.logoSub}>Gym Management</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, isLoading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#000" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.bg },
  container:  { flex: 1, justifyContent: "center", padding: 24, gap: 32 },
  logoWrap:   { alignItems: "center", gap: 8 },
  logoEmoji:  { fontSize: 60 },
  logoTitle:  { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: 1 },
  logoSub:    { fontSize: 14, color: COLORS.muted },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 24, gap: 20,
  },
  cardTitle:  { fontSize: 20, fontWeight: "700", color: COLORS.text },
  fieldWrap:  { gap: 6 },
  label:      { fontSize: 13, fontWeight: "600", color: COLORS.muted },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: COLORS.text, fontSize: 15,
  },
  btn: {
    backgroundColor: COLORS.gold, borderRadius: 14,
    paddingVertical: 15, alignItems: "center",
  },
  btnText:    { color: "#000", fontWeight: "800", fontSize: 16 },
});
