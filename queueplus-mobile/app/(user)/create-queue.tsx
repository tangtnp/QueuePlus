import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../src/store/authStore";
import { branchApi } from "../../src/api/branch";
import { serviceApi } from "../../src/api/service";
import { queueApi } from "../../src/api/queue";
import type { Branch } from "../../src/types/branch";
import type { ServiceItem } from "../../src/types/service";

export default function CreateQueuePage() {
  const { user } = useAuthStore();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

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
        "Created successfully";

      Alert.alert("Success", `Queue created: ${queueNumber}`);

      setSelectedBranchId("");
      setSelectedServiceId("");
      setServices([]);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 16 }}>
        Create Queue
      </Text>

      {!!error && (
        <View
          style={{
            backgroundColor: "#fef2f2",
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#dc2626" }}>{error}</Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Customer Name</Text>
        <TextInput
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
          style={{
            borderWidth: 1,
            borderColor: "#cbd5e1",
            borderRadius: 12,
            padding: 12,
          }}
        />
      </View>

      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 12 }}>Select Branch</Text>

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
      </View>

      <View
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 12 }}>Select Service</Text>

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
      </View>

      <TouchableOpacity
        onPress={handleCreateQueue}
        disabled={isSubmitting}
        style={{
          backgroundColor: "#2563eb",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          opacity: isSubmitting ? 0.6 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "700" }}>Create Queue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}