import { View } from "react-native";

export default function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.72)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.55)",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      {children}
    </View>
  );
}