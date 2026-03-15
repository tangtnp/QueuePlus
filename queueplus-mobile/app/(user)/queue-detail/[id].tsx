import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { queueApi } from "../../../src/api/queue";
import { branchApi } from "../../../src/api/branch";
import { serviceApi } from "../../../src/api/service";
import { getPendingQueueById } from "../../../src/utils/offlineQueue";
import type { Branch } from "../../../src/types/branch";
import type { ServiceItem } from "../../../src/types/service";
import type { MyQueueItem } from "../../../src/types/queue";
import StatusBadge from "../../../components/StatusBadge";
import NetworkBanner from "../../../components/NetworkBanner";

export default function QueueDetailPage() {
  const { id, queueNumber } = useLocalSearchParams<{
    id: string;
    queueNumber?: string;
  }>();

  const [queue, setQueue] = useState<MyQueueItem | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const branchMap = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches]
  );

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.id, service.name])),
    [services]
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setError(null);
        setIsLoading(true);

        if (id.startsWith("local-")) {
          const localQueue = await getPendingQueueById(id);
          if (localQueue) {
            setQueue({
              id: localQueue.localId,
              queueNumber: localQueue.localId.slice(-6).toUpperCase(),
              customerName: localQueue.customerName,
              branchId: localQueue.branchId,
              serviceId: localQueue.serviceId,
              status: "pending_sync",
              createdAt: localQueue.createdAt,
            });
          }
        } else {
          const detail = await queueApi.getQueueById(id);
          setQueue(detail);
        }

        const [branchRes, serviceRes] = await Promise.allSettled([
          branchApi.getBranches(),
          serviceApi.getServices(),
        ]);

        if (branchRes.status === "fulfilled") setBranches(branchRes.value);
        if (serviceRes.status === "fulfilled") setServices(serviceRes.value);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load queue detail"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!queue) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#64748b" }}>Queue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <NetworkBanner />

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
          padding: 18,
          borderRadius: 18,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 12 }}>
          Queue Detail
        </Text>

        <InfoRow
          label="Queue Number"
          value={queue.queueNumber || queueNumber || queue.id.slice(-6).toUpperCase()}
        />
        <InfoRow label="Customer" value={queue.customerName || "-"} />
        <InfoRow
          label="Branch"
          value={branchMap.get(queue.branchId || "") || "-"}
        />
        <InfoRow
          label="Service"
          value={serviceMap.get(queue.serviceId || "") || "-"}
        />

        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: "#64748b", fontSize: 12 }}>Status</Text>
          <StatusBadge status={queue.status} />
        </View>

        <InfoRow
          label="Created At"
          value={queue.createdAt ? new Date(queue.createdAt).toLocaleString() : "-"}
        />
        <InfoRow
          label="Updated At"
          value={queue.updatedAt ? new Date(queue.updatedAt).toLocaleString() : "-"}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#64748b", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}