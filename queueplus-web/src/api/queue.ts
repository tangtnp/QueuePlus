import { api } from "./client";
import type { QueueItem, QueueStats } from "../types/queue";

const normalizeQueueList = (payload: any): QueueItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.queues)) return payload.queues;
  if (Array.isArray(payload?.data?.queues)) return payload.data.queues;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeStats = (payload: any): QueueStats => {
  if (payload?.stats) return payload.stats;
  if (payload?.data?.stats) return payload.data.stats;
  if (payload?.data) return payload.data;
  return payload ?? {};
};

export const queueApi = {
  async getQueues(): Promise<QueueItem[]> {
    const response = await api.get("/queues");
    return normalizeQueueList(response.data);
  },

  async getQueueStats(): Promise<QueueStats> {
    const response = await api.get("/dashboard/queue-stats");
    return normalizeStats(response.data);
  },

  async updateQueueStatus(id: string, status: string) {
    const response = await api.patch(`/queues/${id}/status`, { status });
    return response.data;
  },
};