import { api } from "./client";
import type { CreateQueuePayload, MyQueueItem } from "../types/queue";

const normalizeQueueList = (payload: any): MyQueueItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.queues)) return payload.queues;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const queueApi = {
  async getMyQueues(): Promise<MyQueueItem[]> {
    const response = await api.get("/my/queues");
    return normalizeQueueList(response.data);
  },

  async createQueue(payload: CreateQueuePayload) {
    const response = await api.post("/queues", payload);
    return response.data;
  },
};