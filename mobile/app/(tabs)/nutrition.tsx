import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  TextInput, Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useActiveNutritionAssignment,
  useTodayNutritionLog,
  useWaterSummary,
  useLogWater,
  useSupplements,
  LogMeal,
  SupplementSchedule,
} from "../../src/hooks/useNutrition";

const MEMBER_ID: string | null = null; // TODO: replace with auth context member ID

const C = {
  bg:      "#080d16",
  surface: "#0f172a",
  card:    "#111827",
  border:  "#1e293b",
  gold:    "#f59e0b",
  text:    "#e2e8f0",
  muted:   "#475569",
  green:   "#34d399",
  red:     "#f87171",
  blue:    "#60a5fa",
  purple:  "#a855f7",
};

type Tab = "today" | "plan" | "supplements";

function MacroCircle({ value, label, color, total }: { value: number; label: string; color: string; total: number }) {
  const pct = total > 0 ? Math.min(value / total * 100, 100) : 0;
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: color,
        alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <Text style={{ color: C.text, fontWeight: "700", fontSize: 13 }}>{value}</Text>
        <Text style={{ color: C.muted, fontSize: 9 }}>g</Text>
      </View>
      <Text style={{ color: C.muted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color, fontSize: 10, fontWeight: "600" }}>{pct.toFixed(0)}%</Text>
    </View>
  );
}

function WaterBar({ current, target }: { current: number; target: number }) {
  const pct = target > 0 ? Math.min(current / target * 100, 100) : 0;
  const glasses = Math.round(current / 250);
  return (
    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={{ color: C.text, fontWeight: "600" }}>💧 Water Intake</Text>
        <Text style={{ color: C.blue, fontWeight: "700" }}>{(current / 1000).toFixed(1)}L / {(target / 1000).toFixed(1)}L</Text>
      </View>
      <View style={{ backgroundColor: C.border, borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 8 }}>
        <View style={{ width: `${pct}%` as any, height: 8, backgroundColor: C.blue, borderRadius: 8 }} />
      </View>
      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Text key={i} style={{ fontSize: 18 }}>{i < glasses ? "🥤" : "⬜"}</Text>
        ))}
      </View>
    </View>
  );
}

function MealCard({ meal }: { meal: LogMeal }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity onPress={() => setExpanded(!expanded)}
      style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.text, fontWeight: "600", fontSize: 14 }}>{meal.mealName}</Text>
          {meal.timeOfDay && (
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{meal.timeOfDay.replace(/_/g, " ")}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: C.gold, fontWeight: "700", fontSize: 15 }}>{meal.calories} kcal</Text>
          <Text style={{ color: C.muted, fontSize: 11 }}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </View>
      {expanded && meal.foodItems?.length > 0 && (
        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, gap: 6 }}>
          {meal.foodItems.map(fi => (
            <View key={fi.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: C.text, fontSize: 12, flex: 1 }}>{fi.foodName} — {fi.quantityG}g</Text>
              <Text style={{ color: C.gold, fontSize: 12, fontWeight: "600" }}>{Math.round(Number(fi.calories))} kcal</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

function SupplementRow({ s }: { s: SupplementSchedule }) {
  const timingColors: Record<string, string> = {
    MORNING: C.gold, PRE_WORKOUT: C.green, POST_WORKOUT: C.blue,
    WITH_MEALS: C.purple, BEFORE_BED: C.muted, ANYTIME: C.text,
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: C.border }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontWeight: "600", fontSize: 14 }}>{s.supplementName}</Text>
        {s.dosage && <Text style={{ color: C.muted, fontSize: 12 }}>{s.dosage}</Text>}
      </View>
      <View style={{ backgroundColor: C.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ color: timingColors[s.timing] ?? C.text, fontSize: 11, fontWeight: "600" }}>{s.timingDisplay}</Text>
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const [tab, setTab]           = useState<Tab>("today");
  const [waterInput, setWaterInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { assignment, isLoading: assignLoading }       = useActiveNutritionAssignment(MEMBER_ID);
  const { log, isLoading: logLoading, refetch: refetchLog } = useTodayNutritionLog(MEMBER_ID);
  const { summary: waterSummary, refetch: refetchWater }    = useWaterSummary(MEMBER_ID);
  const { supplements, isLoading: suppLoading }             = useSupplements(MEMBER_ID);
  const { logWater, isLoading: waterLogging }               = useLogWater();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchLog(), refetchWater()]);
    setRefreshing(false);
  }, [refetchLog, refetchWater]);

  const handleLogWater = async () => {
    const ml = parseInt(waterInput);
    if (!MEMBER_ID || isNaN(ml) || ml <= 0) { Alert.alert("Enter a valid amount"); return; }
    const ok = await logWater(MEMBER_ID, ml);
    if (ok) { setWaterInput(""); refetchWater(); refetchLog(); }
    else Alert.alert("Failed to log water");
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "today",       label: "Today",       icon: "📋" },
    { id: "plan",        label: "My Plan",     icon: "🥗" },
    { id: "supplements", label: "Supplements", icon: "💊" },
  ];

  const isLoading = assignLoading || logLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ color: C.text, fontSize: 24, fontWeight: "800", letterSpacing: 0.5 }}>Nutrition</Text>
        {assignment && (
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
            {assignment.planName} · {assignment.targetCalories} kcal target
          </Text>
        )}
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 16 }}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
              paddingVertical: 9, borderRadius: 12, gap: 5,
              backgroundColor: tab === t.id ? C.gold : C.card,
              borderWidth: 1, borderColor: tab === t.id ? C.gold : C.border }}>
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={{ color: tab === t.id ? C.bg : C.muted, fontSize: 12, fontWeight: "700" }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={C.gold} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── Today Tab ── */}
            {tab === "today" && (
              <View style={{ gap: 16 }}>
                {/* Calorie Summary */}
                <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ color: C.muted, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Today's Calories</Text>
                  <View style={{ alignItems: "center", marginBottom: 16 }}>
                    <Text style={{ color: C.gold, fontSize: 44, fontWeight: "900" }}>{log?.totalCalories ?? 0}</Text>
                    <Text style={{ color: C.muted, fontSize: 14 }}>of {assignment?.targetCalories ?? "—"} kcal</Text>
                    {log?.calorieDeficit != null && (
                      <Text style={{ color: log.calorieDeficit > 0 ? C.green : C.red, fontSize: 13, marginTop: 4, fontWeight: "600" }}>
                        {log.calorieDeficit > 0 ? `${log.calorieDeficit} kcal remaining` : `${Math.abs(log.calorieDeficit)} kcal over`}
                      </Text>
                    )}
                  </View>
                  {log && assignment && (
                    <View style={{ backgroundColor: C.border, borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 16 }}>
                      <View style={{
                        width: `${Math.min((log.totalCalories / (assignment.targetCalories ?? 1)) * 100, 100)}%` as any,
                        height: 6, backgroundColor: C.gold, borderRadius: 8
                      }} />
                    </View>
                  )}
                  <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                    <MacroCircle value={Math.round(Number(log?.totalProteinG ?? 0))} label="Protein" color={C.red} total={assignment?.targetProteinG ?? 150} />
                    <MacroCircle value={Math.round(Number(log?.totalCarbsG ?? 0))} label="Carbs" color={C.gold} total={assignment?.targetCarbsG ?? 200} />
                    <MacroCircle value={Math.round(Number(log?.totalFatG ?? 0))} label="Fat" color={C.purple} total={assignment?.targetFatG ?? 65} />
                  </View>
                </View>

                {/* Water */}
                {waterSummary && <WaterBar current={waterSummary.totalMl} target={waterSummary.targetMl} />}

                {/* Log Water */}
                <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ color: C.text, fontWeight: "600", marginBottom: 10 }}>Log Water</Text>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {[250, 500, 750].map(ml => (
                      <TouchableOpacity key={ml} onPress={() => setWaterInput(String(ml))}
                        style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: waterInput === String(ml) ? C.blue : C.border,
                          alignItems: "center" }}>
                        <Text style={{ color: waterInput === String(ml) ? C.bg : C.text, fontSize: 13, fontWeight: "600" }}>{ml}ml</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                    <TextInput
                      style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border,
                        color: C.text, paddingHorizontal: 12, height: 44, fontSize: 14 }}
                      placeholder="Custom ml…"
                      placeholderTextColor={C.muted}
                      keyboardType="number-pad"
                      value={waterInput}
                      onChangeText={setWaterInput}
                    />
                    <TouchableOpacity onPress={handleLogWater} disabled={waterLogging}
                      style={{ paddingHorizontal: 18, height: 44, borderRadius: 10, backgroundColor: C.blue,
                        alignItems: "center", justifyContent: "center", opacity: waterLogging ? 0.6 : 1 }}>
                      {waterLogging ? <ActivityIndicator size="small" color={C.bg} /> :
                        <Text style={{ color: C.bg, fontWeight: "700", fontSize: 14 }}>Log</Text>}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Meals */}
                {(log?.meals?.length ?? 0) > 0 && (
                  <View>
                    <Text style={{ color: C.text, fontWeight: "700", fontSize: 16, marginBottom: 12 }}>Today's Meals</Text>
                    {log!.meals.map(meal => <MealCard key={meal.id} meal={meal} />)}
                  </View>
                )}

                {(log?.meals?.length ?? 0) === 0 && (
                  <View style={{ alignItems: "center", paddingVertical: 32 }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>🍽️</Text>
                    <Text style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>No meals logged today{"\n"}Start tracking your nutrition!</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── My Plan Tab ── */}
            {tab === "plan" && (
              <View style={{ gap: 14 }}>
                {!assignment ? (
                  <View style={{ alignItems: "center", paddingVertical: 48 }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>🥗</Text>
                    <Text style={{ color: C.text, fontWeight: "700", fontSize: 18, textAlign: "center" }}>No Active Plan</Text>
                    <Text style={{ color: C.muted, fontSize: 14, textAlign: "center", marginTop: 8 }}>Ask your trainer to assign a nutrition plan</Text>
                  </View>
                ) : (
                  <>
                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
                      <Text style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Current Plan</Text>
                      <Text style={{ color: C.text, fontSize: 20, fontWeight: "800" }}>{assignment.planName}</Text>
                      <Text style={{ color: C.gold, fontSize: 13, marginTop: 4 }}>
                        {assignment.planGoal?.replace(/_/g, " ") ?? ""}
                      </Text>
                    </View>

                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
                      <Text style={{ color: C.muted, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Daily Targets</Text>
                      {[
                        { label: "Calories", value: `${assignment.targetCalories ?? "—"} kcal`, color: C.gold },
                        { label: "Protein",  value: `${assignment.targetProteinG ?? "—"} g`,    color: C.red },
                        { label: "Carbs",    value: `${assignment.targetCarbsG ?? "—"} g`,      color: C.gold },
                        { label: "Fat",      value: `${assignment.targetFatG ?? "—"} g`,        color: C.purple },
                      ].map(item => (
                        <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between",
                          paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                          <Text style={{ color: C.muted, fontSize: 14 }}>{item.label}</Text>
                          <Text style={{ color: item.color, fontSize: 14, fontWeight: "700" }}>{item.value}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
                      <Text style={{ color: C.muted, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Duration</Text>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View>
                          <Text style={{ color: C.muted, fontSize: 11 }}>Start</Text>
                          <Text style={{ color: C.text, fontWeight: "600" }}>{assignment.startDate}</Text>
                        </View>
                        {assignment.endDate && (
                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={{ color: C.muted, fontSize: 11 }}>End</Text>
                            <Text style={{ color: C.text, fontWeight: "600" }}>{assignment.endDate}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* ── Supplements Tab ── */}
            {tab === "supplements" && (
              <View>
                {suppLoading ? (
                  <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
                ) : supplements.length === 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 48 }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>💊</Text>
                    <Text style={{ color: C.text, fontWeight: "700", fontSize: 18, textAlign: "center" }}>No Supplements</Text>
                    <Text style={{ color: C.muted, fontSize: 14, textAlign: "center", marginTop: 8 }}>Your supplement schedule will appear here</Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: C.border }}>
                    {supplements.map(s => <SupplementRow key={s.id} s={s} />)}
                  </View>
                )}

                {supplements.length > 0 && (
                  <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginTop: 16 }}>
                    <Text style={{ color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Timing Legend</Text>
                    {[
                      { key: "MORNING",      label: "Morning",      color: C.gold },
                      { key: "PRE_WORKOUT",  label: "Pre Workout",  color: C.green },
                      { key: "POST_WORKOUT", label: "Post Workout", color: C.blue },
                      { key: "WITH_MEALS",   label: "With Meals",   color: C.purple },
                      { key: "BEFORE_BED",   label: "Before Bed",   color: C.muted },
                    ].map(item => (
                      <View key={item.key} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                        <Text style={{ color: C.text, fontSize: 13 }}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
