import { api } from "./client";
import type {
  QueueListResponse,
  QueueStats,
} from "../types/queue";

interface GetQueuesParams {
  page?: number;
  limit?: number;
  branchId?: string;
}

const normalizeQueueListResponse = (payload: any): QueueListResponse => {
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    filters: payload?.filters ?? {},
    pagination: payload?.pagination ?? {
      hasNext: false,
      hasPrev: false,
      limit: 10,
      page: 1,
      totalCount: 0,
      totalPages: 1,
    },
  };
};

const normalizeStats = (payload: any): QueueStats => {
  if (payload?.stats) return payload.stats;
  if (payload?.data?.stats) return payload.data.stats;
  if (payload?.data) return payload.data;
  return payload ?? {};
};

export const queueApi = {
  async getQueues(params?: GetQueuesParams): Promise<QueueListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.branchId) searchParams.set("branchId", params.branchId);

    const query = searchParams.toString();
    const url = query ? `/queues?${query}` : "/queues";

    const response = await api.get(url);
    return normalizeQueueListResponse(response.data);
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