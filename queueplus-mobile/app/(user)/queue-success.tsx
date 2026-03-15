import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function QueueSuccessPage() {
  const params = useLocalSearchParams<{
    queueNumber?: string;
    branchName?: string;
    serviceName?: string;
    mode?: string;
  }>();

  const isOffline = params.mode === "offline";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
          {isOffline ? "Queue Saved Offline" : "Queue Created"}
        </Text>

        <Text style={{ color: "#64748b", marginBottom: 20 }}>
          {isOffline
            ? "Your queue has been saved locally and will sync automatically when internet is available."
            : "Your queue has been created successfully."}
        </Text>

        <InfoRow label="Queue Number" value={params.queueNumber || "-"} />
        <InfoRow label="Branch" value={params.branchName || "-"} />
        <InfoRow label="Service" value={params.serviceName || "-"} />

        <TouchableOpacity
          onPress={() => router.replace("/(user)/my-queues")}
          style={{
            marginTop: 24,
            backgroundColor: "#2563eb",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            Go to My Queues
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(user)/profile")}
          style={{
            marginTop: 12,
            backgroundColor: "#e2e8f0",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0f172a", fontWeight: "700" }}>
            Back to Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: "#64748b", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}