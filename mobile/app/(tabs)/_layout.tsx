import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#475569",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="classes"
        options={{ title: "Classes", tabBarLabel: "Classes" }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{ title: "My Bookings", tabBarLabel: "Bookings" }}
      />
      <Tabs.Screen
        name="trainers"
        options={{ title: "Trainers", tabBarLabel: "Trainers" }}
      />
      <Tabs.Screen
        name="my-sessions"
        options={{ title: "My Sessions", tabBarLabel: "Sessions" }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: "Shop", tabBarLabel: "Shop" }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Orders", tabBarLabel: "Orders" }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: "Nutrition", tabBarLabel: "Nutrition" }}
      />
      <Tabs.Screen
        name="billing"
        options={{ title: "Billing", tabBarLabel: "Billing" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarLabel: "Profile" }}
      />
    </Tabs>
  );
}
