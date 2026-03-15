import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { queueApi } from "../../src/api/queue";
import { branchApi } from "../../src/api/branch";
import { serviceApi } from "../../src/api/service";
import type { MyQueueItem } from "../../src/types/queue";
import type { Branch } from "../../src/types/branch";
import type { ServiceItem } from "../../src/types/service";
import StatusBadge from "../../components/StatusBadge";

export default function MyQueuesPage() {
  const [queues, setQueues] = useState<MyQueueItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchMap = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches]
  );

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.id, service.name])),
    [services]
  );

  const fetchData = async (main = false) => {
    try {
      setError(null);

      if (main) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [queueData, branchData, serviceData] = await Promise.all([
        queueApi.getMyQueues(),
        branchApi.getBranches(),
        serviceApi.getServices(),
      ]);

      setQueues(queueData);
      setBranches(branchData);
      setServices(serviceData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load your queues"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

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
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchData(false)}
        />
      }
    >
      <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 16 }}>
        My Queues
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

      {queues.length === 0 ? (
        <View
          style={{
            backgroundColor: "white",
            padding: 18,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#64748b" }}>No queues found</Text>
        </View>
      ) : (
        queues.map((queue) => (
          <View
            key={queue.id}
            style={{
              backgroundColor: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              {queue.queueNumber || queue.id.slice(-6).toUpperCase()}
            </Text>

            <InfoRow label="Customer" value={queue.customerName || "-"} />
            <InfoRow
              label="Branch"
              value={branchMap.get(queue.branchId || "") || "-"}
            />
            <InfoRow
              label="Service"
              value={serviceMap.get(queue.serviceId || "") || "-"}
            />
            <View style={{ marginBottom: 6 }}>
              <Text style={{ color: "#64748b", fontSize: 12 }}>Status</Text>
              <StatusBadge status={queue.status} />
            </View>
            <InfoRow
              label="Created"
              value={
                queue.createdAt
                  ? new Date(queue.createdAt).toLocaleString()
                  : "-"
              }
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ color: "#64748b", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 15 }}>{value}</Text>
    </View>
  );
}