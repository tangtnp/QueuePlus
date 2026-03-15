import { router } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const [avatarBorderColor, setAvatarBorderColor] = useState("#2563eb");

  const colors = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#f59e0b"];

  const handleRandomBorderColor = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setAvatarBorderColor(randomColor);
  };

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
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Image
          source={{ uri: "https://i.pravatar.cc/200?img=12" }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 4,
            borderColor: avatarBorderColor,
            marginBottom: 12,
          }}
        />

        <TouchableOpacity
          onPress={handleRandomBorderColor}
          style={{
            marginBottom: 12,
            backgroundColor: "#e2e8f0",
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontWeight: "600" }}>Name: {user?.name || "-"}</Text>
        </TouchableOpacity>
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
          justifyContent: "center"
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}