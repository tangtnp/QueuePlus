import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useNetworkStore } from "../../src/store/networkStore";
import { branchApi } from "../../src/api/branch";
import { serviceApi } from "../../src/api/service";
import { queueApi } from "../../src/api/queue";
import type { Branch } from "../../src/types/branch";
import type { ServiceItem } from "../../src/types/service";
import GlassCard from "../../components/GlassCard";
import NetworkBanner from "../../components/NetworkBanner";
import { enqueueOfflineQueue } from "../../src/utils/offlineQueue";

export default function CreateQueuePage() {
  const { user } = useAuthStore();
  const { isOnline } = useNetworkStore();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [peopleAhead, setPeopleAhead] = useState("");
  const [avgServiceMinutes, setAvgServiceMinutes] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const safePeopleAhead = Number(peopleAhead) || 0;
  const safeAvgServiceMinutes = Number(avgServiceMinutes) || 0;
  const estimatedWaitMinutes = safePeopleAhead * safeAvgServiceMinutes;

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId),
    [branches, selectedBranchId]
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const fetchBranches = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await branchApi.getBranches();
      setBranches(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load branches"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServicesByBranch = async (branchId: string) => {
    try {
      setSelectedServiceId("");
      setIsLoadingServices(true);
      const data = await serviceApi.getServices(branchId);
      setServices(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load services"
      );
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSelectBranch = async (branchId: string) => {
    setSelectedBranchId(branchId);
    await fetchServicesByBranch(branchId);
  };

  const handleCreateQueue = async () => {
    if (!customerName.trim()) {
      Alert.alert("Validation", "Customer name is required");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!selectedBranchId) {
      Alert.alert("Validation", "Please select a branch");
      return;
    }

    if (!selectedServiceId) {
      Alert.alert("Validation", "Please select a service");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      if (!isOnline) {
        const pendingItem = await enqueueOfflineQueue({
          customerName: customerName.trim(),
          userId: user.id,
          branchId: selectedBranchId,
          serviceId: selectedServiceId,
        });

        router.replace({
          pathname: "/(user)/queue-success",
          params: {
            queueNumber: pendingItem.localId.slice(-6).toUpperCase(),
            branchName: selectedBranch?.name || "-",
            serviceName: selectedService?.name || "-",
            mode: "offline",
          },
        });
        return;
      }

      const response = await queueApi.createQueue({
        customerName: customerName.trim(),
        userId: user.id,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
      });

      const queueNumber =
        response?.data?.queueNumber ||
        response?.queueNumber ||
        response?.data?.data?.queueNumber ||
        "Created";

      router.replace({
        pathname: "/(user)/queue-success",
        params: {
          queueNumber,
          branchName: selectedBranch?.name || "-",
          serviceName: selectedService?.name || "-",
          mode: "online",
        },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create queue"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#eef4ff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 16 }}>
          Create Queue
        </Text>

        <NetworkBanner />

        {!!error && (
          <GlassCard>
            <Text style={{ color: "#dc2626", fontWeight: "600" }}>{error}</Text>
          </GlassCard>
        )}

        <GlassCard>
          <Text style={{ fontWeight: "700", marginBottom: 10 }}>
            Customer Name
          </Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
            style={{
              borderWidth: 1,
              borderColor: "#cbd5e1",
              borderRadius: 12,
              padding: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          />
        </GlassCard>

        <GlassCard>
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>
            Select Branch
          </Text>

          {branches.map((branch) => {
            const isSelected = selectedBranchId === branch.id;

            return (
              <TouchableOpacity
                key={branch.id}
                onPress={() => handleSelectBranch(branch.id)}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor: isSelected ? "#dbeafe" : "#f8fafc",
                  borderWidth: 1,
                  borderColor: isSelected ? "#2563eb" : "#e2e8f0",
                }}
              >
                <Text style={{ fontWeight: "600", color: "#0f172a" }}>
                  {branch.name}
                </Text>
                <Text style={{ color: "#64748b", marginTop: 4 }}>
                  {branch.location || "-"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        <GlassCard>
          <Text style={{ fontWeight: "700", marginBottom: 12 }}>
            Select Service
          </Text>

          {isLoadingServices ? (
            <ActivityIndicator />
          ) : selectedBranchId === "" ? (
            <Text style={{ color: "#64748b" }}>Please select a branch first</Text>
          ) : services.length === 0 ? (
            <Text style={{ color: "#64748b" }}>No services found</Text>
          ) : (
            services.map((service) => {
              const isSelected = selectedServiceId === service.id;

              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedServiceId(service.id)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                    backgroundColor: isSelected ? "#dcfce7" : "#f8fafc",
                    borderWidth: 1,
                    borderColor: isSelected ? "#16a34a" : "#e2e8f0",
                  }}
                >
                  <Text style={{ fontWeight: "600", color: "#0f172a" }}>
                    {service.name}
                  </Text>
                  <Text style={{ color: "#64748b", marginTop: 4 }}>
                    {service.description || "-"}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </GlassCard>

        <GlassCard>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
            Queue ETA Calculator
          </Text>
          <Text style={{ color: "#64748b", marginBottom: 14 }}>
            Mock calculation for estimated waiting time
          </Text>

          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            People Ahead
          </Text>
          <TextInput
            value={peopleAhead}
            onChangeText={setPeopleAhead}
            placeholder="e.g. 3"
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: "#cbd5e1",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          />

          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            Average Service Time (minutes)
          </Text>
          <TextInput
            value={avgServiceMinutes}
            onChangeText={setAvgServiceMinutes}
            placeholder="e.g. 5"
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: "#cbd5e1",
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          />

          <View
            style={{
              backgroundColor: "#eff6ff",
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: "#bfdbfe",
            }}
          >
            <Text style={{ color: "#1e3a8a", fontWeight: "700" }}>
              Estimated Wait Time
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontSize: 24,
                fontWeight: "700",
                color: "#2563eb",
              }}
            >
              {estimatedWaitMinutes} min
            </Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          onPress={handleCreateQueue}
          disabled={isSubmitting}
          style={{
            backgroundColor: "#2563eb",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            opacity: isSubmitting ? 0.6 : 1,
            marginBottom: 30,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "700" }}>Create Queue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}