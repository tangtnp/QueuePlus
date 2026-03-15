import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../src/store/authStore";

export default function LoginPage() {
  const { user, login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return <Redirect href="/(user)/profile" />;
  }

  const handleLogin = async () => {
    const success = await login({ email, password });

    if (success) {
      router.replace("/(user)/profile");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f8fafc",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 18,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 20 }}>
          QueuePlus Login
        </Text>

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            if (error) clearError();
            setEmail(text);
          }}
          style={{
            borderWidth: 1,
            borderColor: "#cbd5e1",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: "white",
          }}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            if (error) clearError();
            setPassword(text);
          }}
          style={{
            borderWidth: 1,
            borderColor: "#cbd5e1",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: "white",
          }}
        />

        {!!error && (
          <Text style={{ color: "#dc2626", marginBottom: 12 }}>{error}</Text>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600" }}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}