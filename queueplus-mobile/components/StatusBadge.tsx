import { Text, View } from "react-native";

interface StatusBadgeProps {
  status?: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();

  const styles = getBadgeStyle(normalized);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: styles.backgroundColor,
        marginTop: 2,
      }}
    >
      <Text
        style={{
          color: styles.color,
          fontSize: 12,
          fontWeight: "700",
          textTransform: "capitalize",
        }}
      >
        {normalized || "-"}
      </Text>
    </View>
  );
}

function getBadgeStyle(status: string) {
  switch (status) {
    case "waiting":
      return { backgroundColor: "#e2e8f0", color: "#334155" };
    case "called":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    case "serving":
      return { backgroundColor: "#fef3c7", color: "#b45309" };
    case "completed":
      return { backgroundColor: "#dcfce7", color: "#15803d" };
    case "cancelled":
      return { backgroundColor: "#fee2e2", color: "#dc2626" };
    default:
      return { backgroundColor: "#e2e8f0", color: "#334155" };
  }
}