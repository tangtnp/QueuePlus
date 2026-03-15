import { api } from "./client";
import type { CreateQueuePayload, MyQueueItem } from "../types/queue";

const normalizeQueueList = (payload: any): MyQueueItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.queues)) return payload.queues;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeQueue = (payload: any): MyQueueItem | null => {
  if (payload?.queue) return payload.queue;
  if (payload?.data?.queue) return payload.data.queue;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload ?? null;
};

export const queueApi = {
  async getMyQueues(): Promise<MyQueueItem[]> {
    const response = await api.get("/my/queues");
    return normalizeQueueList(response.data);
  },

  async getQueueById(id: string): Promise<MyQueueItem | null> {
    const response = await api.get(`/queues/${id}`);
    return normalizeQueue(response.data);
  },

  async createQueue(payload: CreateQueuePayload) {
    const response = await api.post("/queues", payload);
    return response.data;
  },
};