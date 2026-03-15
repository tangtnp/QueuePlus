import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CreateQueuePayload, PendingQueueItem } from "../types/queue";
import { queueApi } from "../api/queue";

const STORAGE_KEY = "queueplus_offline_pending_queues";

export async function getPendingQueues(): Promise<PendingQueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePendingQueues(items: PendingQueueItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function buildFingerprint(payload: CreateQueuePayload) {
  return [
    payload.userId,
    payload.branchId,
    payload.serviceId,
    payload.customerName.trim().toLowerCase(),
  ].join("|");
}

export async function enqueueOfflineQueue(
  payload: CreateQueuePayload
): Promise<PendingQueueItem> {
  const current = await getPendingQueues();
  const fingerprint = buildFingerprint(payload);

  const duplicatedPending = current.find(
    (item) => item.fingerprint === fingerprint && item.syncStatus === "pending"
  );

  if (duplicatedPending) {
    return duplicatedPending;
  }

  const newItem: PendingQueueItem = {
    ...payload,
    localId: `local-${Date.now()}`,
    fingerprint,
    createdAt: new Date().toISOString(),
    syncStatus: "pending",
    retryCount: 0,
  };

  const updated = [newItem, ...current];
  await savePendingQueues(updated);

  return newItem;
}

export async function getPendingQueueById(id: string) {
  const current = await getPendingQueues();
  return current.find((item) => item.localId === id) || null;
}

export async function syncPendingQueues() {
  const current = await getPendingQueues();
  const pendingOnly = current.filter((item) => item.syncStatus === "pending");

  if (pendingOnly.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const results = await Promise.allSettled(
    pendingOnly.map((item) =>
      queueApi.createQueue({
        customerName: item.customerName,
        userId: item.userId,
        branchId: item.branchId,
        serviceId: item.serviceId,
      })
    )
  );

  const failedItems: PendingQueueItem[] = [];

  results.forEach((result, index) => {
    const original = pendingOnly[index];

    if (result.status === "rejected") {
      failedItems.push({
        ...original,
        syncStatus: "pending",
        retryCount: original.retryCount + 1,
      });
    }
  });

  await savePendingQueues(failedItems);

  return {
    syncedCount: pendingOnly.length - failedItems.length,
    failedCount: failedItems.length,
  };
}