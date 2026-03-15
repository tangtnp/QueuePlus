import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f8fafc" }}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 18,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
          User Profile
        </Text>
        <Text>Name: {user?.name || "-"}</Text>
        <Text>Email: {user?.email || "-"}</Text>
        <Text>User ID: {user?.id || "-"}</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(user)/my-queues")}
        style={{
          backgroundColor: "white",
          borderRadius: 18,
          padding: 18,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>My Queues</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(user)/create-queue")}
        style={{
          backgroundColor: "white",
          borderRadius: 18,
          padding: 18,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Create Queue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#ef4444",
          borderRadius: 12,
          padding: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}