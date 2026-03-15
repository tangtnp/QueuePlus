import { Text, View } from "react-native";
import { useNetworkStore } from "../src/store/networkStore";

export default function NetworkBanner() {
  const { isOnline, isSyncing } = useNetworkStore();

  if (!isOnline) {
    return (
      <View
        style={{
          backgroundColor: "#fee2e2",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#b91c1c", fontWeight: "700" }}>
          Offline mode: new queues will be saved and synced automatically.
        </Text>
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View
        style={{
          backgroundColor: "#dbeafe",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#1d4ed8", fontWeight: "700" }}>
          Online: syncing pending queues...
        </Text>
      </View>
    );
  }

  return null;
}